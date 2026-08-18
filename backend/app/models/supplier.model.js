const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      trim: true,
      uppercase: true, // Ví dụ: NCC-CAMAU-01
    },
    name: {
      type: String,
      required: [true, "Tên nhà cung cấp là bắt buộc"],
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại nhà cung cấp là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, "Địa chỉ nhà cung cấp là bắt buộc"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["SEAFOOD", "MEAT", "VEGETABLE", "SPICE", "BEVERAGE", "PACKAGING", "OTHER"],
      default: "SEAFOOD", // Nhóm hàng cung ứng chính
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    bankName: {
      type: String,
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      trim: true,
    },
    bankAccountName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // Trạng thái hợp tác
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", supplierSchema);
