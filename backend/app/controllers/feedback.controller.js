const Feedback = require("../models/feedback.model");
const AppError = require("../app-error");
const { getPagination, buildPaginationMeta, buildSearchFilter } = require("../utils/pagination");
const { emitEvent } = require("../socket");

// 1. Khách hàng gửi góp ý / phản hồi
exports.createFeedback = async (req, res, next) => {
  try {
    const { name, phone, email, category, rating, subject, content } = req.body;

    if (!name || !name.trim()) return next(new AppError("Vui lòng nhập họ tên của bạn", 400));
    if (!phone || !phone.trim()) return next(new AppError("Vui lòng nhập số điện thoại", 400));
    if (!content || !content.trim()) return next(new AppError("Vui lòng nhập nội dung góp ý", 400));

    const feedback = await Feedback.create({
      user: req.user ? req.user._id : null,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      category: category || "SERVICE",
      rating: Number(rating) || 5,
      subject: subject ? subject.trim() : "Góp ý chất lượng dịch vụ",
      content: content.trim(),
      status: "PENDING",
    });

    emitEvent("feedback:new", { feedbackId: feedback._id, name: feedback.name });

    res.status(201).json({
      status: "success",
      message: "Cảm ơn bạn đã gửi ý kiến phản hồi! Nhà hàng 3 Miền Cua sẽ ghi nhận và không ngừng nâng cao chất lượng dịch vụ.",
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Admin / Manager xem danh sách các phản hồi góp ý
exports.getAllFeedbacks = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const searchFilter = buildSearchFilter(search, ["name", "phone", "email", "content", "subject"]);
    if (searchFilter) Object.assign(filter, searchFilter);

    const { page, limit, skip } = getPagination(req.query);
    const total = await Feedback.countDocuments(filter);

    const feedbacks = await Feedback.find(filter)
      .populate("user", "name email phone")
      .populate("resolvedBy", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: feedbacks.length,
      ...buildPaginationMeta(total, page, limit),
      data: { feedbacks },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Admin / Manager cập nhật trạng thái phản hồi
exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) return next(new AppError("Không tìm thấy phản hồi này", 404));

    if (status) feedback.status = status;
    if (adminNote !== undefined) feedback.adminNote = adminNote.trim();

    if (status === "RESOLVED") {
      feedback.resolvedAt = new Date();
      feedback.resolvedBy = req.user ? req.user._id : null;
    }

    await feedback.save();

    const populated = await Feedback.findById(feedback._id)
      .populate("user", "name email phone")
      .populate("resolvedBy", "name role");

    res.status(200).json({
      status: "success",
      message: "Cập nhật trạng thái phản hồi thành công!",
      data: { feedback: populated },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Admin / Manager xóa phản hồi
exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Không tìm thấy phản hồi để xóa", 404));

    res.status(200).json({
      status: "success",
      message: "Đã xóa phản hồi thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Thống kê KPI Phản hồi
exports.getFeedbackStats = async (req, res, next) => {
  try {
    const total = await Feedback.countDocuments();
    const pending = await Feedback.countDocuments({ status: "PENDING" });
    const reviewed = await Feedback.countDocuments({ status: "REVIEWED" });
    const resolved = await Feedback.countDocuments({ status: "RESOLVED" });

    res.status(200).json({
      status: "success",
      data: {
        total,
        pending,
        reviewed,
        resolved,
      },
    });
  } catch (error) {
    next(error);
  }
};
