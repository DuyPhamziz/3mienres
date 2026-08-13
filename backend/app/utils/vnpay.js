// Tiện ích tích hợp cổng thanh toán VNPay (tạo URL thanh toán & xác thực callback).
// Thuật toán ký HMAC-SHA512 theo chuẩn của VNPay.
const crypto = require("crypto");

// Sắp xếp & mã hóa key/value theo đúng quy tắc VNPay
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj)
    .map((k) => encodeURIComponent(k))
    .sort();
  keys.forEach((encKey) => {
    const rawKey = decodeURIComponent(encKey);
    sorted[encKey] = encodeURIComponent(String(obj[rawKey])).replace(/%20/g, "+");
  });
  return sorted;
}

function stringify(sorted) {
  return Object.keys(sorted)
    .map((k) => `${k}=${sorted[k]}`)
    .join("&");
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

// Tạo URL thanh toán VNPay
exports.createPaymentUrl = (config, { amount, txnRef, orderInfo, orderType, ipAddr, returnUrl }) => {
  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType || "other",
    vnp_Amount: Math.round(amount) * 100, // VND nhân 100
    vnp_ReturnUrl: returnUrl || config.returnUrl,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: formatDate(new Date()),
  };

  const sorted = sortObject(vnpParams);
  const signData = stringify(sorted);
  const hmac = crypto.createHmac("sha512", config.hashSecret).update(Buffer.from(signData, "utf-8")).digest("hex");

  const query = `${stringify(sorted)}&vnp_SecureHash=${hmac}`;
  return `${config.url}?${query}`;
};

// Xác thực chữ ký callback trả về từ VNPay
exports.verifyCallback = (config, queryParams) => {
  const params = { ...queryParams };
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);
  const signData = stringify(sorted);
  const hmac = crypto.createHmac("sha512", config.hashSecret).update(Buffer.from(signData, "utf-8")).digest("hex");

  return hmac === secureHash;
};
