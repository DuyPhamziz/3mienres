const mongoose = require("mongoose");
const tableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên bàn là bắt buộc"],
      trim: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, "Sức chứa của bàn là bắt buộc"],
      min: [1, "Sức chứa của bàn phải lớn hơn 0"],
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available",
    },
    type: {
      type: String,
      enum: ["normal", "vip", "outdoor"],
      default: "normal",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Bàn ăn phải thuộc về một chi nhánh cụ thể"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Table", tableSchema);
