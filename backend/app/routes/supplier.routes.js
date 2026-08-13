const express = require("express");
const supplierController = require("../controllers/supplier.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("manager", "admin"));

router.get("/", supplierController.getAllSuppliers);
router.post("/", supplierController.createSupplier);
router.patch("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
