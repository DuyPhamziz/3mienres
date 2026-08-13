const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const Dish = require("../models/dish.model");
const RestaurantSetting = require("../models/setting.model");
const AppError = require("../app-error");
const tableEngine = require("../utils/table-engine");

// 1. Tạo đơn đặt bàn Online (Phục vụ cả khách vãng lai lẫn khách đăng nhập)
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

    // Lớp 1: Lấy thông tin (Ưu tiên thông tin từ tài khoản nếu khách đã đăng nhập)
    const finalName = req.user ? req.user.name : customerName;
    const finalPhone = req.user ? req.user.phone : customerPhone;
    const finalEmail = req.user ? req.user.email : customerEmail;
    const userId = req.user ? req.user._id : null;

    if (!finalName || !finalPhone || !guestsCount || !startAt) {
      return next(
        new AppError("Vui lòng cung cấp đầy đủ: Tên, Số điện thoại, Số lượng khách và Thời gian bắt đầu", 400)
      );
    }

    const guests = parseInt(guestsCount, 10);
    if (isNaN(guests) || guests <= 0) {
      return next(new AppError("Số lượng khách phải là số dương hợp lệ", 400));
    }

    const startTime = new Date(startAt);
    if (isNaN(startTime.getTime()) || startTime < new Date()) {
      return next(new AppError("Thời gian bắt đầu phải là một ngày giờ hợp lệ trong tương lai", 400));
    }

    // Lớp 1.1: Đọc cài đặt quy định thời lượng đặt bàn của quán
    let durationMinutes = 120; // Mặc định 2 tiếng
    const settings = await RestaurantSetting.findOne();
    if (settings && settings.reservation && settings.reservation.defaultDurationMinutes) {
      durationMinutes = settings.reservation.defaultDurationMinutes;
    }

    // Nếu là đặt tiệc (EVENT), có thể tùy chỉnh thời lượng
    if (type === "EVENT" && req.body.durationMinutes) {
      durationMinutes = parseInt(req.body.durationMinutes, 10);
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // Lớp 2: Kiểm tra bàn trống và tự động phân bổ bàn giữ chỗ
    const occupiedTableIds = await tableEngine.getOccupiedTableIds(startTime, endTime);
    const allTables = await Table.find({ isActive: true, status: { $ne: "MAINTENANCE" } });
    const availableTables = allTables.filter((t) => !occupiedTableIds.has(t._id.toString()));

    let assignedTables = [];

    // Nếu khách đi nhóm nhỏ: Tìm 1 bàn đơn nhỏ nhất đủ chỗ
    const singleMatches = availableTables
      .filter((t) => t.capacity >= guests)
      .sort((a, b) => a.capacity - b.capacity);

    if (singleMatches.length > 0) {
      assignedTables = [singleMatches[0]._id];
    } else {
      // Nếu khách đi đoàn đông: Tìm cụm bàn ghép kề nhau tối ưu nhất
      const combinations = await tableEngine.findCombinations(availableTables, guests);
      if (combinations.length > 0) {
        // Lấy cụm bàn ghép có tổng sức chứa gần với số khách nhất
        combinations.sort((a, b) => a.totalCapacity - b.totalCapacity);
        assignedTables = combinations[0].tables.map((t) => t._id);
      }
    }

    // Nếu không còn bất kỳ bàn đơn hay cụm bàn ghép nào trống trong khung giờ này
    if (assignedTables.length === 0) {
      return next(
        new AppError(
          "Rất tiếc, nhà hàng đã hết bàn đủ chỗ cho số lượng khách này trong khung giờ bạn chọn. Vui lòng chọn khung giờ khác!",
          409
        )
      );
    }

    // Lớp 2.1: Xử lý món đặt trước (nếu có)
    let formattedDishes = [];
    if (preOrderDishes && Array.isArray(preOrderDishes) && preOrderDishes.length > 0) {
      for (let item of preOrderDishes) {
        const dishInfo = await Dish.findById(item.dish);
        if (!dishInfo) {
          return next(new AppError(`Không tìm thấy món ăn với ID: ${item.dish}`, 404));
        }
        if (!dishInfo.availability) {
          return next(new AppError(`Món ăn '${dishInfo.name}' hiện tại đã hết hàng!`, 400));
        }
        formattedDishes.push({
          dish: item.dish,
          quantity: item.quantity || 1,
          priceAtBooking: dishInfo.price,
        });
      }
    }

    // Sinh mã đặt bàn ngẫu nhiên không trùng lặp (ví dụ: RES-102938)
    let reservationCode;
    let isUnique = false;
    while (!isUnique) {
      reservationCode = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await Reservation.findOne({ reservationCode });
      if (!existing) isUnique = true;
    }

    // Lớp 3: Lưu đơn đặt bàn
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
      status: "CONFIRMED", // Tự động xác nhận khi đã tìm được bàn phù hợp
      tables: assignedTables,
      preOrderDishes: formattedDishes,
      notes,
    });

    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image");

    res.status(201).json({
      status: "success",
      message: "Đặt bàn thành công! Nhà hàng đã giữ chỗ cho bạn.",
      data: {
        reservation: populatedReservation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Khách tra cứu trạng thái đơn đặt bàn (Bằng Mã code + SĐT)
exports.trackReservation = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { phone } = req.query;

    if (!code) {
      return next(new AppError("Vui lòng cung cấp mã đặt bàn", 400));
    }

    const filter = { reservationCode: code.trim().toUpperCase() };
    if (phone) filter.customerPhone = phone.trim();

    const reservation = await Reservation.findOne(filter)
      .populate("tables", "tableNumber capacity area")
      .populate("preOrderDishes.dish", "name price image");

    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn với mã và số điện thoại này", 404));
    }

    res.status(200).json({
      status: "success",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Khách hàng hoặc Nhân viên hủy đặt bàn
exports.cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));
    }

    if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED") {
      return next(new AppError(`Đơn đặt bàn đã ở trạng thái '${reservation.status}', không thể hủy!`, 409));
    }

    // Đổi trạng thái sang CANCELLED và giải phóng bàn đã giữ
    reservation.status = "CANCELLED";
    reservation.cancellationReason = reason ? reason.trim() : "Khách hàng yêu cầu hủy";
    reservation.tables = []; // Xóa danh sách bàn giữ trước
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

// 4. Lấy lịch sử đặt bàn của Khách hàng đang đăng nhập
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

// 5. Quản lý lấy danh sách toàn bộ đặt bàn (Chỉ Staff / Manager / Admin)
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

// 6. Xếp lại bàn hoặc đổi bàn dự kiến cho đơn đặt (Chỉ Staff / Manager / Admin)
exports.assignTables = async (req, res, next) => {
  try {
    const { tableIds } = req.body; // Mảng [id1, id2]
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return next(new AppError("Không tìm thấy đơn đặt bàn này", 404));
    }

    if (!tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
      return next(new AppError("Vui lòng cung cấp danh sách bàn (tableIds) hợp lệ", 400));
    }

    for (let tableId of tableIds) {
      const table = await Table.findById(tableId);
      if (!table) {
        return next(new AppError(`Bàn với ID '${tableId}' không tồn tại`, 404));
      }
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