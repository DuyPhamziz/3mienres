const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: "Nhà hàng 3 Miền Cua",
    },
    hotline: {
      type: String,
      default: "1900 1234",
    },
    address: {
      type: String,
      default: "123 Đường 3 Tháng 2, Phường 11, Quận 10, TP. Hồ Chí Minh",
    },
    // Cấu hình Chuyển khoản ngân hàng VietQR
    bankAccount: {
      bankId: { type: String, default: "MB" }, // MBBank, VCB, ICB, ACB...
      accountNo: { type: String, default: "0988776655" },
      accountName: { type: String, default: "NHA HANG 3 MIEN CUA" },
    },
    reservation: {
      defaultDurationMinutes: { type: Number, default: 120 },
      gracePeriodMinutes: { type: Number, default: 15 },
      maxAdvanceDays: { type: Number, default: 30 },
      defaultDepositAmount: { type: Number, default: 100000 }, // Tiền cọc mặc định 100k
    },
    table: {
      maxSingleTableCapacity: { type: Number, default: 20 },
      allowCombination: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestaurantSetting", settingSchema);
