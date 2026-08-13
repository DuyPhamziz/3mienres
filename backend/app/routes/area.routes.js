const express = require("express");
const areaController = require("../controllers/area.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Route công khai: Ai cũng xem được danh sách khu vực
router.get("/", areaController.getAllAreas);

// Các route bên dưới bắt buộc phải đăng nhập và có quyền Manager hoặc Admin
router.use(protect, restrictTo("manager", "admin"));

router.post("/", areaController.createArea);
router.patch("/:id", areaController.updateArea);
router.delete("/:id", areaController.deleteArea);

module.exports = router;