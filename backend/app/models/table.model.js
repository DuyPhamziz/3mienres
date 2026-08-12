const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, "Số bàn / Mã bàn là bắt buộc (Ví dụ: B01, B02, VIP01)"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    capacity: {
      type: Number,
      required: [true, "Sức chứa tiêu chuẩn của bàn là bắt buộc"],
      min: [1, "Sức chứa tối thiểu là 1 người"],
      max: [20, "Một bàn đơn không được vượt quá 20 người"],
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: [true, "Bàn phải thuộc về một Khu vực cụ thể"],
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"],
      default: "AVAILABLE",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Table", tableSchema);
