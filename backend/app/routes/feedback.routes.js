const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// 1. Khách hàng gửi góp ý phản hồi (Công khai hoặc kèm token nếu đăng nhập)
router.post("/", (req, res, next) => {
  // Cho phép guest hoặc user đăng nhập
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, () => feedbackController.createFeedback(req, res, next));
  }
  return feedbackController.createFeedback(req, res, next);
});

// 2. Vùng quản lý phản hồi dành cho Manager / Admin
router.get("/stats", protect, restrictTo("manager", "admin"), feedbackController.getFeedbackStats);
router.get("/", protect, restrictTo("manager", "admin"), feedbackController.getAllFeedbacks);
router.patch("/:id", protect, restrictTo("manager", "admin"), feedbackController.updateFeedbackStatus);
router.delete("/:id", protect, restrictTo("manager", "admin"), feedbackController.deleteFeedback);

module.exports = router;
