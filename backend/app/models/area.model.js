const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        "Tên khu vực là bắt buộc (Ví dụ: Tầng 1, Sân thượng, Phòng VIP)",
      ],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Trạng thái mở cửa phục vụ của khu vực
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Area", areaSchema);
