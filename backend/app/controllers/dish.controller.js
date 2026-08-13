const Dish = require("../models/dish.model");
const Category = require("../models/category.model");
const AppError = require("../app-error");
const slugify = require("../utils/slugify");

// 1. Tạo món ăn mới (Tự động sinh Slug đẹp cho URL)
exports.createDish = async (req, res, next) => {
  try {
    const { name, category, price, region, description, image, images, isFeatured } = req.body;

    if (!name || !category || price === undefined || !description || !image) {
      return next(new AppError("Vui lòng nhập đầy đủ: Tên món (name), Danh mục (category), Giá (price), Mô tả và Ảnh đại diện", 400));
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return next(new AppError("Giá món ăn phải là số dương hợp lệ", 400));
    }

    const validRegion = region ? region.trim() : "Nam";
    if (!["Bắc", "Trung", "Nam"].includes(validRegion)) {
      return next(new AppError("Vùng miền không hợp lệ (Chấp nhận: 'Bắc', 'Trung', 'Nam')", 400));
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return next(new AppError("Danh mục món ăn được chọn không tồn tại", 404));

    const slug = slugify(name);
    const duplicate = await Dish.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (duplicate) {
      return next(new AppError(`Món ăn '${name}' đã tồn tại trong thực đơn`, 409));
    }

    const newDish = await Dish.create({
      name: name.trim(),
      slug,
      category,
      price: numericPrice,
      region: validRegion,
      description: description.trim(),
      image: image.trim(),
      images: Array.isArray(images) ? images : [],
      isFeatured: Boolean(isFeatured),
      availability: true,
    });

    const populatedDish = await Dish.findById(newDish._id).populate("category", "name slug");

    res.status(201).json({
      status: "success",
      message: "Thêm món ăn mới thành công",
      data: { dish: populatedDish },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách thực đơn (Lọc theo miền, danh mục, tìm kiếm, slug)
exports.getAllDishes = async (req, res, next) => {
  try {
    const { category, region, isFeatured, availability, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (region) filter.region = region;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (availability !== undefined) filter.availability = availability === "true";
    if (search) filter.name = { $regex: search.trim(), $options: "i" };

    const dishes = await Dish.find(filter).populate("category", "name slug").sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: dishes.length,
      data: { dishes },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Tra cứu chi tiết món ăn bằng Slug (Dành cho trang chi tiết món ăn trên Web)
exports.getDishBySlug = async (req, res, next) => {
  try {
    const dish = await Dish.findOne({ slug: req.params.slug }).populate("category", "name slug description");
    if (!dish) return next(new AppError("Không tìm thấy món ăn này", 404));

    res.status(200).json({
      status: "success",
      data: { dish },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Xem chi tiết món ăn theo ID
exports.getDishById = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).populate("category", "name slug description");
    if (!dish) return next(new AppError("Không tìm thấy món ăn này", 404));

    res.status(200).json({
      status: "success",
      data: { dish },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Bật/tắt nhanh hết món
exports.toggleAvailability = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return next(new AppError("Không tìm thấy món ăn", 404));

    dish.availability = !dish.availability;
    await dish.save();

    res.status(200).json({
      status: "success",
      message: `Đã đổi trạng thái món '${dish.name}' thành ${dish.availability ? "CÒN HÀNG" : "HẾT HÀNG"}`,
      data: { dish },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Cập nhật món ăn
exports.updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, region, description, image, images, isFeatured, availability } = req.body;

    const dish = await Dish.findById(id);
    if (!dish) return next(new AppError("Không tìm thấy món ăn để cập nhật", 404));

    if (name && name.trim().toLowerCase() !== dish.name.toLowerCase()) {
      const newSlug = slugify(name);
      const duplicate = await Dish.findOne({ slug: newSlug, _id: { $ne: id } });
      if (duplicate) return next(new AppError(`Tên món '${name}' đã tồn tại`, 409));
      dish.name = name.trim();
      dish.slug = newSlug;
    }

    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice < 0) return next(new AppError("Giá phải là số dương", 400));
      dish.price = numPrice;
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) return next(new AppError("Danh mục không tồn tại", 404));
      dish.category = category;
    }

    if (region) dish.region = region;
    if (description !== undefined) dish.description = description.trim();
    if (image !== undefined) dish.image = image.trim();
    if (Array.isArray(images)) dish.images = images;
    if (isFeatured !== undefined) dish.isFeatured = Boolean(isFeatured);
    if (availability !== undefined) dish.availability = Boolean(availability);

    await dish.save();

    const updated = await Dish.findById(dish._id).populate("category", "name slug");

    res.status(200).json({
      status: "success",
      message: "Cập nhật món ăn thành công",
      data: { dish: updated },
    });
  } catch (error) {
    next(error);
  }
};

// 7. Xóa món ăn
exports.deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Dish.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Không tìm thấy món ăn để xóa", 404));

    res.status(200).json({
      status: "success",
      message: "Xóa món ăn thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};