const Dish = require("../models/dish.model.js");
const AppError = require("../app-error");
// 1. Lấy danh sách thực đơn (Hỗ trợ tìm kiếm, lọc, phân trang)
exports.getAllDishes = async (req, res, next) => {
  try {
    const { region, category, search } = req.query;
    let querryObj = { availability: true };
    if (region) {
      querryObj.region = region;
    }
    if (category) {
      querryObj.category = category;
    }
    if (search) {
      querryObj.name = { $regex: search, $options: "i" };
    }
    // Thực hiện truy vấn cơ sở dữ liệu với các điều kiện lọc và tìm kiếm
    const dishes = await Dish.find(querryObj)
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: dishes.length,
      data: {
        dishes,
      },
    });
  } catch (err) {
    next(err);
  }
};
// 2. Thêm món ăn mới (Chỉ admin/Manager)
exports.createDish = async (req, res, next) => {
  try {
    const { name, description, price, category, region, image } = req.body;
    const existingDish = await Dish.findOne({ name });
    if (existingDish) {
      return next(new AppError("Món ăn này đã tồn tại", 400));
    }
    const newDish = await Dish.create({
      name,
      description,
      price,
      category,
      region,
      image,
    });
    res.status(201).json({
      status: "success",
      data: {
        dish: newDish,
      },
    });
  } catch (err) {
    next(err);
  }
};
// 3. Cập nhật món ăn (Chỉ admin/Manager)
exports.updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Cập nhật và trả về dữ liệu mới sau khi cập nhật (new: true) kèm chạy validator
    const updatedDish = await Dish.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDish) {
      return next(new AppError("Không tìm thấy món ăn", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        dish: updatedDish,
      },
    });
  } catch (err) {
    next(err);
  }
};
// 4. Xóa món ăn (Chỉ admin/Manager)
exports.deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedDish = await Dish.findByIdAndDelete(id);
    if (!deletedDish) {
      return next(new AppError("Không tìm thấy món ăn", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
      message: "Món ăn đã được xóa thành công",
    });
  } catch (err) {
    next(err);
  }
};
