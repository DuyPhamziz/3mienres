const express = require("express");
const orderController = require("../controllers/order.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Khách tự gọi món qua QR bàn (công khai, không cần đăng nhập)
router.post("/guest", orderController.createGuestOrder);

router.use(protect, restrictTo("staff", "manager", "admin"));

// Tạo đợt gọi món tại bàn
router.post("/", orderController.createOrder);

// Lấy danh sách đơn món cho màn hình bếp (KDS)
router.get("/kitchen", orderController.getKitchenOrders);

// Lấy danh sách các đợt gọi món của 1 bàn
router.get("/session/:sessionId", orderController.getOrdersBySession);

// Cập nhật trạng thái món ăn (Bếp / Nhân viên)
router.patch("/:id/status", orderController.updateOrderStatus);

module.exports = router;