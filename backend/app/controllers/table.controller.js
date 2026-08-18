const Table = require("../models/table.model");
const Area = require("../models/area.model");
const TableConnection = require("../models/table-connection.model");
const Reservation = require("../models/reservation.model");
const AppError = require("../app-error");
const tableEngine = require("../utils/table-engine");
const { emitEvent } = require("../socket");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

// 1. Tạo bàn ăn mới (Chỉ Manager / Admin)
exports.createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, area } = req.body;

    // Lớp 1: Kiểm tra thiếu dữ liệu đầu vào (400 Bad Request)
    if (!tableNumber || !capacity || !area) {
      return next(new AppError("Vui lòng nhập đầy đủ: Số bàn (tableNumber), Sức chứa (capacity) và Khu vực (area)", 400));
    }

    // Lớp 1.1: Kiểm tra tính hợp lệ của sức chứa (1 đến 20 người)
    if (isNaN(capacity) || capacity <= 0 || capacity > 20) {
      return next(new AppError("Sức chứa của bàn đơn phải từ 1 đến 20 người theo quy định", 400));
    }

    // Lớp 2: Kiểm tra trùng số bàn (409 Conflict)
    const existingTable = await Table.findOne({ tableNumber: tableNumber.trim().toUpperCase() });
    if (existingTable) {
      return next(new AppError(`Bàn '${tableNumber}' đã tồn tại trên hệ thống`, 409));
    }

    // Lớp 2.1: Kiểm tra khu vực có tồn tại hay không (404 Not Found)
    const areaExists = await Area.findById(area);
    if (!areaExists) {
      return next(new AppError("Khu vực được chọn không tồn tại trên hệ thống", 404));
    }

    // Lớp 3: Lưu vào database
    const newTable = await Table.create({
      tableNumber: tableNumber.trim().toUpperCase(),
      capacity,
      area,
      status: "AVAILABLE",
      isActive: true,
    });

    emitEvent("tables:changed");

    res.status(201).json({
      status: "success",
      message: "Tạo bàn ăn mới thành công",
      data: { table: newTable },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả các bàn (Xem sơ đồ bàn)
exports.getAllTables = async (req, res, next) => {
  try {
    const { area, status, search } = req.query;
    const filter = { isActive: true };

    if (area) filter.area = area;
    if (status) filter.status = status;
    if (search) filter.tableNumber = { $regex: search.trim(), $options: "i" };

    const { page, limit, skip } = getPagination(req.query);
    const total = await Table.countDocuments(filter);

    const tables = await Table.find(filter)
      .populate("area", "name description")
      .sort({ tableNumber: 1 })
      .skip(skip)
      .limit(limit);

    // Tính toán các bàn có lịch đặt sắp tới (trong vòng 45 phút tới)
    const now = new Date();
    const upcomingHorizon = new Date(now.getTime() + 45 * 60000);

    const upcomingReservations = await Reservation.find({
      status: "CONFIRMED",
      startAt: { $gte: new Date(now.getTime() - 15 * 60000), $lte: upcomingHorizon },
    }).select("reservationCode customerName customerPhone guestsCount startAt endAt tables");

    const upcomingMap = new Map();
    for (const resItem of upcomingReservations) {
      if (resItem.tables && resItem.tables.length > 0) {
        for (const tId of resItem.tables) {
          const idStr = tId.toString();
          if (!upcomingMap.has(idStr) || new Date(resItem.startAt) < new Date(upcomingMap.get(idStr).startAt)) {
            upcomingMap.set(idStr, {
              reservationId: resItem._id,
              reservationCode: resItem.reservationCode,
              customerName: resItem.customerName,
              customerPhone: resItem.customerPhone,
              guestsCount: resItem.guestsCount,
              startAt: resItem.startAt,
              endAt: resItem.endAt,
            });
          }
        }
      }
    }

    const enrichedTables = tables.map((t) => {
      const doc = t.toObject();
      const upcoming = upcomingMap.get(t._id.toString());
      if (upcoming) {
        doc.upcomingReservation = upcoming;
      }
      return doc;
    });

    res.status(200).json({
      status: "success",
      results: enrichedTables.length,
      ...buildPaginationMeta(total, page, limit),
      data: { tables: enrichedTables },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Xem chi tiết 1 bàn cụ thể
exports.getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id).populate("area", "name description");
    if (!table) {
      return next(new AppError("Không tìm thấy bàn ăn này", 404));
    }

    // Lấy thêm danh sách các bàn có thể ghép với bàn này
    const connections = await TableConnection.find({
      $or: [{ tableA: table._id }, { tableB: table._id }],
    })
      .populate("tableA", "tableNumber capacity")
      .populate("tableB", "tableNumber capacity");

    const adjacentTables = connections.map((c) =>
      c.tableA._id.toString() === table._id.toString() ? c.tableB : c.tableA
    );

    res.status(200).json({
      status: "success",
      data: {
        table,
        adjacentTables, // Danh sách các bàn hàng xóm có thể ghép được
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. KIỂM TRA BÀN TRỐNG & TỰ ĐỘNG GỢI Ý GHÉP BÀN THEO KHUNG GIỜ (Core API)
exports.checkTableAvailability = async (req, res, next) => {
  try {
    const { startAt, endAt, guestsCount } = req.query;

    // Lớp 1: Kiểm tra thiếu tham số
    if (!startAt || !endAt || !guestsCount) {
      return next(new AppError("Vui lòng cung cấp đầy đủ: startAt, endAt và guestsCount trong query params", 400));
    }

    const guests = parseInt(guestsCount, 10);
    if (isNaN(guests) || guests <= 0) {
      return next(new AppError("Số lượng khách (guestsCount) phải là số dương hợp lệ", 400));
    }

    const startTime = new Date(startAt);
    const endTime = new Date(endAt);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) {
      return next(new AppError("Thời gian bắt đầu (startAt) phải nhỏ hơn thời gian kết thúc (endAt)", 400));
    }

    // Lớp 2: Tìm các bàn đang bận trong khung giờ này
    const occupiedTableIds = await tableEngine.getOccupiedTableIds(startTime, endTime);

    // Lấy toàn bộ các bàn đang hoạt động trong nhà hàng
    const allTables = await Table.find({ isActive: true, status: { $ne: "MAINTENANCE" } }).populate("area", "name");

    // Lọc ra các bàn thực sự trống trong khung giờ này
    const availableTables = allTables.filter((t) => !occupiedTableIds.has(t._id.toString()));

    // 1. Tìm các bàn đơn vừa đủ sức chứa
    const singleMatches = availableTables.filter((t) => t.capacity >= guests);

    // 2. Tìm các cụm bàn ghép kề nhau nếu khách đông hoặc không có bàn đơn đủ chỗ
    let suggestedCombinations = [];
    if (singleMatches.length === 0 || guests > 10) {
      suggestedCombinations = await tableEngine.findCombinations(availableTables, guests);
    }

    res.status(200).json({
      status: "success",
      query: {
        startAt: startTime,
        endAt: endTime,
        guestsCount: guests,
      },
      data: {
        totalAvailableCount: availableTables.length,
        availableTables,
        singleMatches, // Các bàn đơn phù hợp
        suggestedCombinations, // Các cụm bàn ghép liên thông phù hợp
      },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Cập nhật thông tin bàn ăn (Chỉ Manager / Admin)
exports.updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, area, status, isActive } = req.body;

    const table = await Table.findById(id);
    if (!table) {
      return next(new AppError("Không tìm thấy bàn ăn để cập nhật", 404));
    }

    if (capacity !== undefined && (isNaN(capacity) || capacity <= 0 || capacity > 20)) {
      return next(new AppError("Sức chứa của bàn phải từ 1 đến 20 người", 400));
    }

    if (tableNumber && tableNumber.trim().toUpperCase() !== table.tableNumber) {
      const duplicate = await Table.findOne({
        tableNumber: tableNumber.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return next(new AppError(`Số bàn '${tableNumber}' đã được sử dụng`, 409));
      }
      table.tableNumber = tableNumber.trim().toUpperCase();
    }

    if (area) {
      const areaExists = await Area.findById(area);
      if (!areaExists) return next(new AppError("Khu vực được chọn không tồn tại", 404));
      table.area = area;
    }

    if (capacity !== undefined) table.capacity = capacity;
    if (status !== undefined) table.status = status;
    if (isActive !== undefined) table.isActive = isActive;

    await table.save();

    emitEvent("tables:changed");

    res.status(200).json({
      status: "success",
      message: "Cập nhật bàn ăn thành công",
      data: { table },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Xóa bàn ăn (Chỉ Manager / Admin)
exports.deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await Table.findById(id);
    if (!table) {
      return next(new AppError("Không tìm thấy bàn ăn để xóa", 404));
    }

    // Xung đột nghiệp vụ: Bàn đang có khách ngồi không được xóa
    if (table.status === "OCCUPIED") {
      return next(new AppError("Bàn đang có khách ngồi dùng bữa, không thể xóa!", 409));
    }

    // Tự động dọn dẹp các liên kết ghép bàn có dính tới bàn này
    await TableConnection.deleteMany({
      $or: [{ tableA: id }, { tableB: id }],
    });

    await Table.findByIdAndDelete(id);

    emitEvent("tables:changed");
    emitEvent("connections:changed");

    res.status(200).json({
      status: "success",
      message: "Đã xóa bàn ăn thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};