// Tiện ích chuẩn hóa số tiền, tránh sai số thập phân trong nghiệp vụ tiền cọc / thanh toán.

// Làm tròn về số nguyên gần nhất (đơn vị VND không dùng số thập phân).
exports.roundMoney = (value) => Math.round(Number(value) || 0);

// Chuẩn hóa về số dương hoặc 0, dùng cho tiền cọc / giảm giá / thuế.
exports.toNonNegative = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

// Tỷ lệ phần trăm an toàn (0 - 100).
exports.toPercent = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num <= 100 ? num : 0;
};
