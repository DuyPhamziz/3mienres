const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/user.model");
const AppError = require("../app-error");

// 1. Middleware xác thực token JWT
exports.protect = async (req, res, next) => {
  try {
    let token;
    // 1,Lấy token từ header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError(
          "Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.",
          401,
        ),
      );
    }
    // 2. Giải mã token và lấy thông tin người dùng từ payload}
    const decoded = jwt.verify(token, config.jwtSecret);

    // Chỉ chấp nhận access token, từ chối refresh token
    if (decoded.type === "refresh") {
      return next(new AppError("Token không hợp lệ. Vui lòng sử dụng access token.", 401));
    }

    // 3. Kiểm tra xem người dùng có tồn tại không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("Người dùng thuộc token này không còn tồn tại.", 401),
      );
    }

    // 4. Chặn tài khoản đã bị khóa
    if (currentUser.isActive === false) {
      return next(
        new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.", 403),
      );
    }

    //5. Lưu thông tin người dùng vào req.user để các middleware tiếp theo có thể sử dụng
    req.user = currentUser;
    next();
  } catch (error) {
    // Map lỗi JWT về 401, không để lộ thông tin nội bộ
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Token không hợp lệ. Vui lòng đăng nhập lại.", 401));
    }
    next(error);
  }
};
exports.optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded && decoded.type !== "refresh") {
        const currentUser = await User.findById(decoded.id);
        if (currentUser && currentUser.isActive !== false) {
          req.user = currentUser;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Bạn không có quyền thực hiện hành động này.", 403));
    }
    next();
  };
};
