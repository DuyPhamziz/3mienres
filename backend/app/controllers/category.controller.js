const Category = require("../models/category.model");
const Dish = require("../models/dish.model");
const AppError = require("../app-error");
const slugify = require("../utils/slugify");

// 1. Tạo danh mục món ăn mới (Chỉ Manager / Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError("Tên danh mục là bắt buộc", 400));
    }

    const slug = slugify(name);

    // Kiểm tra dữ liệu trùng lặp theo tên hoặc slug
    const existing = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        { slug },
      ],
    });
    if (existing) {
      return next(new AppError(`Danh mục '${name}' đã tồn tại trên hệ thống`, 409));
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : "",
      image: image ? image.trim() : "default-category.jpg",
    });

    res.status(201).json({
      status: "success",
      message: "Tạo danh mục mới thành công",
      data: { category: newCategory },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả các danh mục (Công khai)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Tra cứu danh mục theo Slug (Công khai)
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return next(new AppError("Không tìm thấy danh mục này", 404));
    }

    res.status(200).json({
      status: "success",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Cập nhật danh mục
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) return next(new AppError("Không tìm thấy danh mục để cập nhật", 404));

    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const newSlug = slugify(name);
      const duplicate = await Category.findOne({ slug: newSlug, _id: { $ne: id } });
      if (duplicate) return next(new AppError(`Tên danh mục '${name}' đã được sử dụng`, 409));
      category.name = name.trim();
      category.slug = newSlug;
    }

    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image.trim();
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật danh mục thành công",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Xóa danh mục
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return next(new AppError("Không tìm thấy danh mục để xóa", 404));

    const dishCount = await Dish.countDocuments({ category: id });
    if (dishCount > 0) {
      return next(new AppError(`Không thể xóa danh mục này vì đang chứa ${dishCount} món ăn!`, 409));
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Xóa danh mục thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};