const ImportReceipt = require("../models/import-receipt.model");
const Ingredient = require("../models/ingredient.model");
const AppError = require("../app-error");

// 1. Tạo phiếu nhập kho (Tự động cộng dồn số lượng tồn kho)
exports.createImportReceipt = async (req, res, next) => {
  try {
    const { supplier, items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError("Vui lòng cung cấp danh sách nguyên liệu nhập kho (items)", 400));
    }

    let totalAmount = 0;
    const formattedItems = [];

    for (let item of items) {
      if (!item.ingredient || !item.quantity || item.quantity <= 0 || item.importPrice === undefined) {
        return next(new AppError("Mỗi nguyên liệu nhập kho phải có ID, số lượng > 0 và giá nhập", 400));
      }

      const ing = await Ingredient.findById(item.ingredient);
      if (!ing) return next(new AppError(`Nguyên liệu với ID '${item.ingredient}' không tồn tại`, 404));

      const lineTotal = item.quantity * item.importPrice;
      totalAmount += lineTotal;

      formattedItems.push({
        ingredient: ing._id,
        quantity: item.quantity,
        importPrice: item.importPrice,
      });

      // Tự động cộng dồn tồn kho
      ing.stockQuantity += item.quantity;
      await ing.save();
    }

    // Sinh mã phiếu nhập
    let receiptCode;
    let isUnique = false;
    while (!isUnique) {
      receiptCode = `IMP-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await ImportReceipt.findOne({ receiptCode });
      if (!existing) isUnique = true;
    }

    const newReceipt = await ImportReceipt.create({
      receiptCode,
      supplier: supplier || null,
      items: formattedItems,
      totalAmount,
      importedBy: req.user ? req.user._id : null,
      notes: notes ? notes.trim() : "",
    });

    const populated = await ImportReceipt.findById(newReceipt._id).populate("items.ingredient", "name unit stockQuantity");

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
      .populate("supplier", "name phone")
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