const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const Dish = require("../models/dish.model");
const DiningSession = require("../models/dining-session.model");
const Order = require("../models/order.model");
const Invoice = require("../models/invoice.model");
const RestaurantSetting = require("../models/setting.model");
const AppError = require("../app-error");
const tableEngine = require("../utils/table-engine");
const { generateVietQRUrl, generateCheckInQRUrl } = require("../utils/vietqr");
const { generateUniqueCode } = require("../utils/code-generator");
const { roundMoney } = require("../utils/money");
const { emitEvent } = require("../socket");
const notifier = require("../utils/notifier");
const { logAction } = require("../utils/audit");
const { getRestaurantPaymentSettings, calculateRefundAmount } = require("../utils/reservation-policy");
const adminController = require("./reservation-admin.controller");

const STAFF_ROLES = ["staff", "manager", "admin"];

// 1. Tạo đơn đặt bàn online mới
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
      let totalCapacity = 0;
      for (const tid of tableIds) {
        const table = availableTables.find((t) => t._id.toString() === tid.toString());
        if (!table) return next(new AppError("Một số bàn đã chọn không khả dụng trong khung giờ này", 409));
        totalCapacity += table.capacity;
        assignedTables.push(table._id);
      }
      if (totalCapacity < guests) {
        return next(new AppError(`Tổng sức chứa các bàn đã chọn (${totalCapacity}) không đủ cho ${guests} khách`, 400));
      }
      if (assignedTables.length > 1) {
        const mergeCheck = await tableEngine.validateMergeableTables(assignedTables);
        if (!mergeCheck.isValid) {
          return next(new AppError("Các bàn bạn chọn không nằm cạnh nhau nên không thể ghép. Vui lòng chọn các bàn kề nhau.", 400));
        }
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
      isCombined,
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

// 2. Tra cứu trạng thái đơn đặt bàn công khai qua mã code & SĐT
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
      .populate("preOrderDishes.dish", "name price image description category");

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

    const session = await DiningSession.findOne({ reservation: reservation._id })
      .populate("tables", "tableNumber capacity area");
    let orders = [];
    let invoice = null;

    if (session) {
      orders = await Order.find({ diningSession: session._id })
        .populate("items.dish", "name price image category")
        .sort({ createdAt: 1 });
      invoice = await Invoice.findOne({ diningSession: session._id }).populate("cashier", "name");

      if ((session.status === "COMPLETED" || invoice) && reservation.status === "ARRIVED") {
        reservation.status = "COMPLETED";
        await Reservation.findByIdAndUpdate(reservation._id, { status: "COMPLETED" });
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
      invoice,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Hủy đơn đặt bàn
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

// 4. Lấy lịch sử đặt bàn của khách hàng đang đăng nhập
exports.getMyReservations = async (req, res, next) => {
  try {
    const userPhone = req.user.phone ? req.user.phone.trim() : null;
    const query = {
      $or: [
        { user: req.user._id },
        ...(userPhone ? [{ customerPhone: userPhone }] : []),
      ],
    };

    const reservations = await Reservation.find(query)
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image description category")
      .sort({ startAt: -1 });

    const resIds = reservations.map((r) => r._id);
    const sessions = await DiningSession.find({ reservation: { $in: resIds } })
      .populate("tables", "tableNumber capacity area");

    const sessionMap = new Map(sessions.map((s) => [s.reservation.toString(), s]));
    const sessionIds = sessions.map((s) => s._id);

    const orders = await Order.find({ diningSession: { $in: sessionIds } })
      .populate("items.dish", "name price image category")
      .sort({ createdAt: 1 });

    const invoices = await Invoice.find({ diningSession: { $in: sessionIds } })
      .populate("cashier", "name");

    const ordersBySession = new Map();
    orders.forEach((o) => {
      const key = o.diningSession.toString();
      if (!ordersBySession.has(key)) ordersBySession.set(key, []);
      ordersBySession.get(key).push(o);
    });

    const invoiceBySession = new Map();
    invoices.forEach((inv) => {
      invoiceBySession.set(inv.diningSession.toString(), inv);
    });

    const result = [];
    for (const r of reservations) {
      const obj = r.toObject();
      const session = sessionMap.get(r._id.toString());
      if (session) {
        obj.session = session;
        obj.orders = ordersBySession.get(session._id.toString()) || [];
        obj.invoice = invoiceBySession.get(session._id.toString()) || null;

        if ((session.status === "COMPLETED" || obj.invoice) && r.status === "ARRIVED") {
          obj.status = "COMPLETED";
          await Reservation.findByIdAndUpdate(r._id, { status: "COMPLETED" });
        }
      }
      result.push(obj);
    }

    res.status(200).json({
      status: "success",
      results: result.length,
      data: { reservations: result },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Dời lịch đặt bàn
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
