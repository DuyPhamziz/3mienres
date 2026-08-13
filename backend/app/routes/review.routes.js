const express = require("express");
const reviewController = require("../controllers/review.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Lấy danh sách đánh giá của 1 món ăn (Công khai)
router.get("/dish/:dishId", reviewController.getReviewsByDish);

// Đăng đánh giá món ăn (Yêu cầu đăng nhập)
router.post("/", protect, reviewController.createReview);

// Vùng quản lý dành cho Manager / Admin
router.get("/", protect, restrictTo("manager", "admin"), reviewController.getAllReviews);
router.delete("/:id", protect, restrictTo("manager", "admin"), reviewController.deleteReview);

module.exports = router;
