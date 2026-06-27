const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: [true, "Công thức phải thuộc về một món ăn cụ thể"],
      unique: true, // Một món ăn chỉ nên có một công thức định lượng duy nhất
    },
    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        quantityRequired: {
          type: Number,
          required: true, // Khối lượng cần dùng (ví dụ: 0.15 cho 150g thịt bò)
          min: [0.001, "Lượng nguyên liệu cần phải lớn hơn 0"],
        },
      },
    ],
    instructions: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Recipe", recipeSchema);
