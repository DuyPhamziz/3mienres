const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const Dish = require("../models/dish.model");
const RestaurantSetting = require("../models/setting.model");
const AppError = require("../app-error");
const tableEngine = require("../utils/table-engine");

// Helper: Sinh URL Mã QR VietQR chuyển khoản đặt cọc
const generateVietQRUrl = (bankId, accountNo, accountName, amount, addInfo) => {
  if (!amount || amount <= 0) return null;
  const cleanAddInfo = encodeURIComponent(addInfo);
  const cleanAccountName = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${cleanAddInfo}&accountName=${cleanAccountName}`;
};

// 1. Tạo đơn đặt bàn Online (Có tự động tính Tiền Cọc & Sinh Mã QR VietQR)
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
    } = req.body;

    const finalName = req.user ? req.user.name : customerName;
    const finalPhone = req.user ? req.user.phone : customerPhone;
    const finalEmail = req.user ? req.user.email : customerEmail;
    const userId = req.user ? req.user._id : null;

    if (!finalName || !finalPhone || !guestsCount || !startAt) {
      return next(new AppError("Vui lòng cung cấp đầy đủ: Tên, Số điện thoại, Số lượng khách và Thời gian bắt đầu", 400));
    }

    const guests = parseInt(guestsCount, 10);
    if (isNaN(guests) || guests <= 0) {
      return next(new AppError("Số lượng khách phải là số dương hợp lệ", 400));
    }

    const startTime = new Date(startAt);
    if (isNaN(startTime.getTime()) || startTime < new Date()) {
      return next(new AppError("Thời gian bắt đầu phải là một ngày giờ hợp lệ trong tương lai", 400));
    }

    // Đọc quy định nhà hàng & tài khoản VietQR
    let durationMinutes = 120;
    let defaultDeposit = 100000;
    let bankInfo = { bankId: "MB", accountNo: "0988776655", accountName: "NHA HANG 3 MIEN CUA" };

    const settings = await RestaurantSetting.findOne();
    if (settings) {
      if (settings.reservation) {
        if (settings.reservation.defaultDurationMinutes) durationMinutes = settings.reservation.defaultDurationMinutes;
        if (settings.reservation.defaultDepositAmount !== undefined) defaultDeposit = settings.reservation.defaultDepositAmount;
      }
      if (settings.bankAccount) {
        bankInfo = settings.bankAccount;
      }
    }

    if (type === "EVENT" && req.body.durationMinutes) {
      durationMinutes = parseInt(req.body.durationMinutes, 10);
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // Kiểm tra bàn trống và gợi ý cụm ghép bàn
    const occupiedTableIds = await tableEngine.getOccupiedTableIds(startTime, endTime);
    const allTables = await Table.find({ isActive: { $ne: false }, status: { $ne: "MAINTENANCE" } });
    const availableTables = allTables.filter((t) => !occupiedTableIds.has(t._id.toString()));

    let assignedTables = [];
    let isCombined = false;

    const singleMatches = availableTables
      .filter((t) => t.capacity >= guests)
      .sort((a, b) => a.capacity - b.capacity);

    if (singleMatches.length > 0) {
      assignedTables = [singleMatches[0]._id];
    } else {
      const combinations = await tableEngine.findCombinations(availableTables, guests);
      if (combinations.length > 0) {
        combinations.sort((a, b) => a.totalCapacity - b.totalCapacity);
        assignedTables = combinations[0].tables.map((t) => t._id);
        isCombined = true;
      }
    }

    if (assignedTables.length === 0) {
      return next(new AppError("Rất tiếc, nhà hàng đã hết bàn đủ chỗ cho số lượng khách này trong khung giờ bạn chọn!", 409));
    }

    // Xử lý món đặt trước & tính cọc
    let formattedDishes = [];
    let preOrderTotal = 0;
    if (preOrderDishes && Array.isArray(preOrderDishes) && preOrderDishes.length > 0) {
      for (let item of preOrderDishes) {
        const dishInfo = await Dish.findById(item.dish);
        if (!dishInfo) return next(new AppError(`Không tìm thấy món ăn với ID: ${item.dish}`, 404));
        if (!dishInfo.availability) return next(new AppError(`Món ăn '${dishInfo.name}' hiện tại đã hết hàng!`, 400));
        
        const linePrice = dishInfo.price * (item.quantity || 1);
        preOrderTotal += linePrice;

        formattedDishes.push({
          dish: item.dish,
          quantity: item.quantity || 1,
          priceAtBooking: dishInfo.price,
        });
      }
    }

    // Tính tiền cọc bắt buộc (Mặc định 100k cho đoàn >= 4 người, hoặc 30% tiền món pre-order)
    let depositAmount = 0;
    if (preOrderTotal > 0) {
      depositAmount = Math.round(preOrderTotal * 0.3); // Cọc 30% nếu có đặt trước món
    } else if (guests >= 4) {
      depositAmount = defaultDeposit;
    }

    // Sinh mã đặt bàn
    let reservationCode;
    let isUnique = false;
    while (!isUnique) {
      reservationCode = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await Reservation.findOne({ reservationCode });
      if (!existing) isUnique = true;
    }

    // Sinh Mã QR VietQR để khách quét đặt cọc
    const qrCodeUrl = generateVietQRUrl(
      bankInfo.bankId,
      bankInfo.accountNo,
      bankInfo.accountName,
      depositAmount,
      `COC ${reservationCode}`
    );

    const newReservation = await Reservation.create({
      reservationCode,
      user: userId,
      customerName: finalName,
      customerPhone: finalPhone,
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

    res.status(201).json({
      status: "success",
      message: isCombined 
        ? `Đặt bàn thành công! Hệ thống đã tự động ghép cụm bàn cho đoàn ${guests} người của bạn.`
        : "Đặt bàn thành công! Nhà hàng đã giữ chỗ cho bạn.",
      isCombinedTable: isCombined,
      deposit: {
        amount: depositAmount,
        bankInfo,
        qrCodeUrl,
      },
      data: {
        reservation: populatedReservation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Khách tra cứu đơn đặt bàn
exports.trackReservation = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { phone } = req.query;

    if (!code) return next(new AppError("Vui lòng cung cấp mã đặt bàn", 400));

    const filter = { reservationCode: code.trim().toUpperCase() };
    if (phone) filter.customerPhone = phone.trim();

    const reservation = await Reservation.findOne(filter)
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image");

    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn với mã này", 404));
    }

    let bankInfo = { bankId: "MB", accountNo: "0988776655", accountName: "NHA HANG 3 MIEN CUA" };
    const settings = await RestaurantSetting.findOne();
    if (settings && settings.bankAccount) bankInfo = settings.bankAccount;

    const qrCodeUrl = generateVietQRUrl(
      bankInfo.bankId,
      bankInfo.accountNo,
      bankInfo.accountName,
      reservation.depositAmount,
      `COC ${reservation.reservationCode}`
    );

    res.status(200).json({
      status: "success",
      deposit: {
        amount: reservation.depositAmount,
        bankInfo,
        qrCodeUrl,
      },
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

    if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED") {
      return next(new AppError(`Đơn đặt bàn đã ở trạng thái '${reservation.status}', không thể hủy!`, 409));
    }

    reservation.status = "CANCELLED";
    reservation.cancellationReason = reason ? reason.trim() : "Khách hàng yêu cầu hủy";
    reservation.tables = [];
    await reservation.save();

    res.status(200).json({
      status: "success",
      message: "Đã hủy đơn đặt bàn thành công và giải phóng bàn",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Xem lịch sử đặt bàn cá nhân
exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image")
      .sort({ startAt: -1 });

    res.status(200).json({
      status: "success",
      results: reservations.length,
      data: { reservations },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Xem toàn bộ danh sách đặt bàn
exports.getAllReservations = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.startAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const reservations = await Reservation.find(filter)
      .populate("user", "name email phone")
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price")
      .sort({ startAt: 1 });

    res.status(200).json({
      status: "success",
      results: reservations.length,
      data: { reservations },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Gán / Đổi bàn dự kiến
exports.assignTables = async (req, res, next) => {
  try {
    const { tableIds } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));

    if (!tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
      return next(new AppError("Vui lòng cung cấp danh sách bàn (tableIds) hợp lệ", 400));
    }

    for (let tableId of tableIds) {
      const table = await Table.findById(tableId);
      if (!table) return next(new AppError(`Bàn với ID '${tableId}' không tồn tại`, 404));
    }

    reservation.tables = tableIds;
    reservation.status = "CONFIRMED";
    await reservation.save();

    res.status(200).json({
      status: "success",
      message: "Gán bàn dự kiến thành công",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};