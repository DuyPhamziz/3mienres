const Recipe = require("../models/recipe.model");
const AppError = require("../app-error");

// 1. Tạo/Cập nhật công thức món ăn (Chỉ Manager/Admin)
exports.createOrUpdateRecipe = async (req, res, next) => {
  try {
    const { dishId, ingredients } = req.body; // ingredients là mảng [{ ingredient: "id_nguyen_lieu", quantityRequired: 0.15 }]

    // Tìm xem đã có công thức cho món này chưa, nếu có thì ghi đè, chưa có thì tạo mới
    const recipe = await Recipe.findOneAndUpdate(
      { dish: dishId },
      { dish: dishId, ingredients },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: "Cập nhật công thức món ăn thành công",
      data: { recipe },
    });
  } catch (error) {
    next(error);
  }
};
