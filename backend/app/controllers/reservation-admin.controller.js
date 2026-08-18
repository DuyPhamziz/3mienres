const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const AppError = require("../app-error");
const tableEngine = require("../utils/table-engine");
const { roundMoney } = require("../utils/money");
const { emitEvent } = require("../socket");
const notifier = require("../utils/notifier");
const { logAction } = require("../utils/audit");
const { getPagination, buildPaginationMeta, buildSearchFilter } = require("../utils/pagination");

// 1. Quản lý xem toàn bộ danh sách đơn đặt bàn (Admin/Staff)
exports.getAllReservations = async (req, res, next) => {
  try {
    const { status, date, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.startAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const searchFilter = buildSearchFilter(search, ["reservationCode", "customerName", "customerPhone"]);
    if (searchFilter) Object.assign(filter, searchFilter);

    const { page, limit, skip } = getPagination(req.query);
    const total = await Reservation.countDocuments(filter);

    const reservations = await Reservation.find(filter)
      .populate("user", "name email phone")
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price")
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: reservations.length,
      ...buildPaginationMeta(total, page, limit),
      data: { reservations },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Gán lại bàn ăn dự kiến cho đơn đặt bàn (Admin/Staff)
exports.assignTables = async (req, res, next) => {
  try {
    const { tableIds } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));
    if (!Array.isArray(tableIds) || tableIds.length === 0) {
      return next(new AppError("Vui lòng cung cấp danh sách bàn hợp lệ", 400));
    }

    for (const tableId of tableIds) {
      const table = await Table.findById(tableId);
      if (!table) return next(new AppError(`Bàn với ID '${tableId}' không tồn tại`, 404));
    }

    // Kiểm tra các bàn gán phải nằm cạnh nhau mới ghép được
    if (tableIds.length > 1) {
      const mergeCheck = await tableEngine.validateMergeableTables(tableIds);
      if (!mergeCheck.isValid) {
        return next(new AppError("Các bàn được gán không nằm cạnh nhau nên không thể ghép. Vui lòng chọn bàn kề nhau.", 400));
      }
    }

    reservation.tables = tableIds;
    reservation.status = "CONFIRMED";
    await reservation.save();

    emitEvent("reservations:changed");

    res.status(200).json({
      status: "success",
      message: "Gán bàn dự kiến thành công",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Nhân viên xác nhận khách đã nộp cọc tại quầy hoặc chuyển khoản
exports.confirmDeposit = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));

    if (reservation.depositAmount <= 0) {
      return next(new AppError("Đơn đặt bàn này không yêu cầu tiền cọc", 400));
    }
    if (["CANCELLED", "COMPLETED"].includes(reservation.status)) {
      return next(new AppError(`Đơn đặt bàn đang ở trạng thái '${reservation.status}', không thể xác nhận cọc`, 409));
    }
    if (reservation.depositStatus === "PAID") {
      return next(new AppError("Đơn đặt bàn này đã được xác nhận cọc", 409));
    }

    const { paymentMethod = "CASH" } = req.body;

    reservation.depositStatus = "PAID";
    reservation.depositMethod = paymentMethod;
    reservation.depositConfirmedAt = new Date();
    reservation.depositConfirmedBy = req.user ? req.user._id : null;
    await reservation.save();

    emitEvent("reservations:changed");
    notifier.notifyDepositConfirmed(reservation);
    logAction(req, "CONFIRM_DEPOSIT", "Reservation", reservation._id, {
      reservationCode: reservation.reservationCode,
      amount: reservation.depositAmount,
      method: paymentMethod,
    });

    const methodName = paymentMethod === "CASH" ? "Tiền mặt tại quầy" : "Chuyển khoản VietQR";
    res.status(200).json({
      status: "success",
      message: `Đã xác nhận thu cọc ${roundMoney(reservation.depositAmount).toLocaleString("vi-VN")}đ (${methodName}) thành công!`,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Giả lập nộp cọc thành công cho Demo Đồ Án
exports.demoConfirmDeposit = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));

    if (["CANCELLED", "COMPLETED"].includes(reservation.status)) {
      return next(new AppError(`Đơn đặt bàn đang ở trạng thái '${reservation.status}', không thể nộp cọc`, 409));
    }

    reservation.depositStatus = "PAID";
    reservation.depositConfirmedAt = new Date();
    if (reservation.status === "PENDING") {
      reservation.status = "CONFIRMED";
    }
    await reservation.save();

    emitEvent("reservations:changed");
    notifier.notifyDepositConfirmed(reservation);

    res.status(200).json({
      status: "success",
      message: `[DEMO TEST] Đã giả lập thanh toán nộp cọc ${roundMoney(reservation.depositAmount).toLocaleString("vi-VN")}đ thành công!`,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Nhân viên chủ động đánh dấu đơn là No-Show (Khách không đến nhận bàn)
exports.markNoShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));

    if (["CANCELLED", "COMPLETED", "ARRIVED"].includes(reservation.status)) {
      return next(new AppError(`Đơn đặt bàn đang ở trạng thái '${reservation.status}', không thể đánh dấu No-Show`, 409));
    }

    reservation.status = "NO_SHOW";
    reservation.tables = [];
    reservation.notes = (reservation.notes ? reservation.notes + " | " : "") + (reason ? reason.trim() : "Nhân viên xác nhận khách vắng mặt (No-Show)");
    await reservation.save();

    emitEvent("reservations:changed");
    emitEvent("tables:changed");
    notifier.notifyReservationNoShow(reservation);
    logAction(req, "MANUAL_NO_SHOW", "Reservation", reservation._id, {
      reservationCode: reservation.reservationCode,
      reason,
    });

    res.status(200).json({
      status: "success",
      message: `Đã đánh dấu đơn đặt bàn ${reservation.reservationCode} là Khách vắng mặt (No-Show)`,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Quét nhanh No-Show theo yêu cầu (Admin on-demand scan)
exports.triggerNoShowScan = async (req, res, next) => {
  try {
    const { scanAndExpireNoShowReservations } = require("../jobs/reservation-cron");
    const result = await scanAndExpireNoShowReservations();

    res.status(200).json({
      status: "success",
      message: `Đã hoàn tất quét No-Show. Tổng số đơn quá hạn chuyển sang No-Show: ${result.count}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

