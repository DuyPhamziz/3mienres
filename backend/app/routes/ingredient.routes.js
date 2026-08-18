const express = require("express");
const ingredientController = require("../controllers/ingredient.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.use(protect, restrictTo("staff", "manager", "admin"));

router.get("/stats", ingredientController.getInventoryStats);
router.get("/", ingredientController.getAllIngredients);
router.post("/", restrictTo("manager", "admin"), ingredientController.createIngredient);
router.patch("/:id", restrictTo("manager", "admin"), ingredientController.updateIngredient);
router.delete("/:id", restrictTo("manager", "admin"), ingredientController.deleteIngredient);

module.exports = router;