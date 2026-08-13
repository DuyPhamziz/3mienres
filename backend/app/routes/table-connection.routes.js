const express = require("express");
const tableConnectionController = require("../controllers/table-connection.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Lấy danh sách tất cả các liên kết bàn kề nhau (Công khai)
router.get("/", tableConnectionController.getAllConnections);

// Các route bên dưới bắt buộc phải đăng nhập với quyền Manager hoặc Admin
router.use(protect, restrictTo("manager", "admin"));

// Tạo liên kết ghép bàn mới
router.post("/", tableConnectionController.createConnection);

// Xóa liên kết ghép bàn
router.delete("/:id", tableConnectionController.deleteConnection);

module.exports = router;