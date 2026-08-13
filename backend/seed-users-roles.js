const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./app/models/user.model");
const Role = require("./app/models/role.model");
const Rank = require("./app/models/rank.model");
const config = require("./app/config");

async function seedUsersAndRoles() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("🚀 BẮT ĐẦU TẠO THÊM USER VÀ COLLECTION ROLES VÀO DATABASE 3MIEN...");

    // 1. SEED COLLECTION ROLES
    const rolesData = [
      {
        name: "admin",
        displayName: "Quản Trị Viên Hệ Thống",
        description: "Toàn quyền quản trị cao nhất hệ thống web và cơ sở dữ liệu",
        permissions: ["MANAGE_USERS", "MANAGE_ROLES", "MANAGE_SETTINGS", "VIEW_ANALYTICS"],
      },
      {
        name: "manager",
        displayName: "Quản Lý Nhà Hàng",
        description: "Quản lý sơ đồ bàn, thực đơn 3 miền, kho nguyên liệu, doanh thu dashboard",
        permissions: ["MANAGE_TABLES", "MANAGE_MENU", "MANAGE_INVENTORY", "MANAGE_SUPPLIERS", "VIEW_REPORTS"],
      },
      {
        name: "staff",
        displayName: "Nhân Viên Phục Vụ / Thu Ngân",
        description: "Tiếp nhận khách Walk-in, Check-in đặt trước, gọi món tại bàn, xuất hóa đơn",
        permissions: ["CHECKIN_RESERVATION", "WALKIN_SESSION", "CREATE_ORDER", "CREATE_INVOICE"],
      },
      {
        name: "customer",
        displayName: "Khách Hàng Hội Viên",
        description: "Xem thực đơn 3 miền, đặt bàn online, tra cứu đơn, tích điểm thăng hạng",
        permissions: ["CREATE_RESERVATION", "VIEW_HISTORY", "TRACK_RESERVATION"],
      },
    ];

    for (let r of rolesData) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true });
    }
    console.log("✅ Đã tạo thành công Collection ROLES với 4 Vai Trò chuẩn mực!");

    // Lấy ID của các Hạng thành viên (Ranks)
    const rankKimCuong = await Rank.findOne({ name: "Kim Cương" });
    const rankVang = await Rank.findOne({ name: "Vàng" });
    const rankBac = await Rank.findOne({ name: "Bạc" });
    const rankDong = await Rank.findOne({ name: "Đồng" });

    // 2. SEED DANH SÁCH USER ĐA DẠNG VAI TRÒ
    const defaultPasswordHash = await bcrypt.hash("password123", 12);

    const usersData = [
      // Quản trị viên & Quản lý
      {
        name: "Trần Quản Trị (Admin)",
        email: "admin@gmail.com",
        phone: "0909000111",
        password: defaultPasswordHash,
        role: "admin",
        totalSpent: 0,
      },
      {
        name: "Lê Quản Lý (Manager)",
        email: "manager@gmail.com",
        phone: "0909000222",
        password: defaultPasswordHash,
        role: "manager",
        totalSpent: 0,
      },

      // Nhân viên quầy / thu ngân / phục vụ
      {
        name: "Nguyễn Thu Ngân (Cashier)",
        email: "cashier@gmail.com",
        phone: "0901111222",
        password: defaultPasswordHash,
        role: "staff",
        totalSpent: 0,
      },
      {
        name: "Phạm Phục Vụ (Waiter)",
        email: "waiter@gmail.com",
        phone: "0903333444",
        password: defaultPasswordHash,
        role: "staff",
        totalSpent: 0,
      },

      // Khách hàng với các Hạng thành viên khác nhau
      {
        name: "Đặng Kim Cương (VIP Client)",
        email: "khach.kimcuong@gmail.com",
        phone: "0911999888",
        password: defaultPasswordHash,
        role: "customer",
        totalSpent: 35000000,
        rank: rankKimCuong ? rankKimCuong._id : null,
      },
      {
        name: "Vũ Hoàng Vàng (Gold Client)",
        email: "khach.vang@gmail.com",
        phone: "0911777666",
        password: defaultPasswordHash,
        role: "customer",
        totalSpent: 12000000,
        rank: rankVang ? rankVang._id : null,
      },
      {
        name: "Bùi Thị Bạc (Silver Client)",
        email: "khach.bac@gmail.com",
        phone: "0911555444",
        password: defaultPasswordHash,
        role: "customer",
        totalSpent: 3500000,
        rank: rankBac ? rankBac._id : null,
      },
      {
        name: "Trịnh Văn Đồng (New Client)",
        email: "khach.dong@gmail.com",
        phone: "0911333222",
        password: defaultPasswordHash,
        role: "customer",
        totalSpent: 500000,
        rank: rankDong ? rankDong._id : null,
      },
    ];

    for (let u of usersData) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
    }

    console.log("✅ Đã tạo thành công 8 Tài khoản Users mẫu với đầy đủ 4 Vai trò!");
    console.log("🎉 SEED ROLES & USERS THÀNH CÔNG 100%!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed users & roles:", err);
    process.exit(1);
  }
}

seedUsersAndRoles();
