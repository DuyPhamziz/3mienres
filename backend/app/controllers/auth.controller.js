const User = require("../models/user.model");
const AppError = require("../app-error");
const { signtoken } = require("../utils/jwt");

const allowedRegisterRole = "customer";

const sanitizeAuthPayload = (payload = {}) => {
  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password;
  const phone = payload.phone?.trim();
  const role = payload.role?.trim();

  return { name, email, password, phone, role };
};

const createAuthResponse = (res, statusCode, user) => {
  const token = signtoken(user._id);
  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = sanitizeAuthPayload(req.body);

    if (!name || !email || !password || !phone) {
      return next(
        new AppError(
          "Vui lòng nhập đầy đủ họ tên, email, mật khẩu và số điện thoại",
          400,
        ),
      );
    }

    if (password.length < 6) {
      return next(new AppError("Mật khẩu phải có ít nhất 6 ký tự", 400));
    }

    if (role && role !== allowedRegisterRole) {
      return next(new AppError("Bạn không có quyền tự đăng ký vai trò này", 403));
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return next(new AppError("Email này đã được sử dụng", 409));
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return next(new AppError("Số điện thoại này đã được sử dụng", 409));
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role: allowedRegisterRole,
    });

    return createAuthResponse(res, 201, newUser);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = sanitizeAuthPayload(req.body);

    if (!email || !password) {
      return next(new AppError("Vui lòng cung cấp email và mật khẩu", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Email hoặc mật khẩu không đúng", 401));
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError("Email hoặc mật khẩu không đúng", 401));
    }

    return createAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
};
