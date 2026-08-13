const mongoose = require("mongoose");
const User = require("./app/models/user.model");
const config = require("./app/config");

async function seedUsers() {
  try {
    console.log("Đang kết nối tới MongoDB để tạo tài khoản mẫu...");
    await mongoose.connect(config.mongoUri);

    // 1. Tạo tài khoản Admin (Quản trị viên)
    await User.deleteOne({ email: "admin@gmail.com" });
    const admin = await User.create({
      name: "Quản Trị Viên Hệ Thống",
      email: "admin@gmail.com",
      password: "password123", // Sẽ được tự động băm bcrypt bằng pre-save hook
      phone: "0999888777",
      role: "admin",
    });
    console.log("-> Tạo thành công ADMIN: admin@gmail.com / password123");

    // 2. Tạo tài khoản Manager (Quản lý nhà hàng)
    await User.deleteOne({ email: "manager@gmail.com" });
    const manager = await User.create({
      name: "Quản Lý Nhà Hàng",
      email: "manager@gmail.com",
      password: "password123",
      phone: "0912345678",
      role: "manager",
    });
    console.log("-> Tạo thành công MANAGER: manager@gmail.com / password123");

    console.log("\nHOÀN TẤT! Bạn có thể dùng 2 tài khoản này để đăng nhập lấy Token trên Postman.");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi tạo user:", error);
    process.exit(1);
  }
}

seedUsers();
