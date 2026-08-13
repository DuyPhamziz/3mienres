// Nghiệp vụ xử lý:
// createArea: Chỉ Admin/Manager được tạo, kiểm tra trùng tên khu vực (trả lỗi 409 Conflict).
// getAllAreas: Công khai cho cả khách hàng và nhân viên xem danh sách các khu vực đang hoạt động.
// updateArea: Sửa thông tin khu vực.
// deleteArea: Xóa khu vực (kiểm tra nếu trong khu vực còn bàn thì không cho xóa để tránh lỗi dữ liệu mồ côi).

const Area = require("../models/area.model");
const Table = require("../models/table.model");
const AppError = require("../app-error");
// 1. Tạo khu vực mới (Chỉ Admin / Manager)
exports.createArea = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    // Lớp 1: Kiểm tra thiếu dữ liệu đầu vào (400 Bad Request)
    if (!name || !name.trim()) {
      return next(new AppError("Tên khu vực là bắt buộc và không được để trống", 400));
    }
    // Lớp 2: Kiểm tra dữ liệu trùng lặp (409 Conflict)
    const existingArea = await Area.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existingArea) {
      return next(new AppError(`Khu vực '${name}' đã tồn tại trên hệ thống`, 409));
    }
    // Lớp 3: Lưu vào cơ sở dữ liệu
    const newArea = await Area.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      isActive: true,
    });
    res.status(201).json({
      status: "success",
      message: "Tạo khu vực mới thành công",
      data: { area: newArea },
    });
  } catch (error) {
    next(error);
  }
};
// 2. Lấy danh sách tất cả các khu vực (Công khai)
exports.getAllAreas = async (req, res, next) => {
  try {
    const areas = await Area.find({ isActive: true }).sort({ createdAt: 1 });
    res.status(200).json({
      status: "success",
      results: areas.length,
      data: { areas },
    });
  } catch (error) {
    next(error);
  }
};
// 3. Cập nhật khu vực (Chỉ Admin / Manager)
exports.updateArea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const area = await Area.findById(id);
    if (!area) {
      return next(new AppError("Không tìm thấy khu vực để cập nhật", 404));
    }
    // Kiểm tra nếu đổi tên thì tên mới không được trùng với khu vực khác
    if (name && name.trim().toLowerCase() !== area.name.toLowerCase()) {
      const duplicateName = await Area.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (duplicateName) {
        return next(new AppError(`Tên khu vực '${name}' đã được sử dụng`, 409));
      }
      area.name = name.trim();
    }
    if (description !== undefined) area.description = description.trim();
    if (isActive !== undefined) area.isActive = isActive;
    await area.save();
    res.status(200).json({
      status: "success",
      message: "Cập nhật khu vực thành công",
      data: { area },
    });
  } catch (error) {
    next(error);
  }
};
// 4. Xóa khu vực (Chỉ Admin / Manager)
exports.deleteArea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const area = await Area.findById(id);
    if (!area) {
      return next(new AppError("Không tìm thấy khu vực để xóa", 404));
    }
    // Xung đột nghiệp vụ: Không cho phép xóa khu vực nếu bên trong vẫn còn bàn ăn
    const tablesCount = await Table.countDocuments({ area: id });
    if (tablesCount > 0) {
      return next(
        new AppError(
          `Không thể xóa khu vực này vì hiện đang có ${tablesCount} bàn ăn thuộc khu vực này. Vui lòng di chuyển hoặc xóa các bàn trước!`,
          409
        )
      );
    }
    await Area.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Xóa khu vực thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};