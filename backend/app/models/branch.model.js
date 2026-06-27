const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên chi nhánh là bắt buộc"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Địa chỉ chi nhánh là bắt buộc"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại chi nhánh là bắt buộc"],
      trim: true,
    },
    mapUrl: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "default-branch.jpg",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);
