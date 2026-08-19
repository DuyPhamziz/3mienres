const RestaurantSetting = require("../models/setting.model");
const { roundMoney } = require("./money");

const getRestaurantPaymentSettings = async () => {
  let durationMinutes = 120;
  let defaultDeposit = 100000;
  let bankInfo = {
    bankId: "MB",
    accountNo: "0988776655",
    accountName: "NHA HANG 3 MIEN CUA",
  };

  const settings = await RestaurantSetting.findOne();
  if (settings?.reservation) {
    durationMinutes = settings.reservation.defaultDurationMinutes || durationMinutes;
    if (settings.reservation.defaultDepositAmount !== undefined) {
      defaultDeposit = settings.reservation.defaultDepositAmount;
    }
  }
  if (settings?.bankAccount) bankInfo = settings.bankAccount;

  return { durationMinutes, defaultDeposit, bankInfo };
};

// Tính số tiền cọc sẽ hoàn lại theo chính sách:
// - Hủy trước >= 24h: Hoàn lại 100% tiền cọc
// - Hủy cận ngày (<= 24h hoặc trong ngày): MẤT CỌC 100% (hoàn 0đ)
const calculateRefundAmount = (reservation, refundPolicy) => {
  if (reservation.depositStatus !== "PAID" || !reservation.depositAmount || reservation.depositAmount <= 0) {
    return 0;
  }
  const hoursBefore = (new Date(reservation.startAt).getTime() - Date.now()) / (1000 * 60 * 60);

  // Nếu hủy cận ngày (trước giờ hẹn <= 24 giờ hoặc trong ngày đặt bàn) => MẤT TOÀN BỘ CỌC
  if (hoursBefore <= 24) {
    return 0;
  }

  // Nếu hủy sớm hơn trước 24 giờ => Hoàn 100% tiền cọc
  return reservation.depositAmount;
};

module.exports = {
  getRestaurantPaymentSettings,
  calculateRefundAmount,
};
