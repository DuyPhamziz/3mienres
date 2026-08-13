const express = require("express");
const rankController = require("../controllers/rank.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Lấy danh sách tất cả các hạng thành viên & phần trăm giảm giá (Công khai)
router.get("/", rankController.getAllRanks);

// Khách hàng xem thông tin hạng thành viên & điểm tích lũy của mình
router.get("/me", protect, rankController.getMyRank);

// Quản lý hạng thành viên dành riêng cho Manager / Admin
router.use(protect, restrictTo("manager", "admin"));

router.post("/", rankController.createRank);
router.patch("/:id", rankController.updateRank);
router.delete("/:id", rankController.deleteRank);

module.exports = router;
