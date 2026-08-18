const ImportReceipt = require("../models/import-receipt.model");
const Ingredient = require("../models/ingredient.model");
const AppError = require("../app-error");
const { generateUniqueCode } = require("../utils/code-generator");
const { emitEvent } = require("../socket");

// 1. Tạo phiếu nhập kho (Hỗ trợ nhập nguyên liệu cũ hoặc tạo mới nguyên liệu ngay khi nhập)
exports.createImportReceipt = async (req, res, next) => {
  try {
    const { supplier, items, notes, paymentStatus } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError("Vui lòng cung cấp danh sách nguyên liệu nhập kho (items)", 400));
    }

    let totalAmount = 0;
    const formattedItems = [];

    for (let item of items) {
      if (!item.quantity || item.quantity <= 0 || item.importPrice === undefined) {
        return next(new AppError("Mỗi dòng nguyên liệu nhập phải có số lượng > 0 và giá nhập", 400));
      }

      let ing = null;

      // Trường hợp 1: Nhập nguyên liệu MỚI (chưa có trong danh mục kho)
      if (item.isNewIngredient || item.newIngredientName) {
        const name = (item.newIngredientName || item.name || "").trim();
        if (!name) return next(new AppError("Vui lòng cung cấp tên nguyên liệu mới", 400));

        let existing = await Ingredient.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        if (existing) {
          ing = existing;
          ing.stockQuantity += Number(item.quantity);
          if (item.unit) ing.unit = item.unit.trim();
          await ing.save();
        } else {
          ing = await Ingredient.create({
            name,
            category: item.category || "other",
            unit: (item.unit || "kg").trim(),
            stockQuantity: Number(item.quantity),
            minStockLevel: item.minStockLevel ? Number(item.minStockLevel) : 5,
          });
        }
      } else {
        // Trường hợp 2: Nhập nguyên liệu CŨ đã có trong danh mục kho
        if (!item.ingredient) {
          return next(new AppError("Vui lòng chọn nguyên liệu hợp lệ", 400));
        }
        ing = await Ingredient.findById(item.ingredient);
        if (!ing) return next(new AppError(`Nguyên liệu với ID '${item.ingredient}' không tồn tại`, 404));

        ing.stockQuantity += Number(item.quantity);
        await ing.save();
      }

      const lineTotal = Number(item.quantity) * Number(item.importPrice);
      totalAmount += lineTotal;

      formattedItems.push({
        ingredient: ing._id,
        quantity: Number(item.quantity),
        importPrice: Number(item.importPrice),
      });
    }

    const receiptCode = await generateUniqueCode(ImportReceipt, "IMP", "receiptCode");

    const newReceipt = await ImportReceipt.create({
      receiptCode,
      supplier: supplier || null,
      items: formattedItems,
      totalAmount,
      importedBy: req.user ? req.user._id : null,
      paymentStatus: paymentStatus || "paid",
      notes: notes ? notes.trim() : "",
    });

    emitEvent("inventory:changed", { action: "import_receipt_created", receiptCode });

    const populated = await ImportReceipt.findById(newReceipt._id)
      .populate("supplier", "name phone supplierCode")
      .populate("items.ingredient", "name unit category stockQuantity minStockLevel")
      .populate("importedBy", "name email");

    res.status(201).json({
      status: "success",
      message: "Nhập kho thành công! Đã tự động cập nhật số lượng tồn kho.",
      data: { importReceipt: populated },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả các phiếu nhập kho
exports.getAllImportReceipts = async (req, res, next) => {
  try {
    const receipts = await ImportReceipt.find()
      .populate("supplier", "name phone supplierCode category")
      .populate("items.ingredient", "name unit category")
      .populate("importedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: receipts.length,
      data: { importReceipts: receipts },
    });
  } catch (error) {
    next(error);
  }
};