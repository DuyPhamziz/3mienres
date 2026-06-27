const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    // Liên kết tới bảng User, có thể bỏ trống (null) nếu là khách vãng lai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Đơn đặt bàn phải thuộc về một chi nhánh cụ thể"],
    },
    reservationCode: {
      type: String,
      unique: true,
      trim: true,
    },
    // Thông tin khách hàng đặt bàn (bắt buộc cho cả khách thành viên và khách vãng lai)
    customerName: {
      type: String,
      required: [true, "Vui lòng cung cấp tên khách hàng đặt bàn"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Vui lòng cung cấp số điện thoại khách hàng"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    // Số bàn do Quản lý xếp khi duyệt đơn (mặc định ban đầu chưa có)

    guestsCount: {
      type: Number,
      required: [true, "Vui lòng nhập số lượng khách"],
      min: [1, "Số khách tối thiểu phải là 1"],
    },
    reservationTime: {
      type: Date,
      required: [true, "Vui lòng chọn thời gian đặt bàn"],
    },
    // Mảng lưu danh sách món ăn chọn trước
    dishes: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Số lượng món ăn tối thiểu là 1"],
        },
        priceAtBooking: {
          type: Number,
          required: true, // Lưu giá món tại thời điểm đặt để tránh sau này nhà hàng tăng/giảm giá làm lệch hóa đơn
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0, // Tổng tiền món ăn đặt trước
    },
    depositAmount: {
      type: Number,
      required: true,
      default: 0, // Số tiền cọc cần đóng trước (ví dụ: 20% tổng hóa đơn)
    },
    paymentType: {
      type: String,
      enum: ["deposit", "full"], // 'deposit': chỉ cọc trước, 'full': thanh toán trọn gói 100%
      default: "deposit",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "deposited", "fully_paid"], // 'unpaid': chưa trả, 'deposited': đã đóng cọc, 'fully_paid': đã thanh toán đầy đủ
      default: "unpaid",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true, // Ghi chú của khách hàng (ví dụ: ngồi gần cửa sổ, không ăn cay, v.v.)
    },
  },
  { timestamps: true },
); // Tự động tạo trường createdAt và updatedAt

module.exports = mongoose.model("Reservation", reservationSchema);
