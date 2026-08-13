// Bộ tiện ích validate dữ liệu đầu vào đơn giản, dùng chung cho các controller.

exports.isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim().toLowerCase());
};

exports.isValidPhone = (phone) => {
  return /^0\d{9,10}$/.test(String(phone || "").trim());
};

exports.isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(String(id || ""));
};
