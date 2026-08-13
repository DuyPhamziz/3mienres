const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Mã voucher là bắt buộc"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, "Tên chương trình khuyến mãi là bắt buộc"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      required: true, // PERCENT: giảm theo %, FIXED: giảm số tiền cố định
    },
    value: {
      type: Number,
      required: true,
      min: [0, "Giá trị giảm không được âm"],
    },
    minOrderValue: {
      type: Number,
      default: 0, // Giá trị đơn tối thiểu để áp dụng
    },
    maxDiscount: {
      type: Number,
      default: 0, // Giới hạn giảm tối đa (0 = không giới hạn), chỉ áp dụng cho PERCENT
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // 0 = không giới hạn lượt dùng
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Voucher", voucherSchema);
