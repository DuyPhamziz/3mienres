const Ingredient = require("../models/ingredient.model");
const AppError = require("../app-error");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { escapeRegex } = require("../utils/escapeRegex");

// 1. Tạo nguyên liệu mới (Chỉ Manager / Admin)
exports.createIngredient = async (req, res, next) => {
  try {
    const { name, unit, minStockLevel, stockQuantity } = req.body;

    if (!name || !unit) {
      return next(new AppError("Vui lòng cung cấp Tên nguyên liệu (name) và Đơn vị tính (unit)", 400));
    }

    const existing = await Ingredient.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") } });
    if (existing) {
      return next(new AppError(`Nguyên liệu '${name}' đã tồn tại trong kho`, 409));
    }

    const newIngredient = await Ingredient.create({
      name: name.trim(),
      unit: unit.trim(),
      stockQuantity: stockQuantity ? parseFloat(stockQuantity) : 0,
      minStockLevel: minStockLevel ? parseFloat(minStockLevel) : 10,
    });

    res.status(201).json({
      status: "success",
      message: "Tạo nguyên liệu mới thành công",
      data: { ingredient: newIngredient },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách nguyên liệu trong kho (Có cảnh báo sắp hết kho)
exports.getAllIngredients = async (req, res, next) => {
  try {
    const { lowStock, search } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search.trim(), $options: "i" };
    if (lowStock === "true") {
      filter.$expr = { $lte: ["$stockQuantity", "$minStockLevel"] };
    }

    const { page, limit, skip } = getPagination(req.query);
    const total = await Ingredient.countDocuments(filter);

    const ingredients = await Ingredient.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const formatted = ingredients.map((ing) => {
      const doc = ing.toObject();
      doc.isLowStock = doc.stockQuantity <= doc.minStockLevel;
      return doc;
    });

    res.status(200).json({
      status: "success",
      results: formatted.length,
      ...buildPaginationMeta(total, page, limit),
      data: { ingredients: formatted },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Cập nhật thông tin nguyên liệu
exports.updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, unit, minStockLevel, stockQuantity } = req.body;

    const ingredient = await Ingredient.findById(id);
    if (!ingredient) return next(new AppError("Không tìm thấy nguyên liệu", 404));

    if (name && name.trim().toLowerCase() !== ingredient.name.toLowerCase()) {
      const duplicate = await Ingredient.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") }, _id: { $ne: id } });
      if (duplicate) return next(new AppError(`Nguyên liệu '${name}' đã tồn tại`, 409));
      ingredient.name = name.trim();
    }

    if (unit) ingredient.unit = unit.trim();
    if (minStockLevel !== undefined) ingredient.minStockLevel = parseFloat(minStockLevel);
    if (stockQuantity !== undefined) ingredient.stockQuantity = parseFloat(stockQuantity);

    await ingredient.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật nguyên liệu thành công",
      data: { ingredient },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Xóa nguyên liệu
exports.deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Ingredient.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Không tìm thấy nguyên liệu để xóa", 404));

    res.status(200).json({
      status: "success",
      message: "Xóa nguyên liệu thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};