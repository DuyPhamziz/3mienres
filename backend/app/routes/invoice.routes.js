const express = require("express");
const invoiceController = require("../controllers/invoice.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("staff", "manager", "admin"));

// Tạo hóa đơn & Thanh toán giải phóng bàn
router.post("/", invoiceController.createInvoice);

// Lấy hóa đơn của 1 lượt dùng bữa
router.get("/session/:sessionId", invoiceController.getInvoiceBySession);

// Xem tất cả hóa đơn / Thống kê doanh thu
router.get("/", invoiceController.getAllInvoices);

module.exports = router;