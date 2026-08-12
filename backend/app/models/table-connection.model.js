const mongoose = require("mongoose");

const tableConnectionSchema = new mongoose.Schema(
  {
    tableA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: [true, "Bàn thứ nhất trong liên kết là bắt buộc"],
    },
    tableB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: [true, "Bàn thứ hai trong liên kết là bắt buộc"],
    },
    note: {
      type: String,
      trim: true, // Ví dụ: "2 bàn sát nhau dãy cửa sổ"
    },
  },
  { timestamps: true },
);

// Đảm bảo không tạo trùng lặp liên kết giữa 2 bàn
tableConnectionSchema.index({ tableA: 1, tableB: 1 }, { unique: true });

module.exports = mongoose.model("TableConnection", tableConnectionSchema);
