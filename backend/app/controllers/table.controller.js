const Table = require("../models/table.model");
const AppError = require("../app-error");

// 1. Tạo bàn ăn mới (Chỉ Manager/Admin)
exports.createTable = async (req, res, next) => {
  try {
    const { name, capacity } = req.body;

    const existingTable = await Table.findOne({ name });
    if (existingTable) {
      return next(new AppError("Bàn ăn này đã tồn tại", 400));
    }

    const newTable = await Table.create({ name, capacity });

    res.status(201).json({
      status: "success",
      data: { table: newTable },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả bàn ăn (Chỉ Manager/Admin xem để xếp bàn)
exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ name: 1 });
    res.status(200).json({
      status: "success",
      results: tables.length,
      data: { tables },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Xóa bàn ăn (Chỉ Manager/Admin)
exports.deleteTable = async (req, res, next) => {
  try {
    const deletedTable = await Table.findByIdAndDelete(req.params.id);
    if (!deletedTable) {
      return next(new AppError("Không tìm thấy bàn ăn này", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Xóa bàn ăn thành công",
    });
  } catch (error) {
    next(error);
  }
};
