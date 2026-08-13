const slugify = require("../app/utils/slugify");

describe("Slugify Unit Tests", () => {
  test("Chuyển đổi tiêu đề món ăn tiếng Việt có dấu thành slug không dấu", () => {
    expect(slugify("Lẩu Cua Đồng Bắc Bộ")).toBe("lau-cua-dong-bac-bo");
    expect(slugify("Cua Cà Mau Sốt Me Chua Ngọt")).toBe("cua-ca-mau-sot-me-chua-ngot");
    expect(slugify("Cua Nướng Tiêu Xanh Miền Trung")).toBe("cua-nuong-tieu-xanh-mien-trung");
  });

  test("Xử lý chữ Đ/đ và ký tự đặc biệt", () => {
    expect(slugify("Đặc Sản 3 Miền @ 2026!")).toBe("dac-san-3-mien-2026");
  });

  test("Xử lý chuỗi rỗng hoặc undefined", () => {
    expect(slugify("")).toBe("");
    expect(slugify(null)).toBe("");
    expect(slugify(undefined)).toBe("");
  });
});
