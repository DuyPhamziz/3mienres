const Category = require("../models/category.model.js");
const AppError = require("../app-error");

// 1. Tạo danh mục mới (Chỉ admin/Manager)

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(new AppError("Danh mục này đã tồn tại", 400));
    }
    const newCategory = await Category.create({ name, description });
    res.status(201).json({
      status: "success",
      data: {
        category: newCategory,
      },
    });
  } catch (err) {
    next(err);
  }
};
// 2. Lấy danh sách tất cả danh mục (ai cũng xem được)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (err) {
    next(err);
  }
};
