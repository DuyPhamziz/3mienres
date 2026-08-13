const Rank = require("../models/rank.model");
const User = require("../models/user.model");
const AppError = require("../app-error");

// 1. Tạo hạng thành viên mới (Chỉ Manager / Admin)
exports.createRank = async (req, res, next) => {
  try {
    const { name, minSpent, discountPercent, icon, description } = req.body;

    if (!name || minSpent === undefined || discountPercent === undefined) {
      return next(new AppError("Vui lòng nhập đầy đủ: Tên hạng (name), Mức chi tiêu tối thiểu (minSpent) và % Giảm giá (discountPercent)", 400));
    }

    const existing = await Rank.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return next(new AppError(`Hạng thành viên '${name}' đã tồn tại`, 409));
    }

    const newRank = await Rank.create({
      name: name.trim(),
      minSpent: parseFloat(minSpent),
      discountPercent: parseFloat(discountPercent),
      icon: icon ? icon.trim() : "default-rank.png",
      description: description ? description.trim() : "",
      isActive: true,
    });

    res.status(201).json({
      status: "success",
      message: "Tạo hạng thành viên mới thành công",
      data: { rank: newRank },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả các hạng thành viên (Công khai)
exports.getAllRanks = async (req, res, next) => {
  try {
    const ranks = await Rank.find({ isActive: true }).sort({ minSpent: 1 });

    res.status(200).json({
      status: "success",
      results: ranks.length,
      data: { ranks },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Khách hàng xem thông tin Hạng thành viên của riêng mình
exports.getMyRank = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("rank");
    if (!user) return next(new AppError("Không tìm thấy thông tin tài khoản", 404));

    // Lấy tất cả các hạng xếp theo thứ tự mức chi tiêu tăng dần
    const allRanks = await Rank.find({ isActive: true }).sort({ minSpent: 1 });

    // Tìm hạng tiếp theo người dùng cần phấn đấu đạt tới
    const totalSpent = user.totalSpent || 0;
    const currentRank = user.rank;
    let nextRank = null;
    let amountToNextRank = 0;

    for (let r of allRanks) {
      if (r.minSpent > totalSpent) {
        nextRank = r;
        amountToNextRank = r.minSpent - totalSpent;
        break;
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        totalSpent,
        currentRank: currentRank || (allRanks.length > 0 ? allRanks[0] : null),
        nextRank,
        amountToNextRank, // Số tiền còn thiếu để thăng hạng
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Cập nhật hạng thành viên
exports.updateRank = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, minSpent, discountPercent, icon, description, isActive } = req.body;

    const rank = await Rank.findById(id);
    if (!rank) return next(new AppError("Không tìm thấy hạng thành viên", 404));

    if (name && name.trim().toLowerCase() !== rank.name.toLowerCase()) {
      const duplicate = await Rank.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") }, _id: { $ne: id } });
      if (duplicate) return next(new AppError(`Tên hạng '${name}' đã tồn tại`, 409));
      rank.name = name.trim();
    }

    if (minSpent !== undefined) rank.minSpent = parseFloat(minSpent);
    if (discountPercent !== undefined) rank.discountPercent = parseFloat(discountPercent);
    if (icon !== undefined) rank.icon = icon.trim();
    if (description !== undefined) rank.description = description.trim();
    if (isActive !== undefined) rank.isActive = Boolean(isActive);

    await rank.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật hạng thành viên thành công",
      data: { rank },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Xóa hạng thành viên
exports.deleteRank = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Rank.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Không tìm thấy hạng thành viên để xóa", 404));

    res.status(200).json({
      status: "success",
      message: "Xóa hạng thành viên thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
