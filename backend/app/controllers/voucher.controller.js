const Voucher = require("../models/voucher.model");
const AppError = require("../app-error");
const { roundMoney } = require("../utils/money");

// Tính số tiền giảm giá từ voucher cho một giá trị đơn hàng
const computeDiscount = (voucher, orderValue) => {
  if (orderValue < voucher.minOrderValue) return 0;
  if (voucher.type === "FIXED") return Math.min(voucher.value, orderValue);
  // PERCENT
  const raw = (orderValue * voucher.value) / 100;
  return voucher.maxDiscount > 0 ? Math.min(raw, voucher.maxDiscount) : raw;
};

// 1. Tạo voucher (Manager / Admin)
exports.createVoucher = async (req, res, next) => {
  try {
    const { code, title, type, value, minOrderValue, maxDiscount, startDate, endDate, usageLimit } = req.body;

    if (!code || !title || !type || value === undefined || !endDate) {
      return next(new AppError("Thiếu thông tin voucher: code, title, type, value, endDate", 400));
    }
    if (!["PERCENT", "FIXED"].includes(type)) {
      return next(new AppError("Loại voucher phải là PERCENT hoặc FIXED", 400));
    }

    const existing = await Voucher.findOne({ code: code.trim().toUpperCase() });
    if (existing) return next(new AppError(`Mã voucher '${code}' đã tồn tại`, 409));

    const voucher = await Voucher.create({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      type,
      value,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      usageLimit: usageLimit || 0,
    });

    res.status(201).json({ status: "success", message: "Tạo voucher thành công", data: { voucher } });
  } catch (error) {
    next(error);
  }
};

// 2. Danh sách voucher (Manager / Admin)
exports.getAllVouchers = async (req, res, next) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: vouchers.length, data: { vouchers } });
  } catch (error) {
    next(error);
  }
};

// 3. Kiểm tra mã voucher & tính tiền giảm (công khai để khách/pos kiểm tra)
exports.validateVoucher = async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    const voucher = await Voucher.findOne({ code: (code || "").trim().toUpperCase() });

    if (!voucher) return next(new AppError("Mã voucher không tồn tại", 404));
    if (!voucher.isActive) return next(new AppError("Voucher đã bị vô hiệu hóa", 400));

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return next(new AppError("Voucher đã hết hạn hoặc chưa bắt đầu", 400));
    }
    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return next(new AppError("Voucher đã hết lượt sử dụng", 409));
    }

    const discount = roundMoney(computeDiscount(voucher, Number(orderValue) || 0));

    res.status(200).json({
      status: "success",
      data: { voucher: { code: voucher.code, title: voucher.title, type: voucher.type }, discount },
    });
  } catch (error) {
    next(error);
  }
};

// Export helper cho invoice.controller dùng
exports.computeDiscount = computeDiscount;
