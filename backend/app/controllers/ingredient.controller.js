const Ingredient = require("../models/ingredient.model");
const AppError = require("../app-error");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { escapeRegex } = require("../utils/escapeRegex");

// 1. Tạo nguyên liệu mới (Chỉ Manager / Admin)
exports.createIngredient = async (req, res, next) => {
  try {
    const { name, category, unit, minStockLevel, stockQuantity } = req.body;

    if (!name || !unit) {
      return next(new AppError("Vui lòng cung cấp Tên nguyên liệu và Đơn vị tính", 400));
    }

    const existing = await Ingredient.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") } });
    if (existing) {
      return next(new AppError(`Nguyên liệu '${name}' đã tồn tại trong kho`, 409));
    }

    const newIngredient = await Ingredient.create({
      name: name.trim(),
      category: category || "other",
      unit: unit.trim(),
      stockQuantity: stockQuantity !== undefined ? parseFloat(stockQuantity) : 0,
      minStockLevel: minStockLevel !== undefined ? parseFloat(minStockLevel) : 10,
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

// 2. Lấy danh sách nguyên liệu trong kho (Kèm cờ cảnh báo thiếu hụt)
exports.getAllIngredients = async (req, res, next) => {
  try {
    const { lowStock, category, search } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search.trim(), $options: "i" };
    if (category) filter.category = category;
    if (lowStock === "true") {
      filter.$expr = { $lte: ["$stockQuantity", "$minStockLevel"] };
    }

    const { page, limit, skip } = getPagination(req.query);
    const total = await Ingredient.countDocuments(filter);

    const ingredients = await Ingredient.find(filter)
      .sort({ stockQuantity: 1, name: 1 })
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

// 3. Cập nhật nguyên liệu / thiết lập ngưỡng cảnh báo
exports.updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, unit, minStockLevel, stockQuantity } = req.body;

    const ingredient = await Ingredient.findById(id);
    if (!ingredient) return next(new AppError("Không tìm thấy nguyên liệu", 404));

    if (name && name.trim().toLowerCase() !== ingredient.name.toLowerCase()) {
      const duplicate = await Ingredient.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") }, _id: { $ne: id } });
      if (duplicate) return next(new AppError(`Nguyên liệu '${name}' đã tồn tại`, 409));
      ingredient.name = name.trim();
    }

    if (category) ingredient.category = category;
    if (unit) ingredient.unit = unit.trim();
    if (minStockLevel !== undefined) ingredient.minStockLevel = Math.max(0, parseFloat(minStockLevel));
    if (stockQuantity !== undefined) ingredient.stockQuantity = Math.max(0, parseFloat(stockQuantity));

    await ingredient.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật nguyên liệu & cấu hình ngưỡng cảnh báo thành công!",
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

// 5. Thống kê KPI tồn kho & Danh sách cảnh báo thiếu hụt
exports.getInventoryStats = async (req, res, next) => {
  try {
    const allIngredients = await Ingredient.find();
    const totalIngredients = allIngredients.length;
    const lowStockItems = allIngredients.filter((ing) => ing.stockQuantity <= ing.minStockLevel);

    res.status(200).json({
      status: "success",
      data: {
        totalIngredients,
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.map((ing) => ({
          _id: ing._id,
          name: ing.name,
          unit: ing.unit,
          stockQuantity: ing.stockQuantity,
          minStockLevel: ing.minStockLevel,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};