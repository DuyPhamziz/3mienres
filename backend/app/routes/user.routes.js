const express = require("express");
const userController = require("../controllers/user.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect);

// Cập nhật hồ sơ cá nhân
router.patch("/me", userController.updateMe);
router.patch("/me/password", userController.changePassword);

// Quản lý tài khoản (Manager / Admin)
router.get("/", restrictTo("admin"), userController.getAllUsers);
router.post("/", restrictTo("admin"), userController.createStaff);
router.patch("/:id", restrictTo("admin"), userController.updateUserByAdmin);

module.exports = router;
