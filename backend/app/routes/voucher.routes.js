const express = require("express");
const voucherController = require("../controllers/voucher.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Kiểm tra & tính giảm giá (công khai)
router.post("/validate", voucherController.validateVoucher);

// Quản lý voucher (Manager / Admin)
router.use(protect, restrictTo("manager", "admin"));
router.post("/", voucherController.createVoucher);
router.get("/", voucherController.getAllVouchers);

module.exports = router;
