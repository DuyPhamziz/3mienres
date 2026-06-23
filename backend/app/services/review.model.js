const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Đánh giá phải thuộc về một người dùng cụ thể"],
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: [true, "Đánh giá phải dành cho một món ăn cụ thể"],
    },
    rating: {
      type: Number,
      required: [true, "Vui lòng chọn số sao đánh giá"],
      min: [1, "Đánh giá thấp nhất là 1 sao"],
      max: [5, "Đánh giá cao nhất là 5 sao"],
    },
    comment: {
      type: String,
      required: [true, "Vui lòng nhập bình luận nhận xét"],
      trim: true,
    },
  },
  { timestamps: true },
);

// Ràng buộc duy nhất: Một User chỉ được đánh giá một Dish duy nhất 1 lần
reviewSchema.index({ user: 1, dish: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
