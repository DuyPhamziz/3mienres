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
    // Khóa chuẩn hóa (sắp xếp 2 id) để chặn trùng lặp cả chiều A-B lẫn B-A ở tầng DB.
    // Dùng sparse để không xung đột với các bản ghi cũ chưa có pairKey.
    pairKey: {
      type: String,
      index: { unique: true, sparse: true },
    },
    note: {
      type: String,
      trim: true, // Ví dụ: "2 bàn sát nhau dãy cửa sổ"
    },
  },
  { timestamps: true },
);

// Tự tính pairKey (chuẩn hóa thứ tự 2 bàn) trước khi lưu
tableConnectionSchema.pre("validate", function (next) {
  if (this.tableA && this.tableB) {
    const a = this.tableA.toString();
    const b = this.tableB.toString();
    this.pairKey = [a, b].sort().join("_");
  }
  next();
});

module.exports = mongoose.model("TableConnection", tableConnectionSchema);
