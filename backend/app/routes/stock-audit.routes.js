const express = require("express");
const stockAuditController = require("../controllers/stock-audit.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("staff", "manager", "admin"));

router.get("/consumption-report", stockAuditController.getConsumptionReport);
router.get("/", stockAuditController.getAllStockAudits);
router.post("/", stockAuditController.createStockAudit);
router.patch("/:id/apply", restrictTo("manager", "admin"), stockAuditController.applyStockAudit);

module.exports = router;
