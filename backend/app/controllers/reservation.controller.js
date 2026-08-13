const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const Dish = require("../models/dish.model");
const DiningSession = require("../models/dining-session.model");
const Order = require("../models/order.model");
const RestaurantSetting = require("../models/setting.model");
const AppError = require("../app-error");
const tableEngine = require("../utils/table-engine");
const { generateVietQRUrl, generateCheckInQRUrl } = require("../utils/vietqr");
const { generateUniqueCode } = require("../utils/code-generator");
const { roundMoney } = require("../utils/money");
const { emitEvent } = require("../socket");
const notifier = require("../utils/notifier");
const { logAction } = require("../utils/audit");
const { getPagination, buildPaginationMeta, buildSearchFilter } = require("../utils/pagination");

const STAFF_ROLES = ["staff", "manager", "admin"];

const getRestaurantPaymentSettings = async () => {
  let durationMinutes = 120;
  let defaultDeposit = 100000;
  let bankInfo = {
    bankId: "MB",
    accountNo: "0988776655",
    accountName: "NHA HANG 3 MIEN CUA",
  };

  const settings = await RestaurantSetting.findOne();
  if (settings?.reservation) {
    durationMinutes = settings.reservation.defaultDurationMinutes || durationMinutes;
    if (settings.reservation.defaultDepositAmount !== undefined) {
      defaultDeposit = settings.reservation.defaultDepositAmount;
    }
  }
  if (settings?.bankAccount) bankInfo = settings.bankAccount;

  return { durationMinutes, defaultDeposit, bankInfo };
};

// Tính số tiền cọc sẽ hoàn lại theo chính sách hoàn cọc khi khách hủy
const calculateRefundAmount = (reservation, refundPolicy) => {
  if (reservation.depositStatus !== "PAID" || reservation.depositAmount <= 0) return 0;
  const hoursBefore = (new Date(reservation.startAt).getTime() - Date.now()) / 3600000;
  const { fullRefundHours = 24, partialRefundHours = 2, partialRefundPercent = 50 } = refundPolicy || {};
  if (hoursBefore >= fullRefundHours) return reservation.depositAmount;
  if (hoursBefore >= partialRefundHours) {
    return roundMoney((reservation.depositAmount * partialRefundPercent) / 100);
  }
  return 0;
};

exports.createReservation = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      guestsCount,
      startAt,
      type,
      preOrderDishes,
      notes,
      tableIds,
      durationMinutes: requestedDuration,
    } = req.body;

    const finalName = req.user ? req.user.name : customerName;
    const finalPhone = req.user ? req.user.phone : customerPhone;
    const finalEmail = req.user ? req.user.email : customerEmail;
    const userId = req.user ? req.user._id : null;

    if (!finalName || !finalPhone || !guestsCount || !startAt) {
      return next(new AppError("Vui lòng cung cấp đầy đủ tên, số điện thoại, số khách và thời gian bắt đầu", 400));
    }

    const guests = parseInt(guestsCount, 10);
    if (Number.isNaN(guests) || guests <= 0) {
      return next(new AppError("Số lượng khách phải là số dương hợp lệ", 400));
    }

    const startTime = new Date(startAt);
    if (Number.isNaN(startTime.getTime()) || startTime < new Date()) {
      return next(new AppError("Thời gian bắt đầu phải là thời điểm hợp lệ trong tương lai", 400));
    }

    const settings = await getRestaurantPaymentSettings();
    let durationMinutes = settings.durationMinutes;
    if (type === "EVENT" && requestedDuration) {
      const parsedDuration = parseInt(requestedDuration, 10);
      if (!Number.isNaN(parsedDuration) && parsedDuration > 0) {
        durationMinutes = parsedDuration;
      }
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const occupiedTableIds = await tableEngine.getOccupiedTableIds(startTime, endTime);
    const allTables = await Table.find({ isActive: { $ne: false }, status: { $ne: "MAINTENANCE" } });
    const availableTables = allTables.filter((table) => !occupiedTableIds.has(table._id.toString()));

    let assignedTables = [];
    let isCombined = false;

    if (Array.isArray(tableIds) && tableIds.length > 0) {
      // Khách chủ động chọn bàn cụ thể
      let totalCapacity = 0;
      for (const tid of tableIds) {
        const table = availableTables.find((t) => t._id.toString() === tid.toString());
        if (!table) {
          return next(new AppError("Một số bàn đã chọn không khả dụng trong khung giờ này", 409));
        }
        totalCapacity += table.capacity;
        assignedTables.push(table._id);
      }
      if (totalCapacity < guests) {
        return next(new AppError(`Tổng sức chứa các bàn đã chọn (${totalCapacity}) không đủ cho ${guests} khách`, 400));
      }
      isCombined = assignedTables.length > 1;
    } else {
      const singleMatches = availableTables
        .filter((table) => table.capacity >= guests)
        .sort((a, b) => a.capacity - b.capacity);

      if (singleMatches.length > 0) {
        assignedTables = [singleMatches[0]._id];
      } else {
        const combinations = await tableEngine.findCombinations(availableTables, guests);
        combinations.sort((a, b) => a.totalCapacity - b.totalCapacity);
        if (combinations.length > 0) {
          assignedTables = combinations[0].tables.map((table) => table._id);
          isCombined = true;
        }
      }
    }

    if (assignedTables.length === 0) {
      return next(new AppError("Nhà hàng đã hết bàn đủ chỗ trong khung giờ bạn chọn", 409));
    }

    const formattedDishes = [];
    let preOrderTotal = 0;
    if (Array.isArray(preOrderDishes)) {
      for (const item of preOrderDishes) {
        const dishInfo = await Dish.findById(item.dish);
        if (!dishInfo) return next(new AppError(`Không tìm thấy món ăn với ID: ${item.dish}`, 404));
        if (!dishInfo.availability) return next(new AppError(`Món '${dishInfo.name}' hiện tại đã hết hàng`, 400));

        const quantity = item.quantity || 1;
        preOrderTotal += dishInfo.price * quantity;
        formattedDishes.push({
          dish: item.dish,
          quantity,
          priceAtBooking: dishInfo.price,
        });
      }
    }

    let depositAmount = 0;
    if (preOrderTotal > 0) {
      depositAmount = roundMoney(preOrderTotal * 0.5) + settings.defaultDeposit;
    } else if (guests >= 4) {
      depositAmount = settings.defaultDeposit;
    }

    const reservationCode = await generateUniqueCode(Reservation, "RES", "reservationCode");
    const qrCodeUrl = generateVietQRUrl(
      settings.bankInfo.bankId,
      settings.bankInfo.accountNo,
      settings.bankInfo.accountName,
      depositAmount,
      `COC ${reservationCode}`,
    );
    const checkInQrUrl = generateCheckInQRUrl(reservationCode);

    const newReservation = await Reservation.create({
      reservationCode,
      user: userId,
      customerName: finalName.trim(),
      customerPhone: finalPhone.trim(),
      customerEmail: finalEmail,
      guestsCount: guests,
      startAt: startTime,
      endAt: endTime,
      type: type || "NORMAL",
      status: "CONFIRMED",
      tables: assignedTables,
      preOrderDishes: formattedDishes,
      depositAmount,
      notes,
    });

    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image");

    emitEvent("reservations:changed");
    notifier.notifyReservationCreated(newReservation);

    res.status(201).json({
      status: "success",
      message: isCombined
        ? `Đặt bàn thành công. Hệ thống đã ghép cụm bàn cho đoàn ${guests} người.`
        : "Đặt bàn thành công. Nhà hàng đã giữ chỗ cho bạn.",
      isCombinedTable: isCombined,
      checkInQrUrl,
      deposit: {
        amount: depositAmount,
        status: "UNPAID",
        bankInfo: settings.bankInfo,
        qrCodeUrl,
      },
      data: { reservation: populatedReservation },
    });
  } catch (error) {
    next(error);
  }
};

exports.trackReservation = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { phone } = req.query;

    if (!code) return next(new AppError("Vui lòng cung cấp mã đặt bàn", 400));
    if (!phone || !phone.trim()) {
      return next(new AppError("Vui lòng cung cấp số điện thoại đã dùng khi đặt bàn", 400));
    }

    const reservation = await Reservation.findOne({ reservationCode: code.trim().toUpperCase() })
      .populate("user", "name email phone role")
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image");

    if (!reservation || reservation.customerPhone !== phone.trim()) {
      return next(new AppError("Mã đặt bàn hoặc số điện thoại không đúng", 404));
    }

    const settings = await getRestaurantPaymentSettings();
    const qrCodeUrl = generateVietQRUrl(
      settings.bankInfo.bankId,
      settings.bankInfo.accountNo,
      settings.bankInfo.accountName,
      reservation.depositAmount,
      `COC ${reservation.reservationCode}`,
    );

    // Lấy lượt dùng bữa + đơn món (nếu khách đã check-in) để khách theo dõi trạng thái món
    let session = null;
    let orders = [];
    if (reservation.status === "ARRIVED") {
      session = await DiningSession.findOne({ reservation: reservation._id, status: "ACTIVE" })
        .populate("tables", "tableNumber capacity");
      if (session) {
        orders = await Order.find({ diningSession: session._id })
          .populate("items.dish", "name image")
          .sort({ createdAt: 1 });
      }
    }

    res.status(200).json({
      status: "success",
      checkInQrUrl: generateCheckInQRUrl(reservation.reservationCode),
      deposit: {
        amount: reservation.depositAmount,
        status: reservation.depositStatus,
        bankInfo: settings.bankInfo,
        qrCodeUrl,
      },
      session,
      orders,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));

    const isStaff = req.user && STAFF_ROLES.includes(req.user.role);
    const isOwner = reservation.user && req.user && reservation.user.toString() === req.user._id.toString();
    if (!isStaff && !isOwner) {
      return next(new AppError("Bạn không có quyền hủy đơn đặt bàn này", 403));
    }

    if (["CANCELLED", "COMPLETED"].includes(reservation.status)) {
      return next(new AppError(`Đơn đặt bàn đang ở trạng thái '${reservation.status}', không thể hủy`, 409));
    }

    reservation.status = "CANCELLED";
    reservation.cancellationReason = reason ? reason.trim() : "Khách hàng yêu cầu hủy";
    reservation.tables = [];

    // Tính số tiền cọc được hoàn lại theo chính sách
    const settings = await RestaurantSetting.findOne();
    reservation.refundAmount = calculateRefundAmount(reservation, settings?.refund);
    reservation.refundStatus = reservation.refundAmount > 0 ? "PENDING" : "NONE";

    await reservation.save();

    emitEvent("reservations:changed");
    notifier.notifyReservationCancelled(reservation);
    logAction(req, "CANCEL_RESERVATION", "Reservation", reservation._id, {
      reservationCode: reservation.reservationCode,
      refundAmount: reservation.refundAmount,
    });

    res.status(200).json({
      status: "success",
      message: "Đã hủy đơn đặt bàn thành công",
      refundAmount: reservation.refundAmount,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image")
      .sort({ startAt: -1 });

    // Kèm lượt dùng bữa + đơn món cho các đơn đã check-in (ARRIVED) để khách theo dõi trạng thái món
    const arrivedIds = reservations.filter((r) => r.status === "ARRIVED").map((r) => r._id);
    const sessions = await DiningSession.find({ reservation: { $in: arrivedIds }, status: "ACTIVE" })
      .populate("tables", "tableNumber capacity");

    const sessionMap = new Map(sessions.map((s) => [s.reservation.toString(), s]));

    const orders = await Order.find({ diningSession: { $in: sessions.map((s) => s._id) } })
      .populate("items.dish", "name image")
      .sort({ createdAt: 1 });

    const ordersBySession = new Map();
    orders.forEach((o) => {
      const key = o.diningSession.toString();
      if (!ordersBySession.has(key)) ordersBySession.set(key, []);
      ordersBySession.get(key).push(o);
    });

    const result = reservations.map((r) => {
      const obj = r.toObject();
      const session = sessionMap.get(r._id.toString());
      if (session) {
        obj.session = session;
        obj.orders = ordersBySession.get(session._id.toString()) || [];
      }
      return obj;
    });

    res.status(200).json({
      status: "success",
      results: result.length,
      data: { reservations: result },
    });
  } catch (error) {
    next(error);
  }
};

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

    reservation.depositStatus = "PAID";
    reservation.depositConfirmedAt = new Date();
    reservation.depositConfirmedBy = req.user ? req.user._id : null;
    await reservation.save();

    emitEvent("reservations:changed");
    notifier.notifyDepositConfirmed(reservation);
    logAction(req, "CONFIRM_DEPOSIT", "Reservation", reservation._id, {
      reservationCode: reservation.reservationCode,
      amount: reservation.depositAmount,
    });

    res.status(200).json({
      status: "success",
      message: `Đã xác nhận nhận tiền cọc ${roundMoney(reservation.depositAmount).toLocaleString("vi-VN")}đ thành công`,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 7.b Giả lập nộp cọc thành công cho Demo Đồ Án / Giảng viên theo dõi
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

// 8. Dời lịch đặt bàn (chính chủ hoặc nhân viên)
exports.rescheduleReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startAt } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));

    const isStaff = req.user && STAFF_ROLES.includes(req.user.role);
    const isOwner = reservation.user && req.user && reservation.user.toString() === req.user._id.toString();
    if (!isStaff && !isOwner) {
      return next(new AppError("Bạn không có quyền dời lịch đơn đặt bàn này", 403));
    }

    if (["CANCELLED", "COMPLETED", "ARRIVED"].includes(reservation.status)) {
      return next(new AppError(`Đơn đặt bàn đang ở trạng thái '${reservation.status}', không thể dời lịch`, 409));
    }

    const startTime = new Date(startAt);
    if (Number.isNaN(startTime.getTime()) || startTime < new Date()) {
      return next(new AppError("Thời gian mới phải là thời điểm hợp lệ trong tương lai", 400));
    }

    // Đọc thời lượng và gán lại bàn trống theo khung giờ mới
    const settings = await getRestaurantPaymentSettings();
    const endTime = new Date(startTime.getTime() + settings.durationMinutes * 60000);
    const occupiedTableIds = await tableEngine.getOccupiedTableIds(startTime, endTime);
    const allTables = await Table.find({ isActive: { $ne: false }, status: { $ne: "MAINTENANCE" } });
    const availableTables = allTables.filter((t) => !occupiedTableIds.has(t._id.toString()));

    const singleMatches = availableTables
      .filter((t) => t.capacity >= reservation.guestsCount)
      .sort((a, b) => a.capacity - b.capacity);

    let assignedTables = [];
    if (singleMatches.length > 0) {
      assignedTables = [singleMatches[0]._id];
    } else {
      const combinations = await tableEngine.findCombinations(availableTables, reservation.guestsCount);
      combinations.sort((a, b) => a.totalCapacity - b.totalCapacity);
      if (combinations.length > 0) assignedTables = combinations[0].tables.map((t) => t._id);
    }

    if (assignedTables.length === 0) {
      return next(new AppError("Không còn bàn trống cho khung giờ mới bạn chọn", 409));
    }

    reservation.startAt = startTime;
    reservation.endAt = endTime;
    reservation.tables = assignedTables;
    reservation.status = "CONFIRMED";
    await reservation.save();

    emitEvent("reservations:changed");

    res.status(200).json({
      status: "success",
      message: "Dời lịch đặt bàn thành công",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};
