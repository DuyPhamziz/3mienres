const mongoose = require("mongoose");

const stockAuditSchema = new mongoose.Schema(
  {
    auditCode: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true, // Ví dụ: KK-20260818-001
    },
    auditType: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "ADHOC"],
      default: "WEEKLY", // Hằng ngày, Cuối tuần, Cuối tháng, Đột xuất
    },
    auditDate: {
      type: Date,
      default: Date.now,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        ingredientName: String,
        unit: String,
        systemStock: {
          type: Number,
          required: true,
          default: 0,
        },
        actualCount: {
          type: Number,
          required: true,
          default: 0,
        },
        variance: {
          type: Number,
          required: true,
          default: 0, // actualCount - systemStock
        },
        reason: {
          type: String,
          default: "",
        },
      },
    ],
    status: {
      type: String,
      enum: ["DRAFT", "APPLIED"],
      default: "DRAFT", // DRAFT: Bản nháp đếm kiểm kê; APPLIED: Đã đồng bộ cân bằng kho
    },
    notes: {
      type: String,
      trim: true,
    },
    appliedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockAudit", stockAuditSchema);
