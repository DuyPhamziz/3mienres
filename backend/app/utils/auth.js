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

    // 3. Kiểm tra xem người dùng có tồn tại không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("Người dùng thuộc token này không còn tồn tại.", 401),
      );
    }

    //4. Lưu thông tin người dùng vào req.user để các middleware tiếp theo có thể sử dụng
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // req.user được gán từ middleware 'protect' chạy trước đó
      return next(
        new AppError("Bạn không có quyền thực hiện hành động này.", 403),
      );
    }
    next();
  };
};
