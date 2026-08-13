const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: { type: String, default: "" },
    userRole: { type: String, default: "" },
    action: { type: String, required: true }, // Ví dụ: "CONFIRM_DEPOSIT", "CREATE_INVOICE", "CHECK_IN"
    entity: { type: String, default: "" }, // Ví dụ: "Reservation", "Invoice", "DiningSession"
    entityId: { type: String, default: "" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
