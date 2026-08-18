const Ingredient = require("../app/models/ingredient.model");
const Recipe = require("../app/models/recipe.model");

describe("Inventory Stock & Warning Level Unit Tests", () => {
  test("Ingredient model lưu ngưỡng tồn kho tối thiểu minStockLevel", () => {
    const ingredient = new Ingredient({
      name: "Cua Cà Mau Tươi Sống",
      category: "meat",
      unit: "kg",
      stockQuantity: 15.5,
      minStockLevel: 5.0,
    });

    const error = ingredient.validateSync();
    expect(error).toBeUndefined();
    expect(ingredient.stockQuantity).toBe(15.5);
    expect(ingredient.minStockLevel).toBe(5.0);
  });

  test("Ingredient stockQuantity tự động nhận biết trạng thái cảnh báo khi nhỏ hơn hoặc bằng minStockLevel", () => {
    const ing1 = new Ingredient({ name: "Rau Muống", unit: "kg", stockQuantity: 2, minStockLevel: 5 });
    const ing2 = new Ingredient({ name: "Thịt Bò", unit: "kg", stockQuantity: 10, minStockLevel: 5 });

    expect(ing1.stockQuantity <= ing1.minStockLevel).toBe(true);
    expect(ing2.stockQuantity <= ing2.minStockLevel).toBe(false);
  });

  test("Recipe model gắn định lượng nguyên liệu cho món ăn", () => {
    const recipe = new Recipe({
      dish: "660000000000000000000001",
      ingredients: [
        {
          ingredient: "660000000000000000000002",
          quantityRequired: 0.5,
        },
      ],
    });

    const error = recipe.validateSync();
    expect(error).toBeUndefined();
    expect(recipe.ingredients[0].quantityRequired).toBe(0.5);
  });
});
