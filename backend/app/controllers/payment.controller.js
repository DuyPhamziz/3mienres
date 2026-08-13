const Reservation = require("../models/reservation.model");
const Invoice = require("../models/invoice.model");
const DiningSession = require("../models/dining-session.model");
const AppError = require("../app-error");
const config = require("../config");
const vnpay = require("../utils/vnpay");
const momo = require("../utils/momo");
const { emitEvent } = require("../socket");
const { finalizeInvoiceSession } = require("./invoice.controller");

const frontendUrl = config.frontendUrl || "http://localhost:5173";

// 1. Tạo URL thanh toán VNPay cho tiền cọc đặt bàn
exports.createDepositPayment = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn", 404));
    if (reservation.depositAmount <= 0) return next(new AppError("Đơn đặt bàn này không cần nộp cọc", 400));
    if (reservation.depositStatus === "PAID") return next(new AppError("Đơn đặt bàn đã nộp cọc rồi", 409));

    const paymentUrl = vnpay.createPaymentUrl(config.vnpay, {
      amount: reservation.depositAmount,
      txnRef: `${reservation.reservationCode}-${Date.now()}`,
      orderInfo: `COC ${reservation.reservationCode}`,
      orderType: "deposit",
      returnUrl: `${config.vnpay.returnUrl}?target=deposit&reservationId=${reservation._id}`,
    });

    res.status(200).json({ status: "success", paymentUrl });
  } catch (error) {
    next(error);
  }
};

// 2. Callback từ VNPay (sau khi khách thanh toán xong)
exports.vnpayCallback = async (req, res, next) => {
  try {
    const params = { ...req.query };
    const target = params.target;
    const reservationId = params.reservationId;
    const invoiceId = params.invoiceId;

    const isValid = vnpay.verifyCallback(config.vnpay, params);
    const isSuccess = isValid && params.vnp_ResponseCode === "00";

    if (target === "deposit" && reservationId) {
      const reservation = await Reservation.findById(reservationId);
      if (reservation && isSuccess && reservation.depositStatus !== "PAID") {
        reservation.depositStatus = "PAID";
        reservation.depositConfirmedAt = new Date();
        await reservation.save();
        emitEvent("reservations:changed");
      }
      const code = reservation ? reservation.reservationCode : "";
      return res.redirect(`${frontendUrl}/tra-cuu?code=${code}&paid=${isSuccess ? "1" : "0"}`);
    }

    if (target === "invoice" && invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice && isSuccess && invoice.paymentStatus !== "PAID") {
        invoice.paymentStatus = "PAID";
        invoice.paidAt = new Date();
        await invoice.save();

        const session = await DiningSession.findById(invoice.diningSession).populate("reservation");
        if (session && session.status === "ACTIVE") {
          await finalizeInvoiceSession(session, invoice.finalAmount);
        }
        emitEvent("invoices:changed");
      }
      return res.redirect(`${frontendUrl}/admin/pos?paid=${isSuccess ? "1" : "0"}`);
    }

    return res.status(400).json({ status: "error", message: "Tham số callback không hợp lệ" });
  } catch (error) {
    next(error);
  }
};

// 3. Tạo URL thanh toán MoMo cho tiền cọc đặt bàn
exports.createDepositPaymentMomo = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn", 404));
    if (reservation.depositAmount <= 0) return next(new AppError("Đơn đặt bàn này không cần nộp cọc", 400));
    if (reservation.depositStatus === "PAID") return next(new AppError("Đơn đặt bàn đã nộp cọc rồi", 409));

    const payUrl = await momo.createPaymentUrl(config.momo, {
      amount: reservation.depositAmount,
      orderId: `${reservation.reservationCode}-${Date.now()}`,
      orderInfo: `COC ${reservation.reservationCode}`,
      redirectUrl: `${config.momo.redirectUrl}?target=deposit&reservationId=${reservation._id}`,
      ipnUrl: `${config.momo.ipnUrl}?target=deposit&reservationId=${reservation._id}`,
    });

    res.status(200).json({ status: "success", paymentUrl: payUrl });
  } catch (error) {
    next(error);
  }
};

// 4. Callback (redirect) từ MoMo sau khi thanh toán
exports.momoCallback = async (req, res, next) => {
  try {
    const { target, reservationId, resultCode } = req.query;
    const isValid = momo.verifySignature(config.momo.secretKey, req.query);
    const isSuccess = isValid && String(resultCode) === "0";

    if (target === "deposit" && reservationId) {
      const reservation = await Reservation.findById(reservationId);
      if (reservation && isSuccess && reservation.depositStatus !== "PAID") {
        reservation.depositStatus = "PAID";
        reservation.depositConfirmedAt = new Date();
        await reservation.save();
        emitEvent("reservations:changed");
      }
      const code = reservation ? reservation.reservationCode : "";
      return res.redirect(`${frontendUrl}/tra-cuu?code=${code}&paid=${isSuccess ? "1" : "0"}`);
    }

    return res.redirect(`${frontendUrl}/?paid=${isSuccess ? "1" : "0"}`);
  } catch (error) {
    next(error);
  }
};

// 5. IPN (webhook) từ MoMo — cập nhật trạng thái thanh toán
exports.momoIpn = async (req, res, next) => {
  try {
    const { target, reservationId, resultCode } = req.body;
    const isValid = momo.verifySignature(config.momo.secretKey, req.body);
    const isSuccess = isValid && String(resultCode) === "0";

    if (target === "deposit" && reservationId && isSuccess) {
      const reservation = await Reservation.findById(reservationId);
      if (reservation && reservation.depositStatus !== "PAID") {
        reservation.depositStatus = "PAID";
        reservation.depositConfirmedAt = new Date();
        await reservation.save();
        emitEvent("reservations:changed");
      }
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
