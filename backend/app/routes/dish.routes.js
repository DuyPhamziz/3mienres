const express = require("express");
const dishController = require("../controllers/dish.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Route công khai: Khách hàng xem thực đơn, chi tiết món ăn
router.get("/", dishController.getAllDishes);
router.get("/:id", dishController.getDishById);

// Các route quản lý món ăn
router.use(protect);

// Nhân viên được phép bật/tắt nhanh hết món
router.patch("/:id/toggle-availability", restrictTo("staff", "manager", "admin"), dishController.toggleAvailability);

// Chỉ Manager và Admin mới được Tạo/Sửa/Xóa món
router.use(restrictTo("manager", "admin"));
router.get("/slug/:slug", dishController.getDishBySlug);
router.post("/", dishController.createDish);
router.patch("/:id", dishController.updateDish);
router.delete("/:id", dishController.deleteDish);

module.exports = router;