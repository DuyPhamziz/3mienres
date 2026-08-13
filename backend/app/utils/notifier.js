// Tiện ích gửi thông báo email/SMS cho khách hàng.
// Email dùng nodemailer (chỉ gửi khi cấu hình SMTP_* trong .env). SMS là stub để tích hợp Twilio/ESMS sau.
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

exports.sendEmail = async (to, subject, html) => {
  if (!to) return;
  const t = getTransporter();
  const from = process.env.SMTP_FROM || "no-reply@3miencua.vn";
  if (!t) {
    console.log(`[EMAIL STUB] To: ${to} | ${subject}`);
    return;
  }
  try {
    await t.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error("Lỗi gửi email:", err.message);
  }
};

exports.sendSms = (phone, message) => {
  if (!phone) return;
  // Stub: tích hợp Twilio/ESMS khi có API key
  console.log(`[SMS STUB] To: ${phone} | ${message}`);
};

exports.notifyReservationCreated = (reservation) => {
  if (!reservation) return;
  const html = `
    <h3>3 Miền Cua - Xác nhận đặt bàn thành công</h3>
    <p>Mã đặt bàn: <b>${reservation.reservationCode}</b></p>
    <p>Thời gian: ${new Date(reservation.startAt).toLocaleString("vi-VN")}</p>
    <p>Số khách: ${reservation.guestsCount} người</p>
  `;
  exports.sendEmail(reservation.customerEmail, `Xác nhận đặt bàn ${reservation.reservationCode}`, html);
  exports.sendSms(reservation.customerPhone, `3 Mien Cua: Dat ban ${reservation.reservationCode} thanh cong.`);
};

exports.notifyDepositConfirmed = (reservation) => {
  if (!reservation) return;
  const html = `<p>Nhà hàng 3 Miền Cua đã xác nhận nhận tiền cọc <b>${reservation.depositAmount}đ</b> cho đơn ${reservation.reservationCode}.</p>`;
  exports.sendEmail(reservation.customerEmail, `Đã nhận cọc ${reservation.reservationCode}`, html);
  exports.sendSms(reservation.customerPhone, `3 Mien Cua: Da nhan coc ${reservation.reservationCode}.`);
};

exports.notifyReservationCancelled = (reservation) => {
  if (!reservation) return;
  const html = `<p>Đơn đặt bàn ${reservation.reservationCode} đã được hủy.</p>`;
  exports.sendEmail(reservation.customerEmail, `Đã hủy đặt bàn ${reservation.reservationCode}`, html);
  exports.sendSms(reservation.customerPhone, `3 Mien Cua: Da huy dat ban ${reservation.reservationCode}.`);
};
