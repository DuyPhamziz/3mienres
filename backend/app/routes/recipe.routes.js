const express = require("express");
const recipeController = require("../controllers/recipe.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("manager", "admin"));

router.post("/", recipeController.createOrUpdateRecipe);

module.exports = router;
