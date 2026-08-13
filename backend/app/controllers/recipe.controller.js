const Recipe = require("../models/recipe.model");
const Dish = require("../models/dish.model");
const Ingredient = require("../models/ingredient.model");
const AppError = require("../app-error");

// 1. Tạo hoặc Cập nhật công thức cho món ăn
exports.saveRecipe = async (req, res, next) => {
  try {
    const { dishId, ingredients, notes } = req.body;

    if (!dishId || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return next(new AppError("Vui lòng cung cấp ID món ăn (dishId) và danh sách định lượng nguyên liệu (ingredients)", 400));
    }

    const dishExists = await Dish.findById(dishId);
    if (!dishExists) return next(new AppError("Không tìm thấy món ăn này", 404));

    for (let item of ingredients) {
      if (!item.ingredient || !item.quantityRequired || item.quantityRequired <= 0) {
        return next(new AppError("Mỗi nguyên liệu trong công thức phải có ID và định lượng > 0", 400));
      }
      const ingExists = await Ingredient.findById(item.ingredient);
      if (!ingExists) return next(new AppError(`Nguyên liệu với ID '${item.ingredient}' không tồn tại`, 404));
    }

    let recipe = await Recipe.findOne({ dish: dishId });
    if (recipe) {
      recipe.ingredients = ingredients;
      if (notes !== undefined) recipe.notes = notes.trim();
      await recipe.save();
    } else {
      recipe = await Recipe.create({
        dish: dishId,
        ingredients,
        notes: notes ? notes.trim() : "",
      });
    }

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate("dish", "name price")
      .populate("ingredients.ingredient", "name unit stockQuantity");

    res.status(200).json({
      status: "success",
      message: "Lưu công thức định lượng món ăn thành công",
      data: { recipe: populatedRecipe },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy công thức định lượng của 1 món ăn
exports.getRecipeByDish = async (req, res, next) => {
  try {
    const { dishId } = req.params;
    const recipe = await Recipe.findOne({ dish: dishId })
      .populate("dish", "name price")
      .populate("ingredients.ingredient", "name unit stockQuantity minStockLevel");

    if (!recipe) {
      return next(new AppError("Món ăn này chưa được thiết lập công thức định lượng", 404));
    }

    res.status(200).json({
      status: "success",
      data: { recipe },
    });
  } catch (error) {
    next(error);
  }
};