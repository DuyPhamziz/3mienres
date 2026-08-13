const express = require("express");
const auditController = require("../controllers/audit.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.get("/", protect, restrictTo("manager", "admin"), auditController.getAllLogs);

module.exports = router;
