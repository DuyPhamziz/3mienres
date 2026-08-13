// Thoát ký tự đặc biệt regex để tránh NoSQL/Regex injection khi dùng `new RegExp`.
exports.escapeRegex = (str = "") => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
