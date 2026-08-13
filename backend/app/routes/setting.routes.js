const express = require("express");
const settingController = require("../controllers/setting.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.get("/", settingController.getSettings);

router.use(protect, restrictTo("manager", "admin"));
router.patch("/", settingController.updateSettings);

module.exports = router;