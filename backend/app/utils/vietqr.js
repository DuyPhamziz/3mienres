// Tiện ích sinh Mã QR thanh toán (VietQR) & Mã QR Check-in tại quầy.
// Tách riêng để tránh trùng lặp ở nhiều controller.

// Sinh URL ảnh VietQR dùng để nộp tiền cọc (img.vietqr.io)
exports.generateVietQRUrl = (bankId, accountNo, accountName, amount, addInfo) => {
  if (!amount || amount <= 0) return null;
  const cleanAddInfo = encodeURIComponent(addInfo);
  const cleanAccountName = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${cleanAddInfo}&accountName=${cleanAccountName}`;
};

// Sinh URL ảnh Mã QR Check-in nhanh (chứa mã đặt bàn)
exports.generateCheckInQRUrl = (reservationCode) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(reservationCode)}`;
};
