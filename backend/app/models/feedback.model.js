const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null nếu là khách vãng lai gửi góp ý
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ tên của bạn"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại để nhà hàng liên hệ lại"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["SERVICE", "FOOD", "ATMOSPHERE", "PRICING", "OTHER"],
      default: "SERVICE", // Dịch vụ, Món ăn, Không gian cảnh quan, Giá cả, Khác
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    subject: {
      type: String,
      trim: true,
      default: "Góp ý chất lượng phục vụ",
    },
    content: {
      type: String,
      required: [true, "Vui lòng nhập nội dung góp ý hoặc phản hồi của bạn"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "RESOLVED"],
      default: "PENDING", // PENDING: Mới nhận, REVIEWED: Đã tiếp nhận, RESOLVED: Đã xử lý/gọi lại khách
    },
    adminNote: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
