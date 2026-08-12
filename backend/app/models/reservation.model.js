const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    reservationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Ví dụ: RES-102938
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null nếu là khách vãng lai đặt online
    },
    customerName: {
      type: String,
      required: [true, "Tên người đặt bàn là bắt buộc"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Số điện thoại người đặt là bắt buộc"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    guestsCount: {
      type: Number,
      required: [true, "Số lượng khách dự kiến là bắt buộc"],
      min: [1, "Số khách tối thiểu là 1 người"],
    },
    startAt: {
      type: Date,
      required: [true, "Thời gian bắt đầu dùng bữa là bắt buộc"],
    },
    endAt: {
      type: Date,
      required: [true, "Thời gian kết thúc dự kiến là bắt buộc"],
    },
    type: {
      type: String,
      enum: ["NORMAL", "EVENT"],
      default: "NORMAL", // NORMAL: 120 phút, EVENT: đặt tiệc thời lượng linh hoạt
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "ARRIVED",
        "CANCELLED",
        "NO_SHOW",
        "COMPLETED",
      ],
      default: "PENDING",
    },
    // Danh sách bàn dự kiến phân bổ cho đơn đặt bàn này
    tables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
      },
    ],
    // Món ăn khách chọn đặt trước (nếu có)
    preOrderDishes: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtBooking: {
          type: Number,
          required: true,
        },
      },
    ],
    depositAmount: {
      type: Number,
      default: 0, // Tiền đặt cọc trước (nếu có)
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reservation", reservationSchema);
