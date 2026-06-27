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
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    addresses: [
      {
        title: { type: String, trim: true },
        addressDetail: { type: String, trim: true },
        ward: { type: String, trim: true },
        district: { type: String, trim: true },
        city: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
); // Tự động tạo trường createdAt và updatedAt

// Middleware (hook) của Mongoose: Tự động chay trước khi lưu User vào database

userSchema.pre("save", async function () {
  // nếu password không được thay đổi (ví dụ khi cập nhật thông tin người dùng mà không thay đổi mật khẩu), thì không cần hash lại
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12); // Hash mật khẩu với salt rounds = 12
});
// hàm hổ trợ (method) để so sánh mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
