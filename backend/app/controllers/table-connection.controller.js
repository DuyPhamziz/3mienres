const mongoose = require("mongoose");
const TableConnection = require("../models/table-connection.model");
const Table = require("../models/table.model");
const AppError = require("../app-error");
const { emitEvent } = require("../socket");

// Hàm Helper: Tìm bàn linh hoạt (Hỗ trợ cả _id MongoDB lẫn số bàn như "B01", "B02")
const findTableFlexible = async (identifier) => {
  if (!identifier) return null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await Table.findById(identifier);
    if (byId) return byId;
  }
  return await Table.findOne({ tableNumber: identifier.toString().trim().toUpperCase() });
};

// 1. Tạo liên kết kề nhau giữa 2 bàn (Chỉ Manager / Admin)
exports.createConnection = async (req, res, next) => {
  try {
    const { tableA, tableB, note } = req.body;

    // Lớp 1: Kiểm tra thiếu dữ liệu (400 Bad Request)
    if (!tableA || !tableB) {
      return next(new AppError("Vui lòng cung cấp đầy đủ mã hoặc số của 2 bàn (tableA và tableB)", 400));
    }

    // Lớp 2: Tìm 2 bàn trong database (hỗ trợ cả _id lẫn tên bàn B01, B02)
    const [foundTableA, foundTableB] = await Promise.all([
      findTableFlexible(tableA),
      findTableFlexible(tableB),
    ]);

    if (!foundTableA || !foundTableB) {
      return next(new AppError("Một trong hai bàn không tồn tại trên hệ thống", 404));
    }

    if (foundTableA._id.toString() === foundTableB._id.toString()) {
      return next(new AppError("Không thể liên kết một bàn với chính nó", 400));
    }

    // Kiểm tra 2 bàn phải thuộc cùng một khu vực (Area) mới ghép được
    const areaA = (foundTableA.area || foundTableA.areaId || "").toString();
    const areaB = (foundTableB.area || foundTableB.areaId || "").toString();
    if (areaA && areaB && areaA !== areaB) {
      return next(new AppError("Hai bàn phải thuộc cùng một khu vực mới có thể ghép với nhau", 409));
    }

    // Lớp 3: Kiểm tra liên kết đã tồn tại hay chưa (409 Conflict)
    const existingConnection = await TableConnection.findOne({
      $or: [
        { tableA: foundTableA._id, tableB: foundTableB._id },
        { tableA: foundTableB._id, tableB: foundTableA._id },
      ],
    });

    if (existingConnection) {
      return next(new AppError(`Liên kết giữa hai bàn '${foundTableA.tableNumber}' và '${foundTableB.tableNumber}' đã tồn tại từ trước`, 409));
    }

    const newConnection = await TableConnection.create({
      tableA: foundTableA._id,
      tableB: foundTableB._id,
      note: note ? note.trim() : "",
    });

    emitEvent("connections:changed");

    res.status(201).json({
      status: "success",
      message: `Đã liên kết ghép bàn thành công giữa ${foundTableA.tableNumber} và ${foundTableB.tableNumber}`,
      data: { connection: newConnection },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả các liên kết bàn kề nhau
exports.getAllConnections = async (req, res, next) => {
  try {
    const connections = await TableConnection.find()
      .populate("tableA", "tableNumber capacity area areaId")
      .populate("tableB", "tableNumber capacity area areaId");

    res.status(200).json({
      status: "success",
      results: connections.length,
      data: { connections },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Xóa liên kết ghép bàn (Chỉ Manager / Admin)
exports.deleteConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedConnection = await TableConnection.findByIdAndDelete(id);

    if (!deletedConnection) {
      return next(new AppError("Không tìm thấy liên kết ghép bàn này để xóa", 404));
    }

    emitEvent("connections:changed");

    res.status(200).json({
      status: "success",
      message: "Đã xóa liên kết ghép bàn thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};