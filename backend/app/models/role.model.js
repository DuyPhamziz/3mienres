const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["customer", "staff", "manager", "admin"],
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: [{
      type: String, // ví dụ: 'READ_MENU', 'MANAGE_TABLES', 'CHECKOUT_INVOICE'
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
