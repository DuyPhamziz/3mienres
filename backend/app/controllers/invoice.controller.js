const Invoice = require("../models/invoice.model");
const DiningSession = require("../models/dining-session.model");
const Order = require("../models/order.model");
const Table = require("../models/table.model");
const User = require("../models/user.model");
const Rank = require("../models/rank.model");
const Voucher = require("../models/voucher.model");
const AppError = require("../app-error");
const { computeDiscount } = require("./voucher.controller");
const { generateInvoiceCode } = require("../utils/code-generator");
const { roundMoney, toNonNegative, toPercent } = require("../utils/money");
const { emitEvent } = require("../socket");
const config = require("../config");
const vnpay = require("../utils/vnpay");
const { logAction } = require("../utils/audit");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

// Hàm Helper: Tự động cộng dồn tiền tích lũy và xét thăng hạng thành viên cho khách
const updateCustomerRank = async (userId, paidAmount) => {
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) return;

  user.totalSpent = (user.totalSpent || 0) + paidAmount;

  // Lấy tất cả các hạng thành viên xếp theo mức chi tiêu tối thiểu từ cao xuống thấp
  const ranks = await Rank.find({ isActive: true }).sort({ minSpent: -1 });
  for (let r of ranks) {
    if (user.totalSpent >= r.minSpent) {
      user.rank = r._id;
      break;
    }
  }

  await user.save();
};

// Hoàn tất hóa đơn: đóng phiên ăn, giải phóng bàn, tích lũy hạng thành viên
const finalizeInvoiceSession = async (session, finalAmount) => {
  const now = new Date();
  session.status = "COMPLETED";
  session.checkOutTime = now;
  await session.save();

  await Table.updateMany({ _id: { $in: session.tables } }, { status: "AVAILABLE" });

  const loyaltyUserId = session.reservation ? session.reservation.user : session.customer;
  if (loyaltyUserId) await updateCustomerRank(loyaltyUserId, finalAmount);

  emitEvent("sessions:changed");
  emitEvent("tables:changed");
};

const momo = require("../utils/momo");

// 1. Xuất hóa đơn & Thanh toán giải phóng bàn
exports.createInvoice = async (req, res, next) => {
  try {
    const { diningSessionId, paymentMethod, discountAmount, taxPercent, notes } = req.body;

    // Lớp 1: Kiểm tra thiếu dữ liệu (400 Bad Request)
    if (!diningSessionId || !paymentMethod) {
      return next(new AppError("Vui lòng cung cấp lượt dùng bữa (diningSessionId) và Phương thức thanh toán (paymentMethod)", 400));
    }

    if (!["CASH", "CARD", "BANK_TRANSFER", "MOMO", "VNPAY"].includes(paymentMethod)) {
      return next(new AppError("Phương thức thanh toán không hợp lệ", 400));
    }

    // Lớp 2: Kiểm tra lượt dùng bữa
    const session = await DiningSession.findById(diningSessionId).populate("reservation");
    if (!session) return next(new AppError("Không tìm thấy lượt dùng bữa này", 404));

    // Xung đột nghiệp vụ: Không cho phép thanh toán 2 lần cho cùng 1 session
    const existingInvoice = await Invoice.findOne({ diningSession: session._id });
    if (existingInvoice) {
      return next(new AppError("Lượt dùng bữa này đã được thanh toán xuất hóa đơn từ trước!", 409));
    }

    // Lấy tất cả các đợt gọi món hợp lệ (Không bị CANCELLED)
    const validOrders = await Order.find({
      diningSession: session._id,
      status: { $ne: "CANCELLED" },
    });

    if (validOrders.length === 0) {
      return next(new AppError("Bàn ăn này chưa gọi bất kỳ món nào, không thể xuất hóa đơn!", 400));
    }

    // Tính tổng tiền các đợt gọi món
    const subtotal = validOrders.reduce((sum, ord) => sum + ord.subtotal, 0);

    const discount = toNonNegative(discountAmount);
    const vatPercent = toPercent(taxPercent);
    const taxAmount = (subtotal * vatPercent) / 100;

    // Xử lý mã voucher giảm giá (nếu có)
    let voucherDiscount = 0;
    let voucherCode = null;
    if (req.body.voucherCode) {
      voucherCode = req.body.voucherCode.trim().toUpperCase();
      const voucher = await Voucher.findOne({ code: voucherCode });
      if (!voucher) return next(new AppError("Mã voucher không tồn tại", 404));
      if (!voucher.isActive) return next(new AppError("Voucher đã bị vô hiệu hóa", 400));

      const nowTime = new Date();
      if (nowTime < voucher.startDate || nowTime > voucher.endDate) {
        return next(new AppError("Voucher đã hết hạn hoặc chưa bắt đầu", 400));
      }
      if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        return next(new AppError("Voucher đã hết lượt sử dụng", 409));
      }

      voucherDiscount = roundMoney(computeDiscount(voucher, subtotal));

      // Tăng lượt dùng một cách nguyên tử để tránh race condition vượt usageLimit
      const updatedVoucher = await Voucher.findOneAndUpdate(
        {
          _id: voucher._id,
          isActive: true,
          $or: [{ usageLimit: 0 }, { usedCount: { $lt: voucher.usageLimit } }],
        },
        { $inc: { usedCount: 1 } },
        { new: true },
      );
      if (!updatedVoucher) {
        return next(new AppError("Voucher đã hết lượt sử dụng", 409));
      }
    }

    const totalDiscount = discount + voucherDiscount;

    // Chỉ trừ tiền cọc khi nhân viên đã xác nhận khách thực sự nộp cọc (depositStatus = PAID)
    let depositDeducted = 0;
    if (
      session.reservation &&
      session.reservation.depositAmount > 0 &&
      session.reservation.depositStatus === "PAID"
    ) {
      depositDeducted = session.reservation.depositAmount;
    }

    // Số tiền thực tế phải thanh toán
    const finalAmount = roundMoney(Math.max(0, subtotal - totalDiscount + taxAmount - depositDeducted));

    // Sinh mã hóa đơn duy nhất (VD: INV-20260813-1029)
    const now = new Date();
    const invoiceCode = await generateInvoiceCode(Invoice, now);

    const isOnlinePayment = paymentMethod === "VNPAY" || paymentMethod === "MOMO";

    // Lớp 3: Tạo Hóa đơn
    const newInvoice = await Invoice.create({
      invoiceCode,
      diningSession: session._id,
      orders: validOrders.map((o) => o._id),
      subtotal,
      discountAmount: totalDiscount,
      taxPercent: vatPercent,
      taxAmount,
      depositDeducted,
      finalAmount,
      paymentMethod,
      voucherCode,
      paymentStatus: isOnlinePayment ? "UNPAID" : "PAID",
      paidAt: isOnlinePayment ? null : now,
      cashier: req.user ? req.user._id : null,
      notes: notes ? notes.trim() : "",
    });

    const populatedInvoice = await Invoice.findById(newInvoice._id)
      .populate("diningSession")
      .populate("orders");

    logAction(req, "CREATE_INVOICE", "Invoice", newInvoice._id, {
      invoiceCode: newInvoice.invoiceCode,
      finalAmount: newInvoice.finalAmount,
      paymentMethod: newInvoice.paymentMethod,
    });

    // Cổng VNPay
    if (paymentMethod === "VNPAY") {
      const paymentUrl = vnpay.createPaymentUrl(config.vnpay, {
        amount: finalAmount,
        txnRef: `${invoiceCode}-${Date.now()}`,
        orderInfo: `THANH TOAN ${invoiceCode}`,
        orderType: "billpayment",
        returnUrl: `${config.vnpay.returnUrl}?target=invoice&invoiceId=${newInvoice._id}`,
      });

      emitEvent("invoices:changed");

      return res.status(201).json({
        status: "success",
        message: "Đã tạo hóa đơn chờ thanh toán qua VNPay",
        paymentUrl,
        data: { invoice: populatedInvoice },
      });
    }

    // Cổng MoMo
    if (paymentMethod === "MOMO") {
      let paymentUrl = "";
      try {
        paymentUrl = await momo.createPaymentUrl(config.momo, {
          amount: finalAmount,
          orderId: `${invoiceCode}-${Date.now()}`,
          orderInfo: `THANH TOAN HOA DON ${invoiceCode}`,
          redirectUrl: `${config.vnpay.returnUrl}?target=invoice&invoiceId=${newInvoice._id}`,
          ipnUrl: `${config.backendUrl || 'http://localhost:3000'}/api/payments/momo/ipn`,
        });
      } catch (err) {
        // Mock fallback MoMo QR cho môi trường dev test
        paymentUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('MOMO_PAYMENT_' + invoiceCode)}`;
      }

      emitEvent("invoices:changed");

      return res.status(201).json({
        status: "success",
        message: "Đã tạo hóa đơn chờ thanh toán qua MoMo",
        paymentUrl,
        data: { invoice: populatedInvoice },
      });
    }

    // Các phương thức trực tiếp (Tiền mặt, quẹt thẻ, CK ngân hàng): hoàn tất phiên ăn & giải phóng bàn ngay
    await finalizeInvoiceSession(session, finalAmount);

    emitEvent("invoices:changed");

    res.status(201).json({
      status: "success",
      message: "Thanh toán thành công! Bàn ăn đã được giải phóng.",
      data: { invoice: populatedInvoice },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Xem chi tiết hóa đơn thanh toán của 1 bàn
exports.getInvoiceBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const invoice = await Invoice.findOne({ diningSession: sessionId })
      .populate({
        path: "diningSession",
        populate: { path: "tables", select: "tableNumber" },
      })
      .populate({
        path: "orders",
        populate: { path: "items.dish", select: "name price image" },
      })
      .populate("cashier", "name email");

    if (!invoice) return next(new AppError("Không tìm thấy hóa đơn cho lượt dùng bữa này", 404));

    res.status(200).json({
      status: "success",
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Quản lý xem toàn bộ danh sách hóa đơn / Báo cáo doanh thu
exports.getAllInvoices = async (req, res, next) => {
  try {
    const { date, paymentMethod, search } = req.query;
    const filter = {};

    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.paidAt = { $gte: startOfDay, $lte: endOfDay };
    }
    if (search && search.trim()) {
      filter.invoiceCode = { $regex: search.trim(), $options: "i" };
    }

    const { page, limit, skip } = getPagination(req.query);
    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .populate("diningSession", "sessionCode customerName customerPhone")
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit);

    // Doanh thu tổng theo toàn bộ kết quả lọc (không chỉ trang hiện tại)
    const totalRevenue = await Invoice.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]);

    res.status(200).json({
      status: "success",
      results: invoices.length,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      ...buildPaginationMeta(total, page, limit),
      data: { invoices },
    });
  } catch (error) {
    next(error);
  }
};

// Export để payment.controller dùng khi VNPay callback xác nhận thanh toán
exports.finalizeInvoiceSession = finalizeInvoiceSession;