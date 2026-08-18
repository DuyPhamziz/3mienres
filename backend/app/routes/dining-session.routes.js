const express = require("express");
const diningSessionController = require("../controllers/dining-session.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Tất cả các thao tác Check-in, Mở bàn Walk-in, Đổi bàn đều cần tài khoản Nhân viên / Quản lý / Admin
router.use(protect, restrictTo("staff", "manager", "admin"));

// Check-in cho khách đặt trước
router.post("/check-in", diningSessionController.checkInReservation);

// Tiếp nhận khách Walk-in trực tiếp
router.post("/walk-in", diningSessionController.createWalkInSession);

// Lấy danh sách các bàn đang ăn (Active Sessions)
router.get("/active", diningSessionController.getActiveSessions);

// Đổi bàn / Ghép thêm bàn khi đang ăn
router.patch("/:id/change-tables", diningSessionController.changeTables);

// Gộp 2 bàn / 2 lượt dùng bữa thành 1 hóa đơn duy nhất
router.post("/:id/merge", diningSessionController.mergeSessions);

module.exports = router;