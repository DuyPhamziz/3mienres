const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("manager", "admin"));

router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;