const mongoose = require("mongoose");

const importReceiptSchema = new mongoose.Schema(
  {
    receiptCode: {
      type: String,
      unique: true,
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null, // Có thể nhập kho không qua nhà cung cấp
    },
    items: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0.01, "Số lượng nhập phải lớn hơn 0"],
        },
        importPrice: {
          type: Number,
          required: true,
          min: [0, "Giá nhập không được âm"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0, // Tổng tiền hóa đơn nhập hàng
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Nhân viên/Manager thực hiện lập phiếu nhập
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    importDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ImportReceipt", importReceiptSchema);
