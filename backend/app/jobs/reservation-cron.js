const Reservation = require("../models/reservation.model");
const RestaurantSetting = require("../models/setting.model");
const { emitEvent } = require("../socket");
const notifier = require("../utils/notifier");
const { logAction } = require("../utils/audit");

/**
 * Quét các đơn đặt bàn CONFIRMED đã quá giờ hẹn + thời gian ân hạn (gracePeriodMinutes)
 * và tự động chuyển sang NO_SHOW
 */
async function scanAndExpireNoShowReservations() {
  try {
    const settings = await RestaurantSetting.findOne();
    const gracePeriodMinutes = settings?.reservation?.gracePeriodMinutes ?? 15;

    const now = new Date();
    const expiryThreshold = new Date(now.getTime() - gracePeriodMinutes * 60000);

    const expiredReservations = await Reservation.find({
      status: "CONFIRMED",
      startAt: { $lt: expiryThreshold },
    });

    if (!expiredReservations || expiredReservations.length === 0) {
      return { count: 0, reservations: [] };
    }

    const updated = [];
    for (const res of expiredReservations) {
      res.status = "NO_SHOW";
      res.notes = (res.notes ? res.notes + " | " : "") + `[Hệ thống] Tự động hủy do khách không đến nhận bàn (Quá ${gracePeriodMinutes} phút)`;
      // Giải phóng danh sách bàn dự kiến nếu có
      res.tables = [];
      await res.save();

      notifier.notifyReservationNoShow(res);
      logAction(null, "AUTO_NO_SHOW", "Reservation", res._id, {
        reservationCode: res.reservationCode,
        gracePeriodMinutes,
      });

      updated.push(res);
    }

    if (updated.length > 0) {
      console.log(`[RESERVATION CRON] Đã chuyển ${updated.length} đơn đặt bàn quá hạn sang NO_SHOW.`);
      emitEvent("reservations:changed");
      emitEvent("tables:changed");
    }

    return { count: updated.length, reservations: updated };
  } catch (error) {
    console.error("[RESERVATION CRON ERROR]:", error.message);
    return { count: 0, error: error.message };
  }
}

let cronInterval = null;

function startReservationCronJob(intervalMs = 60000) {
  if (cronInterval) {
    clearInterval(cronInterval);
  }

  // Quét ngay lần đầu khi server khởi động
  scanAndExpireNoShowReservations();

  // Thiết lập chu kỳ quét định kỳ (mặc định mỗi 1 phút)
  cronInterval = setInterval(() => {
    scanAndExpireNoShowReservations();
  }, intervalMs);

  console.log(`[RESERVATION CRON] Đã kích hoạt Cron Job quét No-Show định kỳ (mỗi ${intervalMs / 1000}s).`);
  return cronInterval;
}

function stopReservationCronJob() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("[RESERVATION CRON] Đã dừng Cron Job quét No-Show.");
  }
}

module.exports = {
  scanAndExpireNoShowReservations,
  startReservationCronJob,
  stopReservationCronJob,
};
