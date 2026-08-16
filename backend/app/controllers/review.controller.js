const Review = require("../models/review.model");
const Dish = require("../models/dish.model");
const AppError = require("../app-error");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

// 1. Tạo đánh giá món ăn / trải nghiệm (Khách hàng)
exports.createReview = async (req, res, next) => {
  try {
    const { dishId, rating, comment } = req.body;

    if (!dishId || rating === undefined) {
      return next(new AppError("Vui lòng chọn món ăn (dishId) và số sao đánh giá (rating từ 1 đến 5)", 400));
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return next(new AppError("Số sao đánh giá phải là số nguyên từ 1 đến 5", 400));
    }

    const dishExists = await Dish.findById(dishId);
    if (!dishExists) return next(new AppError("Món ăn này không tồn tại", 404));

    let review = await Review.findOne({ user: req.user._id, dish: dishId });
    if (review) {
      review.rating = numRating;
      review.comment = comment ? comment.trim() : "";
      await review.save();
    } else {
      review = await Review.create({
        user: req.user ? req.user._id : null,
        dish: dishId,
        rating: numRating,
        comment: comment ? comment.trim() : "",
      });
    }

    // Cập nhật lại điểm rating trung bình của món ăn
    const reviews = await Review.find({ dish: dishId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    dishExists.ratingAverage = parseFloat(avgRating.toFixed(1));
    dishExists.ratingCount = reviews.length;
    await dishExists.save();

    const populated = await Review.findById(review._id).populate("user", "name").populate("dish", "name");

    res.status(201).json({
      status: "success",
      message: "Cảm ơn bạn đã gửi đánh giá cho món ăn!",
      data: { review: populated },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách đánh giá của 1 món ăn (Công khai)
exports.getReviewsByDish = async (req, res, next) => {
  try {
    const { dishId } = req.params;
    const reviews = await Review.find({ dish: dishId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Quản lý xem toàn bộ đánh giá
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const total = await Review.countDocuments();

    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("dish", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      ...buildPaginationMeta(total, page, limit),
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Xóa đánh giá (Chỉ Admin / Manager)
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Không tìm thấy đánh giá để xóa", 404));

    res.status(200).json({
      status: "success",
      message: "Xóa đánh giá thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
