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
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "staff", "manager", "admin"],
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
    // Tích lũy điểm & Hạng thành viên (Loyalty Rank Program)
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    rank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rank",
      default: null,
    },
    addresses: [
      {
        title: { type: String, trim: true },
        addressDetail: { type: String, trim: true },
        ward: { type: String, trim: true },
        district: { type: String, trim: true },
        city: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Thông tin nhân sự (HR & Staff Management)
    employeeCode: {
      type: String,
      trim: true,
      uppercase: true, // Ví dụ: NV-001, QL-002
    },
    department: {
      type: String,
      enum: ["MANAGEMENT", "SERVICE", "KITCHEN", "CASHIER", "WAREHOUSE", "GENERAL"],
      default: "GENERAL",
    },
    shift: {
      type: String,
      enum: ["MORNING", "AFTERNOON", "EVENING", "FULLTIME"],
      default: "FULLTIME",
    },
    salary: {
      type: Number,
      default: 0,
      min: 0,
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: {
      type: String,
      default: null, // Refresh token hiện tại của người dùng
      select: false,
    },
    refreshTokenExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
