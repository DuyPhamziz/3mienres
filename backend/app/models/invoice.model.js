// Ý nghĩa nghiệp vụ:
// Tổng kết toàn bộ tiền ăn của DiningSession.
// Tự động tính: finalAmount = subtotal - discountAmount + taxAmount - depositDeducted.
// Lưu hình thức thanh toán (CASH, BANK_TRANSFER, CARD, MOMO, VNPAY).
// Khi tạo Invoice thành công → DiningSession chuyển sang COMPLETED và các bàn được giải phóng về AVAILABLE.

const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Ví dụ: INV-20260812-001
    },
    diningSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiningSession",
      required: [
        true,
        "Hóa đơn phải gắn liền với một lượt dùng bữa (DiningSession)",
      ],
      unique: true, // Mỗi DiningSession chỉ có đúng 1 hóa đơn thanh toán cuối cùng
    },
    // Danh sách các đợt gọi món được tính tiền trong hóa đơn này
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0, // Tổng tiền tất cả các món đã gọi
    },
    discountAmount: {
      type: Number,
      default: 0, // Tiền giảm giá (nếu có)
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 0, // Thuế VAT (ví dụ: 8 hoặc 10%)
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    depositDeducted: {
      type: Number,
      default: 0, // Trừ tiền cọc nếu khách đã cọc ở bước Reservation trước đó
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true, // Số tiền thực tế khách phải trả
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "BANK_TRANSFER", "MOMO", "VNPAY"],
      required: [true, "Phương thức thanh toán là bắt buộc"],
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "PAID",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Thu ngân thực hiện xuất hóa đơn
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
