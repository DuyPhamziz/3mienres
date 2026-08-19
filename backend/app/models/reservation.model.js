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
    // Đánh dấu đơn này có sử dụng ghép bàn (nhiều bàn kề nhau) hay không
    isCombined: {
      type: Boolean,
      default: false,
    },
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
    depositStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID", // Trạng thái xác nhận khách đã nộp cọc hay chưa
    },
    depositMethod: {
      type: String,
      enum: ["CASH", "TRANSFER", "BANK_TRANSFER"],
      default: "TRANSFER", // Phương thức nộp cọc: Tiền mặt tại quầy hoặc Chuyển khoản VietQR
    },
    depositConfirmedAt: {
      type: Date,
      default: null, // Thời điểm nhân viên xác nhận đã nhận cọc
    },
    depositConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Nhân viên xác nhận đã nhận cọc
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      default: 0, // Số tiền cọc sẽ hoàn lại khi hủy (theo chính sách)
    },
    refundStatus: {
      type: String,
      enum: ["NONE", "PENDING", "DONE"],
      default: "NONE",
    },
    // Yêu cầu dời lịch từ khách hàng (chờ quản lý duyệt)
    rescheduleRequest: {
      requestedStartAt: {
        type: Date,
        default: null,
      },
      reason: {
        type: String,
        trim: true,
      },
      requestedAt: {
        type: Date,
        default: null,
      },
      status: {
        type: String,
        enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
        default: "NONE",
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      processedAt: {
        type: Date,
        default: null,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reservation", reservationSchema);
