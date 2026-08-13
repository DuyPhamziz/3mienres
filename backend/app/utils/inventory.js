// Tiện ích tự động trừ kho nguyên liệu theo công thức (Recipe) khi món được phục vụ.
const Recipe = require("../models/recipe.model");
const Ingredient = require("../models/ingredient.model");
const { emitEvent } = require("../socket");

// Trừ kho cho toàn bộ món trong 1 đợt gọi món (order).
// Trả về danh sách nguyên liệu bị rơi xuống dưới ngưỡng tối thiểu (low stock).
exports.deductOrderIngredients = async (order) => {
  if (!order || !order.items || order.items.length === 0) return [];

  const lowStock = [];
  const ingredientIds = new Set();

  for (const item of order.items) {
    const recipe = await Recipe.findOne({ dish: item.dish });
    if (!recipe) continue;

    for (const line of recipe.ingredients) {
      const ingredient = await Ingredient.findById(line.ingredient);
      if (!ingredient) continue;

      const amount = line.quantityRequired * item.quantity;
      ingredient.stockQuantity = Math.max(0, ingredient.stockQuantity - amount);
      await ingredient.save();

      ingredientIds.add(ingredient._id.toString());
      if (ingredient.stockQuantity <= ingredient.minStockLevel) {
        lowStock.push({
          name: ingredient.name,
          stockQuantity: ingredient.stockQuantity,
          minStockLevel: ingredient.minStockLevel,
          unit: ingredient.unit,
        });
      }
    }
  }

  if (lowStock.length > 0) {
    emitEvent("inventory:changed", { lowStock });
  }
  if (ingredientIds.size > 0) {
    emitEvent("inventory:changed", { updated: [...ingredientIds] });
  }

  return lowStock;
};
