const express = require("express");
const dishController = require("../controllers/dish.controller");
const { protect, restrictTo } = require("../utils/auth.js");

const router = express.Router();
router
  .route("/")
  .get(dishController.getAllDishes)
  .post(protect, restrictTo("admin", "manager"), dishController.createDish);

router
  .route("/:id")
  .put(protect, restrictTo("admin", "manager"), dishController.updateDish)
  .delete(protect, restrictTo("admin", "manager"), dishController.deleteDish);

module.exports = router;
