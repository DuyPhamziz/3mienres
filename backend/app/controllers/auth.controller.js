const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const AppError = require("../app-error");
const config = require("../config");
const { signtoken, signAccessToken, signRefreshToken } = require("../utils/jwt");

const allowedRegisterRole = "customer";
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày

const sanitizeAuthPayload = (payload = {}) => {
  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password;
  const phone = payload.phone?.trim();
  const role = payload.role?.trim();

  return { name, email, password, phone, role };
};

// Cấp & lưu refresh token mới cho user
const issueRefreshToken = async (user) => {
  const refreshToken = signRefreshToken(user._id);
  user.refreshToken = refreshToken;
  user.refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await user.save();
  return refreshToken;
};

const createAuthResponse = (res, statusCode, user, refreshToken) => {
  const accessToken = signAccessToken(user._id);
  user.password = undefined;
  user.refreshToken = undefined;

  return res.status(statusCode).json({
    status: "success",
    token: accessToken,
    refreshToken,
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

    const refreshToken = await issueRefreshToken(newUser);
    return createAuthResponse(res, 201, newUser, refreshToken);
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

    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user) {
      return next(new AppError("Email hoặc mật khẩu không đúng", 401));
    }

    if (user.isActive === false) {
      return next(new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.", 403));
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError("Email hoặc mật khẩu không đúng", 401));
    }

    const refreshToken = await issueRefreshToken(user);
    return createAuthResponse(res, 200, user, refreshToken);
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

// Cấp lại access token mới từ refresh token
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError("Thiếu refresh token", 400));
    }

    const decoded = jwt.verify(refreshToken, config.jwtSecret);
    if (decoded.type !== "refresh") {
      return next(new AppError("Token không hợp lệ", 401));
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError("Refresh token không hợp lệ", 401));
    }
    if (user.refreshTokenExpires && new Date(user.refreshTokenExpires) < new Date()) {
      return next(new AppError("Refresh token đã hết hạn, vui lòng đăng nhập lại", 401));
    }

    // Xoay vòng refresh token mới
    const newRefreshToken = await issueRefreshToken(user);
    return createAuthResponse(res, 200, user, newRefreshToken);
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return next(new AppError("Refresh token không hợp lệ hoặc đã hết hạn", 401));
    }
    next(error);
  }
};

// Đăng xuất: xóa refresh token đang lưu
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");
    if (user) {
      user.refreshToken = null;
      user.refreshTokenExpires = null;
      await user.save();
    }
    res.status(200).json({ status: "success", message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};

// Giữ lại export signtoken để tương thích nếu nơi khác dùng
exports.signtoken = signtoken;
