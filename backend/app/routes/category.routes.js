const express = require("express");
const categoryController = require("../controllers/category.controller");
const { protect, restrictTo } = require("../utils/auth");

const router = express.Router();

router.get("/", categoryController.getAllCategories);

router.use(protect, restrictTo("manager", "admin"));
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;