const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên người dùng là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false, // Khi truy vấn User, mặc định sẽ không trả về trường password},
    },
    role: {
      type: String,
      enum: ["customer", "manager", "admin"],
      default: "customer",
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      unique: true,
    },
  },
  { timestamps: true },
); // Tự động tạo trường createdAt và updatedAt

// Middleware (hook) của Mongoose: Tự động chay trước khi lưu User vào database

userSchema.pre("save", async function (next) {
  // nếu password không được thay đổi (ví dụ khi cập nhật thông tin người dùng mà không thay đổi mật khẩu), thì không cần hash lại
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12); // Hash mật khẩu với salt rounds = 12
  next();
});
// hàm hổ trợ (method) để so sánh mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
