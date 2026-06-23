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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Table", tableSchema);
