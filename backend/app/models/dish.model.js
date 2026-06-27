const mongoose = require("mongoose");
const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tên món ăn là bắt buộc"],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Mô tả món ăn là bắt buộc"],
  },
  price: {
    type: Number,
    required: [true, "Giá món ăn là bắt buộc"],
    min: [0, "Giá món ăn phải là số dương"],
  },
  discountPrice: {
    type: Number,
    min: [0, "Giá khuyến mãi không được âm"],
  },
  region: {
    type: String,
    enum: ["Bắc", "Trung", "Nam"],
    required: [true, "Vùng miền của món ăn là bắt buộc"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Danh mục món ăn là bắt buộc"],
  },
  availability: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: [true, "Ảnh món ăn là bắt buộc"],
  },
  images: {
    type: [String],
    default: [],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Đánh giá thấp nhất là 1 sao"],
    max: [5, "Đánh giá cao nhất là 5 sao"],
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Dish", dishSchema);
