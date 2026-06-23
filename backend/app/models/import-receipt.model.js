const mongoose = require("mongoose");

const importReceiptSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Phiếu nhập phải gắn liền với một nhà cung cấp"],
    },
    importer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Nhân viên/Manager thực hiện nhập kho
      required: [true, "Phải có người thực hiện lập phiếu nhập"],
    },
    ingredients: [
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
        pricePerUnit: {
          type: Number,
          required: true, // Giá nhập tại thời điểm đó (để tính giá vốn sau này)
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0, // Tổng tiền hóa đơn nhập hàng
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("ImportReceipt", importReceiptSchema);
