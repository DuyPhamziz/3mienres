const User = require("../models/user.model");
const AppError = require("../app-error");
const { signtoken } = require("../utils/jwt");

// 1. Logic đăng kí
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    // Kiểm tra email này được sử dụng chưa?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email đã được sử dụng", 400));
    }
    // Tạo tài khoản mới
    const newUser = await User.create({
      name,
      email,
      password, // Mật khẩu sẽ được hash trong pre-save hook của model
      phone,
      role: role || "customer", // Mặc định role là "customer" nếu không được cung cấp
    });
    const token = signtoken(newUser._id);
    // Ẩn mật khẩu trước khi gửi phản hồi
    newUser.password = undefined;

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error); // Gọi middleware xử lý lỗi
  }
};

// 2. Logic đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem email và password có được cung cấp không
    if (!email || !password) {
      return next(new AppError("Vui lòng cung cấp email và mật khẩu", 400));
    }

    // Kiểm tra xem người dùng có tồn tại không
    // Vì trong model password được set select: false nên cần dùng .select("+password") để lấy password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Email hoặc mật khẩu không đúng", 401));
    }

    // Kiểm tra mật khẩu
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError("Email hoặc mật khẩu không đúng", 401));
    }

    // Tạo token
    const token = signtoken(user._id);

    // Ẩn mật khẩu trước khi gửi phản hồi
    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
