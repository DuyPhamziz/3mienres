const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Mã giảm giá là bắt buộc"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Loại giảm giá là bắt buộc (percentage hoặc fixed)"],
    },
    discountValue: {
      type: Number,
      required: [true, "Giá trị giảm giá là bắt buộc"],
      min: [0, "Giá trị giảm giá không được nhỏ hơn 0"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Giá trị đơn hàng tối thiểu không được nhỏ hơn 0"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Số tiền giảm tối đa không được nhỏ hơn 0"],
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu chương trình là bắt buộc"],
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc chương trình là bắt buộc"],
    },
    usageLimit: {
      type: Number,
      default: 100,
      min: [1, "Giới hạn sử dụng tối thiểu là 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Lượt sử dụng không được nhỏ hơn 0"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
