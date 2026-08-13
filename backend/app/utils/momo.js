// Tiện ích tích hợp cổng thanh toán MoMo (khung, cần điền Partner Code / Access Key / Secret Key thật để chạy live).
const crypto = require("crypto");

// Tạo chữ ký HMAC-SHA256 theo chuẩn MoMo (các field được sắp xếp theo alphabet)
exports.buildSignature = (secretKey, params) => {
  const raw = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
};

// Gọi MoMo tạo URL thanh toán (POST /v2/gateway/api/create)
exports.createPaymentUrl = async (
  config,
  { amount, orderId, orderInfo, redirectUrl, ipnUrl, extraData = "" },
) => {
  const requestId = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const amountStr = String(Math.round(amount));
  const redirect = redirectUrl || config.redirectUrl;
  const ipn = ipnUrl || config.ipnUrl;

  // Chỉ các field này được đưa vào chữ ký (không gồm lang)
  const signable = {
    accessKey: config.accessKey,
    amount: amountStr,
    extraData,
    ipnUrl: ipn,
    orderId,
    orderInfo,
    partnerCode: config.partnerCode,
    redirectUrl: redirect,
    requestId,
    requestType: "captureWallet",
  };

  const signature = exports.buildSignature(config.secretKey, signable);
  const body = { ...signable, lang: "vi", signature };

  const response = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!data || data.resultCode !== 0 || !data.payUrl) {
    throw new Error((data && data.message) || "Không thể tạo thanh toán MoMo");
  }

  return data.payUrl;
};

// Xác thực chữ ký callback/IPN trả về từ MoMo
exports.verifySignature = (secretKey, params) => {
  const { signature, ...rest } = params;
  return exports.buildSignature(secretKey, rest) === signature;
};
