// Ý nghĩa nghiệp vụ:
// diningSession: Thuộc về lượt dùng bữa nào.
// items: Danh sách các món gọi trong đợt này (dish, quantity, price, notes).
// status: PENDING (Chờ bếp nhận), PREPARING (Bếp đang nấu), SERVED (Đã mang ra bàn), CANCELLED (Hủy món).
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Ví dụ: ORD-102938
    },
    // Gắn trực tiếp vào lượt dùng bữa tại bàn
    diningSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiningSession",
      required: [
        true,
        "Order phải thuộc về một lượt dùng bữa (DiningSession) cụ thể",
      ],
    },
    // Danh sách món gọi trong đợt này
    items: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Số lượng món gọi tối thiểu là 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Giá món ăn không được âm"],
        },
        notes: {
          type: String,
          trim: true, // Ví dụ: "Ít cay, không hành"
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0, // Tổng tiền của đợt gọi món này
    },
    status: {
      type: String,
      enum: ["PENDING", "PREPARING", "SERVED", "CANCELLED"],
      default: "PENDING",
    },
    stockDeducted: {
      type: Boolean,
      default: false, // Đánh dấu đã trừ kho theo công thức khi món được SERVED
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Nhân viên ghi order hoặc khách hàng
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
