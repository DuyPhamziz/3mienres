const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { protect } = require("../utils/auth");

const router = express.Router();

// Callback từ VNPay (công khai - VNPay gọi trực tiếp)
router.get("/vnpay/callback", paymentController.vnpayCallback);

// Tạo URL thanh toán cọc (cần đăng nhập để xác định chính chủ)
router.post("/vnpay/deposit", protect, paymentController.createDepositPayment);

module.exports = router;
