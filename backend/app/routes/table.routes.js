const express = require("express");
const tableController = require("../controllers/table.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();
// Route kiểm tra bàn trống và gợi ý ghép bàn (Công khai cho khách đặt bàn và nhân viên)
router.get("/availability", tableController.checkTableAvailability)

router.get("/", tableController.getAllTables)
router.get("/:id", tableController.getTableById);
router.use(protect, restrictTo("manager", "admin"));

router.post("/", tableController.createTable);
router.patch("/:id", tableController.updateTable);
router.delete("/:id", tableController.deleteTable);

module.exports = router;