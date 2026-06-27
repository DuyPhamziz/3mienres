const express = require("express");
const tableController = require("../controllers/table.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

// Tất cả các API quản lý bàn ăn đều yêu cầu quyền Quản lý/Admin
router.use(protect, restrictTo("manager", "admin"));

router
  .route("/")
  .get(tableController.getAllTables)
  .post(tableController.createTable);

router.route("/:id").delete(tableController.deleteTable);

module.exports = router;
