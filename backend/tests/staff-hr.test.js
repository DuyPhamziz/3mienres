const User = require("../app/models/user.model");

describe("Staff HR & User Management Unit Tests", () => {
  test("User model hỗ trợ các trường HR: department, shift, salary, employeeCode", () => {
    const user = new User({
      name: "Trần Nhân Viên",
      email: "nhanvien@3miencua.vn",
      phone: "0912345678",
      password: "password123",
      role: "staff",
      employeeCode: "NV-001",
      department: "KITCHEN",
      shift: "MORNING",
      salary: 8000000,
    });

    const error = user.validateSync();
    expect(error).toBeUndefined();
    expect(user.department).toBe("KITCHEN");
    expect(user.shift).toBe("MORNING");
    expect(user.employeeCode).toBe("NV-001");
    expect(user.salary).toBe(8000000);
  });

  test("User model mặc định role là customer và isActive là true", () => {
    const user = new User({
      name: "Khách Hàng A",
      email: "khach@gmail.com",
      phone: "0987654321",
      password: "password123",
    });

    expect(user.role).toBe("customer");
    expect(user.isActive).toBe(true);
    expect(user.department).toBe("GENERAL");
    expect(user.shift).toBe("FULLTIME");
  });
});
