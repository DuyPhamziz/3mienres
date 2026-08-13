const express = require("express");
const reservationController = require("../controllers/reservation.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// 1. Khách đặt bàn online (Hỗ trợ cả khách vãng lai và khách đăng nhập)
router.post("/", reservationController.createReservation);

// 2. Khách tra cứu trạng thái đơn đặt bàn theo mã code (Công khai)
router.get("/track/:code", reservationController.trackReservation);

// 3. Hủy đơn đặt bàn
router.patch("/:id/cancel", reservationController.cancelReservation);

// --- Các route yêu cầu Đăng nhập ---
router.use(protect);

// 4. Khách xem lịch sử đặt bàn của chính mình
router.get("/my-history", reservationController.getMyReservations);

// --- Các route dành riêng cho Nhân viên / Quản lý / Admin ---
router.use(restrictTo("staff", "manager", "admin"));

// 5. Xem toàn bộ danh sách đặt bàn (lọc theo ngày/trạng thái)
router.get("/", reservationController.getAllReservations);

// 6. Gán / Đổi bàn dự kiến cho đơn đặt bàn
router.patch("/:id/assign-tables", reservationController.assignTables);

module.exports = router;