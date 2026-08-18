const express = require("express");
const userController = require("../controllers/user.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect);

// Cập nhật hồ sơ cá nhân
router.patch("/me", userController.updateMe);
router.patch("/me/password", userController.changePassword);

// Quản lý nhân sự & phân quyền (Admin)
router.get("/staff-stats", restrictTo("admin", "manager"), userController.getStaffStats);
router.get("/", restrictTo("admin", "manager"), userController.getAllUsers);
router.post("/", restrictTo("admin"), userController.createStaff);
router.patch("/:id/reset-password", restrictTo("admin"), userController.resetPasswordByAdmin);
router.patch("/:id", restrictTo("admin"), userController.updateUserByAdmin);
router.delete("/:id", restrictTo("admin"), userController.deleteUser);

module.exports = router;
