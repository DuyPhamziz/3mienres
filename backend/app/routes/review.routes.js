const express = require("express");
const reviewController = require("../controllers/review.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// 1. Lấy danh sách đánh giá của 1 món ăn (Công khai)
router.get("/dish/:dishId", reviewController.getReviewsByDish);

// 2. Đăng / Sửa đánh giá món ăn (Khách hàng đăng nhập)
router.post("/", protect, reviewController.createReview);

// 3. Vùng quản lý dành cho Manager / Admin
router.get("/stats", protect, restrictTo("manager", "admin"), reviewController.getReviewStats);
router.get("/", protect, restrictTo("manager", "admin"), reviewController.getAllReviews);
router.patch("/:id/reply", protect, restrictTo("manager", "admin"), reviewController.replyReview);
router.patch("/:id/status", protect, restrictTo("manager", "admin"), reviewController.toggleReviewStatus);
router.delete("/:id", protect, restrictTo("manager", "admin"), reviewController.deleteReview);

module.exports = router;
