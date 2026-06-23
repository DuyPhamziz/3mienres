const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên nguyên liệu không được để trống"],
      unique: true,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Đơn vị tính là bắt buộc (ví dụ: kg, lít, quả, chai)"],
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0, // Số lượng tồn kho hiện tại
      min: 0,
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 5, // Ngưỡng tồn kho tối thiểu để cảnh báo nhập hàng
      min: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ingredient", ingredientSchema);
