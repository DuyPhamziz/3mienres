const express = require("express");
const reservationController = require("../controllers/reservation.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect);
// 1. Tạo đơn đặt bàn, bắt buộc người dùng phải đăng nhập
router.post("/", reservationController.createReservation);

// 2. Xem lịch sử đặt bàn của người dùng, bắt buộc người dùng phải đăng nhập
router.get("/my-history", reservationController.getMyReservations);

// 3. Xem chi tiết đơn đặt bàn, bắt buộc người dùng phải đăng nhập
router.get("/:id", reservationController.getReservationDetails);

router.post("/:id/mock-pay", reservationController.mockPayment);
// Vùng chỉ dành cho quản trị viên, quản lý và nhân viên
router.use(restrictTo("admin", "manager"));

// Lấy toàn bộ đơn đặt bàn, chỉ dành cho quản trị viên và quản lý
router.get("/", reservationController.getAllReservations);
// Duyệt và cập nhật trạng thái đơn đặt bàn, chỉ dành cho quản trị viên và quản lý
router.patch("/:id/status", reservationController.updateReservationStatus);

// Xếp bàn cho khách
router.patch("/:id/assign-table", reservationController.assignTable);

module.exports = router;
