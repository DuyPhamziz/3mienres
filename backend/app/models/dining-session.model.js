// Ý nghĩa nghiệp vụ:
// Đại diện cho khách đang thực sự ngồi ăn tại nhà hàng.
// type: RESERVATION (khách đã đặt trước đến check-in) hoặc WALK_IN (khách đi ngang vào ăn trực tiếp).
// actualGuestsCount: Số lượng khách thực tế đến (có thể đặt 10 nhưng thực tế đến 8 hoặc 12 người).
// tables: Mảng các bàn thực tế khách đang ngồi.
// checkInTime: Giờ thực tế bắt đầu ngồi ăn.
// expectedEndTime: Giờ dự kiến xong để hệ thống cảnh báo nếu khách ngồi quá giờ (OVER_TIME).

const mongoose = require("mongoose");

const diningSessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Ví dụ: SES-839201
    },
    type: {
      type: String,
      enum: ["RESERVATION", "WALK_IN"],
      required: true, // Khách đặt trước đến ăn HOẶC Khách vãng lai vào trực tiếp
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null, // Null nếu là khách Walk-in
    },
    customerName: {
      type: String,
      required: [true, "Tên khách hàng là bắt buộc"],
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    actualGuestsCount: {
      type: Number,
      required: [true, "Số lượng khách thực tế là bắt buộc"],
      min: [1, "Số khách thực tế tối thiểu là 1 người"],
    },
    // Danh sách bàn THỰC TẾ khách đang ngồi dùng bữa
    tables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: true,
      },
    ],
    checkInTime: {
      type: Date,
      default: Date.now, // Thời điểm thực tế khách vào ngồi bàn
    },
    checkOutTime: {
      type: Date,
      default: null, // Cập nhật khi thanh toán xong ra về
    },
    expectedEndTime: {
      type: Date,
      required: true, // Giờ dự kiến kết thúc để phát hiện ngồi quá giờ
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE", // ACTIVE: Đang ăn, COMPLETED: Đã thanh toán ra về
    },
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Nhân viên mở bàn / phục vụ
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DiningSession", diningSessionSchema);
