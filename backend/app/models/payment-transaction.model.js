const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Giao dịch phải thuộc về một người dùng"],
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    amount: {
      type: Number,
      required: [true, "Số tiền giao dịch là bắt buộc"],
      min: [0, "Số tiền giao dịch không được âm"],
    },
    paymentMethod: {
      type: String,
      enum: ["vnpay", "momo", "bank_transfer"],
      required: [true, "Phương thức giao dịch là bắt buộc"],
    },
    transactionId: {
      type: String,
      required: [true, "Mã giao dịch là bắt buộc"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    rawResponse: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
