const Ingredient = require("../models/ingredient.model");
const AppError = require("../app-error");

exports.createIngredient = async (req, res, next) => {
  try {
    const { name, unit, stockQuantity, minStockLevel } = req.body;
    const existingIngredient = await Ingredient.findOne({ name });
    if (existingIngredient) {
      return next(new AppError("Nguyên liệu này đã tồn tại", 400));
    }
    const newIngredient = await Ingredient.create({
      name,
      unit,
      stockQuantity,
      minStockLevel,
    });
    res.status(201).json({
      status: "success",
      data: {
        ingredient: newIngredient,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.status(200).json({
      status: "success",
      results: ingredients.length,
      data: { ingredients },
    });
  } catch (error) {
    next(error);
  }
};
