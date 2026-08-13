const User = require("../models/user.model");
const AppError = require("../app-error");
const { isValidEmail, isValidPhone } = require("../utils/validate");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

// 1. Cập nhật hồ sơ cá nhân (tên, số điện thoại, ảnh đại diện, địa chỉ)
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar, addresses } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("Không tìm thấy tài khoản", 404));

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;

    if (phone && phone.trim() !== user.phone) {
      const existing = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
      if (existing) return next(new AppError("Số điện thoại này đã được sử dụng", 409));
      user.phone = phone.trim();
    }

    if (Array.isArray(addresses)) {
      user.addresses = addresses.map((a, i) => ({
        title: a.title?.trim() || `Địa chỉ ${i + 1}`,
        addressDetail: a.addressDetail?.trim() || "",
        ward: a.ward?.trim() || "",
        district: a.district?.trim() || "",
        city: a.city?.trim() || "",
        isDefault: !!a.isDefault,
      }));
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "Cập nhật hồ sơ thành công",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Đổi mật khẩu
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError("Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới", 400));
    }
    if (newPassword.length < 6) {
      return next(new AppError("Mật khẩu mới phải có ít nhất 6 ký tự", 400));
    }

    const user = await User.findById(req.user._id).select("+password");
    const isCorrect = await user.comparePassword(currentPassword);
    if (!isCorrect) {
      return next(new AppError("Mật khẩu hiện tại không đúng", 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ status: "success", message: "Đổi mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};

// 3. Danh sách toàn bộ tài khoản (Manager / Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const { page, limit, skip } = getPagination(req.query);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      results: users.length,
      ...buildPaginationMeta(total, page, limit),
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Tạo tài khoản nhân viên (Manager / Admin)
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return next(new AppError("Thiếu thông tin: name, email, password, phone", 400));
    }
    if (!["staff", "manager"].includes(role)) {
      return next(new AppError("Chỉ cho phép tạo tài khoản staff hoặc manager", 400));
    }
    if (!isValidEmail(email)) {
      return next(new AppError("Email không hợp lệ", 400));
    }
    if (!isValidPhone(phone)) {
      return next(new AppError("Số điện thoại không hợp lệ", 400));
    }
    if (password.length < 6) {
      return next(new AppError("Mật khẩu tối thiểu 6 ký tự", 400));
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return next(new AppError("Email hoặc số điện thoại đã tồn tại", 409));

    const user = await User.create({ name, email, password, phone, role });
    user.password = undefined;

    res.status(201).json({ status: "success", message: "Tạo tài khoản nhân viên thành công", data: { user } });
  } catch (error) {
    next(error);
  }
};

// 5. Cập nhật tài khoản / phân quyền (Manager / Admin)
exports.updateUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) return next(new AppError("Không tìm thấy tài khoản", 404));

    if (role && !["customer", "staff", "manager", "admin"].includes(role)) {
      return next(new AppError("Vai trò không hợp lệ", 400));
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = !!isActive;

    await user.save();
    user.password = undefined;

    res.status(200).json({ status: "success", message: "Cập nhật tài khoản thành công", data: { user } });
  } catch (error) {
    next(error);
  }
};
