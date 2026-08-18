const Review = require("../models/review.model");
const Dish = require("../models/dish.model");
const AppError = require("../app-error");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

// Helper cập nhật điểm rating trung bình của món ăn
async function recalculateDishRating(dishId) {
  const reviews = await Review.find({ dish: dishId, status: "VISIBLE" });
  const dish = await Dish.findById(dishId);
  if (!dish) return;

  if (reviews.length === 0) {
    dish.ratingAverage = 5.0;
    dish.ratingCount = 0;
  } else {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    dish.ratingAverage = parseFloat(avgRating.toFixed(1));
    dish.ratingCount = reviews.length;
  }
  await dish.save();
}

// 1. Tạo hoặc sửa đánh giá món ăn (Khách hàng)
exports.createReview = async (req, res, next) => {
  try {
    const { dishId, rating, comment } = req.body;

    if (!dishId || rating === undefined) {
      return next(new AppError("Vui lòng chọn món ăn và số sao đánh giá (từ 1 đến 5 sao)", 400));
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
      review.status = "VISIBLE";
      await review.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        dish: dishId,
        rating: numRating,
        comment: comment ? comment.trim() : "",
      });
    }

    // Cập nhật lại điểm trung bình
    await recalculateDishRating(dishId);

    const populated = await Review.findById(review._id)
      .populate("user", "name avatar")
      .populate("dish", "name image")
      .populate("reply.repliedBy", "name role");

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
    const reviews = await Review.find({ dish: dishId, status: "VISIBLE" })
      .populate("user", "name avatar")
      .populate("reply.repliedBy", "name role")
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

// 3. Quản lý xem toàn bộ đánh giá (Admin / Manager)
exports.getAllReviews = async (req, res, next) => {
  try {
    const { rating, status, dishId, search } = req.query;
    const filter = {};

    if (rating) filter.rating = Number(rating);
    if (status) filter.status = status;
    if (dishId) filter.dish = dishId;

    const { page, limit, skip } = getPagination(req.query);
    const total = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate("user", "name email phone avatar")
      .populate("dish", "name image price category")
      .populate("reply.repliedBy", "name role")
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

// 4. Admin phản hồi đánh giá của khách
exports.replyReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyComment } = req.body;

    if (!replyComment || !replyComment.trim()) {
      return next(new AppError("Nội dung phản hồi không được để trống", 400));
    }

    const review = await Review.findById(id);
    if (!review) return next(new AppError("Không tìm thấy đánh giá này", 404));

    review.reply = {
      comment: replyComment.trim(),
      repliedAt: new Date(),
      repliedBy: req.user ? req.user._id : null,
    };
    await review.save();

    const populated = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("dish", "name image")
      .populate("reply.repliedBy", "name role");

    res.status(200).json({
      status: "success",
      message: "Đã gửi phản hồi đánh giá thành công!",
      data: { review: populated },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Admin ẩn / hiện đánh giá
exports.toggleReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findById(id);
    if (!review) return next(new AppError("Không tìm thấy đánh giá", 404));

    review.status = status || (review.status === "VISIBLE" ? "HIDDEN" : "VISIBLE");
    await review.save();

    await recalculateDishRating(review.dish);

    res.status(200).json({
      status: "success",
      message: `Đã chuyển trạng thái đánh giá sang ${review.status === "VISIBLE" ? "HIỂN THỊ" : "ẨN"}`,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Xóa đánh giá (Admin / Manager)
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return next(new AppError("Không tìm thấy đánh giá để xóa", 404));

    const dishId = review.dish;
    await Review.findByIdAndDelete(id);
    await recalculateDishRating(dishId);

    res.status(200).json({
      status: "success",
      message: "Đã xóa đánh giá thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Thống kê KPI Đánh giá món ăn
exports.getReviewStats = async (req, res, next) => {
  try {
    const totalReviews = await Review.countDocuments();
    const reviews = await Review.find({}, "rating status");

    const visibleCount = reviews.filter((r) => r.status === "VISIBLE").length;
    const hiddenCount = reviews.filter((r) => r.status === "HIDDEN").length;
    
    const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews > 0 ? parseFloat((sumRating / totalReviews).toFixed(1)) : 5.0;

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
    });

    res.status(200).json({
      status: "success",
      data: {
        totalReviews,
        avgRating,
        visibleCount,
        hiddenCount,
        starCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
