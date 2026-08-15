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

// Tính số tiền cọc sẽ hoàn lại theo chính sách hoàn cọc khi khách hủy
const calculateRefundAmount = (reservation, refundPolicy) => {
  if (reservation.depositStatus !== "PAID" || reservation.depositAmount <= 0) return 0;
  const hoursBefore = (new Date(reservation.startAt).getTime() - Date.now()) / 3600000;
  const { fullRefundHours = 24, partialRefundHours = 2, partialRefundPercent = 50 } = refundPolicy || {};
  if (hoursBefore >= fullRefundHours) return reservation.depositAmount;
  if (hoursBefore >= partialRefundHours) {
    return roundMoney((reservation.depositAmount * partialRefundPercent) / 100);
  }
  return 0;
};

module.exports = {
  getRestaurantPaymentSettings,
  calculateRefundAmount,
};
