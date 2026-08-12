const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    //1. Quy định về đặt bàn trước (Reservation)
    reservation: {
      defaultDurationMinutes: {
        type: Number,
        default: 120,
        min: [30, "Thời lượng tối thiểu phải từ 30 phút"],
      },
      gracePeriodMinutes: {
        type: Number,
        default: 15,
        min: [0, "Thời gian chờ không được âm"],
      },
      maxAdvanceDays: {
        type: Number,
        default: 30,
        min: [1, "Phải cho phép đặt trước ít nhất 1 ngày"],
      },
    },
    //2. qui định về bàn ăn
    table: {
      maxSingleTableCapacity: {
        type: Number,
        default: 20,
        min: [1, "Sức chứa tối đa của bàn phải lớn hơn 0"],
      },
      allowCombination: {
        type: Boolean,
        default: true, // cho phép ghép bàn khi khác đoàn đông
      },
    },
    // 3. qui định cho khách vãng lai
    walkIn: {
      enable: {
        type: Boolean,
        default: true, // cho phép tiếp nhận khách hàng vãng lai vào thẳng Dining Session
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RestaurantSetting", settingSchema);
