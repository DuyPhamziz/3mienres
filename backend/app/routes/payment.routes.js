const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../utils/auth");

const router = express.Router();

// Callback từ VNPay (công khai - VNPay gọi trực tiếp)
router.get("/vnpay/callback", paymentController.vnpayCallback);

// Tạo URL thanh toán cọc (cần đăng nhập để xác định chính chủ)
router.post("/vnpay/deposit", protect, paymentController.createDepositPayment);

// MoMo: callback (redirect) + IPN (webhook) + tạo URL thanh toán cọc
router.get("/momo/callback", paymentController.momoCallback);
router.post("/momo/ipn", paymentController.momoIpn);
router.post("/momo/deposit", protect, paymentController.createDepositPaymentMomo);

module.exports = router;
