const express = require("express");
const recipeController = require("../controllers/recipe.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("staff", "manager", "admin"));

router.get("/", recipeController.getAllRecipes);
router.post("/", restrictTo("manager", "admin"), recipeController.saveRecipe);
router.get("/dish/:dishId", recipeController.getRecipeByDish);
router.delete("/:id", restrictTo("manager", "admin"), recipeController.deleteRecipe);

module.exports = router;