const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục không được để trống"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
); // Tự động tạo trường createdAt và updatedAt

module.exports = mongoose.model("Category", categorySchema);
