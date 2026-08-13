const express = require("express");
const importReceiptController = require("../controllers/import-receipt.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("manager", "admin"));

router.post("/", importReceiptController.createImportReceipt);
router.get("/", importReceiptController.getAllImportReceipts);

module.exports = router;