const express = require("express");
const categoryController = require("../controllers/category.controller.js");
const { protect, restrictTo } = require("../utils/auth.js");

const router = express.Router();
// Lấy danh mục: GET http://localhost:3000/api/categories (Ai cũng xem được)
// Tạo danh mục: POST http://localhost:3000/api/categories (Phải đăng nhập + là manager/admin)
router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(
    protect,
    restrictTo("admin", "manager"),
    categoryController.createCategory,
  );

module.exports = router;
