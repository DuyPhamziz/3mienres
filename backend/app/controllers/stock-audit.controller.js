const StockAudit = require("../models/stock-audit.model");
const Ingredient = require("../models/ingredient.model");
const Order = require("../models/order.model");
const Recipe = require("../models/recipe.model");
const ImportReceipt = require("../models/import-receipt.model");
const AppError = require("../app-error");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { generateUniqueCode } = require("../utils/code-generator");
const { emitEvent } = require("../socket");

// 1. Tạo phiếu kiểm kê kho mới (Snapshot số tồn trên hệ thống và ghi nhận số đếm thực tế)
exports.createStockAudit = async (req, res, next) => {
  try {
    const { auditType, items, notes, autoApply } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError("Vui lòng cung cấp danh sách nguyên liệu kiểm kê (items)", 400));
    }

    const auditCode = await generateUniqueCode(StockAudit, "KK", "auditCode");

    const formattedItems = [];
    for (const it of items) {
      if (!it.ingredient || it.actualCount === undefined) continue;

      const ing = await Ingredient.findById(it.ingredient);
      if (!ing) continue;

      const actual = Math.max(0, Number(it.actualCount));
      const sysStock = Number(ing.stockQuantity);
      const variance = Number((actual - sysStock).toFixed(2));

      formattedItems.push({
        ingredient: ing._id,
        ingredientName: ing.name,
        unit: ing.unit,
        systemStock: sysStock,
        actualCount: actual,
        variance,
        reason: it.reason ? it.reason.trim() : (variance === 0 ? "Khớp hoàn toàn" : "Hao hụt sơ chế/chế biến"),
      });

      // Nếu autoApply = true, cập nhật ngay số lượng tồn kho theo số đếm thực tế
      if (autoApply) {
        ing.stockQuantity = actual;
        await ing.save();
      }
    }

    const audit = await StockAudit.create({
      auditCode,
      auditType: auditType || "WEEKLY",
      performedBy: req.user ? req.user._id : null,
      items: formattedItems,
      notes: notes ? notes.trim() : "",
      status: autoApply ? "APPLIED" : "DRAFT",
      appliedAt: autoApply ? new Date() : null,
    });

    if (autoApply) {
      emitEvent("inventory:changed", { action: "stock_reconciliation", auditCode });
    }

    res.status(201).json({
      status: "success",
      message: autoApply
        ? "Đã lưu phiếu kiểm kê và đồng bộ cân bằng tồn kho thành công!"
        : "Đã lưu bản nháp phiếu kiểm kê kho thành công!",
      data: { audit },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Áp dụng đồng bộ cân bằng kho theo phiếu kiểm kê (Apply Stock Reconciliation)
exports.applyStockAudit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const audit = await StockAudit.findById(id);

    if (!audit) return next(new AppError("Không tìm thấy phiếu kiểm kê này", 404));
    if (audit.status === "APPLIED") {
      return next(new AppError("Phiếu kiểm kê này đã được đồng bộ cân bằng kho trước đó rồi!", 400));
    }

    for (const it of audit.items) {
      const ing = await Ingredient.findById(it.ingredient);
      if (ing) {
        ing.stockQuantity = it.actualCount;
        await ing.save();
      }
    }

    audit.status = "APPLIED";
    audit.appliedAt = new Date();
    await audit.save();

    emitEvent("inventory:changed", { action: "stock_reconciliation", auditCode: audit.auditCode });

    res.status(200).json({
      status: "success",
      message: `Đã cân bằng số lượng tồn kho theo phiếu kiểm kê ${audit.auditCode} thành công!`,
      data: { audit },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Danh sách các phiếu kiểm kê kho
exports.getAllStockAudits = async (req, res, next) => {
  try {
    const { auditType, status } = req.query;
    const filter = {};

    if (auditType) filter.auditType = auditType;
    if (status) filter.status = status;

    const { page, limit, skip } = getPagination(req.query);
    const total = await StockAudit.countDocuments(filter);

    const audits = await StockAudit.find(filter)
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: audits.length,
      ...buildPaginationMeta(total, page, limit),
      data: { audits },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Báo cáo tổng kết tiêu thụ nguyên liệu định kỳ (Hôm nay / Tuần này / Tháng này / Tùy chọn)
exports.getConsumptionReport = async (req, res, next) => {
  try {
    const { period, fromDate, toDate } = req.query;
    let start = new Date();
    let end = new Date();

    if (period === "today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 đầu tuần
      start = new Date(start.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === "month") {
      start = new Date(start.getFullYear(), start.getMonth(), 1, 0, 0, 0);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    } else if (fromDate && toDate) {
      start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Mặc định 30 ngày qua
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // 1. Lấy tất cả các món đã gọi trong kỳ
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ["PREPARING", "SERVED"] },
    }).populate("items.dish");

    // 2. Tra cứu định lượng theo công thức để tính tổng tiêu thụ lý thuyết
    const consumptionMap = {};
    const recipes = await Recipe.find().populate("ingredients.ingredient");

    const recipeMap = {};
    for (const r of recipes) {
      if (r.dish) recipeMap[r.dish.toString()] = r.ingredients;
    }

    for (const ord of orders) {
      for (const item of ord.items) {
        if (!item.dish) continue;
        const dishId = item.dish._id ? item.dish._id.toString() : item.dish.toString();
        const ingredients = recipeMap[dishId];
        if (!ingredients) continue;

        for (const line of ingredients) {
          if (!line.ingredient) continue;
          const ingId = line.ingredient._id.toString();
          const ingName = line.ingredient.name;
          const unit = line.ingredient.unit;

          if (!consumptionMap[ingId]) {
            consumptionMap[ingId] = {
              _id: ingId,
              name: ingName,
              unit,
              category: line.ingredient.category,
              currentStock: line.ingredient.stockQuantity,
              totalCooked: 0,
              totalImported: 0,
            };
          }

          consumptionMap[ingId].totalCooked += line.quantityRequired * item.quantity;
        }
      }
    }

    // 3. Lấy tổng số lượng nhập trong kỳ từ ImportReceipts
    const receipts = await ImportReceipt.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("items.ingredient");

    for (const rec of receipts) {
      for (const it of rec.items) {
        if (!it.ingredient) continue;
        const ingId = it.ingredient._id.toString();
        if (!consumptionMap[ingId]) {
          consumptionMap[ingId] = {
            _id: ingId,
            name: it.ingredient.name,
            unit: it.ingredient.unit,
            category: it.ingredient.category,
            currentStock: it.ingredient.stockQuantity,
            totalCooked: 0,
            totalImported: 0,
          };
        }
        consumptionMap[ingId].totalImported += it.quantity;
      }
    }

    // Làm tròn số thập phân
    const reportData = Object.values(consumptionMap).map((it) => ({
      ...it,
      totalCooked: Number(it.totalCooked.toFixed(2)),
      totalImported: Number(it.totalImported.toFixed(2)),
    }));

    // Sắp xếp theo số lượng tiêu thụ giảm dần
    reportData.sort((a, b) => b.totalCooked - a.totalCooked);

    res.status(200).json({
      status: "success",
      period: { start, end },
      results: reportData.length,
      data: { report: reportData },
    });
  } catch (error) {
    next(error);
  }
};
