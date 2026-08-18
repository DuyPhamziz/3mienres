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

// 2. Đổi mật khẩu cá nhân
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

// 3. Danh sách toàn bộ tài khoản (Khách hàng / Nhân viên)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, department, shift, isActive, rank } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (shift) filter.shift = shift;
    if (rank) filter.rank = rank;
    if (isActive !== undefined && isActive !== "") filter.isActive = isActive === "true";

    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
        { employeeCode: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const { page, limit, skip } = getPagination(req.query);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .populate("rank", "name minSpent discountPercent badgeColor icon")
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

// 4. Tạo tài khoản nhân sự mới (Admin)
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, employeeCode, department, shift, salary, hireDate, notes } = req.body;

    if (!name || !email || !password || !phone) {
      return next(new AppError("Thiếu thông tin bắt buộc: Họ tên, Email, Mật khẩu, Số điện thoại", 400));
    }
    if (!["staff", "manager", "admin"].includes(role)) {
      return next(new AppError("Vai trò không hợp lệ", 400));
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
    if (existing) return next(new AppError("Email hoặc số điện thoại đã tồn tại trong hệ thống", 409));

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      role: role || "staff",
      employeeCode: employeeCode ? employeeCode.trim().toUpperCase() : undefined,
      department: department || "GENERAL",
      shift: shift || "FULLTIME",
      salary: Number(salary) || 0,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      notes: notes ? notes.trim() : undefined,
    });

    user.password = undefined;

    res.status(201).json({
      status: "success",
      message: "Tạo tài khoản nhân sự mới thành công",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Cập nhật thông tin tài khoản / Phân quyền / Khóa - Mở khóa (Admin)
exports.updateUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, role, isActive, employeeCode, department, shift, salary, hireDate, notes, totalSpent, rank } = req.body;

    const user = await User.findById(id);
    if (!user) return next(new AppError("Không tìm thấy tài khoản", 404));

    if (role && !["customer", "staff", "manager", "admin"].includes(role)) {
      return next(new AppError("Vai trò không hợp lệ", 400));
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = !!isActive;
    if (employeeCode !== undefined) user.employeeCode = employeeCode ? employeeCode.trim().toUpperCase() : undefined;
    if (department) user.department = department;
    if (shift) user.shift = shift;
    if (salary !== undefined) user.salary = Number(salary) || 0;
    if (hireDate) user.hireDate = new Date(hireDate);
    if (notes !== undefined) user.notes = notes ? notes.trim() : "";
    if (totalSpent !== undefined) user.totalSpent = Math.max(0, Number(totalSpent) || 0);
    if (rank !== undefined) user.rank = rank || null;

    await user.save();
    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "Cập nhật thông tin tài khoản thành công",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Admin đặt lại mật khẩu cho tài khoản
exports.resetPasswordByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return next(new AppError("Mật khẩu mới phải có ít nhất 6 ký tự", 400));
    }

    const user = await User.findById(id);
    if (!user) return next(new AppError("Không tìm thấy tài khoản này", 404));

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: `Đã cấp lại mật khẩu mới cho ${user.name} thành công!`,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Admin xóa tài khoản
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user && req.user._id.toString() === id) {
      return next(new AppError("Bạn không thể tự xóa tài khoản của chính mình!", 400));
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return next(new AppError("Không tìm thấy tài khoản để xóa", 404));

    res.status(200).json({
      status: "success",
      message: "Đã xóa tài khoản thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// 8. Thống kê KPI nhân sự
exports.getStaffStats = async (req, res, next) => {
  try {
    const totalStaff = await User.countDocuments({ role: { $in: ["staff", "manager", "admin"] } });
    const activeStaff = await User.countDocuments({ role: { $in: ["staff", "manager", "admin"] }, isActive: true });
    const managers = await User.countDocuments({ role: "manager" });
    const kitchenStaff = await User.countDocuments({ department: "KITCHEN" });
    const serviceStaff = await User.countDocuments({ department: "SERVICE" });

    res.status(200).json({
      status: "success",
      data: {
        totalStaff,
        activeStaff,
        managers,
        kitchenStaff,
        serviceStaff,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 9. Thống kê KPI Khách hàng & Hội viên
exports.getCustomerStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const activeCustomers = await User.countDocuments({ role: "customer", isActive: true });
    const lockedCustomers = await User.countDocuments({ role: "customer", isActive: false });

    const customerSpentAgg = await User.aggregate([
      { $match: { role: "customer" } },
      { $group: { _id: null, totalSpent: { $sum: "$totalSpent" } } },
    ]);
    const totalCustomerSpent = customerSpentAgg.length > 0 ? customerSpentAgg[0].totalSpent : 0;

    res.status(200).json({
      status: "success",
      data: {
        totalCustomers,
        activeCustomers,
        lockedCustomers,
        totalCustomerSpent,
      },
    });
  } catch (error) {
    next(error);
  }
};
