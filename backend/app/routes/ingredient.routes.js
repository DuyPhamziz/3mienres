const express = require("express");
const ingredientController = require("../controllers/ingredient.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("manager", "admin"));

router
  .route("/")
  .get(ingredientController.getAllIngredients)
  .post(ingredientController.createIngredient);

module.exports = router;
