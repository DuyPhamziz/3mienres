const mongoose = require("mongoose");

const rankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên hạng thành viên là bắt buộc (Ví dụ: Đồng, Bạc, Vàng, Kim Cương)"],
      unique: true,
      trim: true,
    },
    minSpent: {
      type: Number,
      required: [true, "Số tiền chi tiêu tối thiểu tích lũy để đạt hạng là bắt buộc"],
      min: [0, "Số tiền chi tiêu tối thiểu không được âm"],
      default: 0,
    },
    discountPercent: {
      type: Number,
      required: [true, "Phần trăm giảm giá ưu đãi cho hạng là bắt buộc"],
      min: [0, "Phần trăm giảm giá không được âm"],
      max: [100, "Phần trăm giảm giá tối đa là 100%"],
      default: 0,
    },
    icon: {
      type: String,
      default: "default-rank.png",
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rank", rankSchema);
