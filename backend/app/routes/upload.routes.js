const express = require("express");
const uploadController = require("../controllers/upload.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("staff", "manager", "admin"));

// Route upload 1 file ảnh
router.post("/", uploadController.uploadSingle, uploadController.uploadResponse);

module.exports = router;
