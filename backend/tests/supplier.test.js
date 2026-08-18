const Supplier = require("../app/models/supplier.model");

describe("Supplier Management Unit Tests", () => {
  test("Supplier model lưu đầy đủ thông tin nhà cung cấp và tài khoản ngân hàng", () => {
    const supplier = new Supplier({
      supplierCode: "NCC-CAMAU-01",
      name: "Vựa Cua Biển Năm Căn",
      contactPerson: "Nguyễn Văn Đạt",
      phone: "0909888999",
      email: "cuanamcan@gmail.com",
      address: "Huyện Năm Căn, Tỉnh Cà Mau",
      category: "SEAFOOD",
      bankName: "Vietcombank",
      bankAccountNumber: "0123456789",
      bankAccountName: "NGUYEN VAN DAT",
      status: "active",
    });

    const error = supplier.validateSync();
    expect(error).toBeUndefined();
    expect(supplier.category).toBe("SEAFOOD");
    expect(supplier.status).toBe("active");
    expect(supplier.supplierCode).toBe("NCC-CAMAU-01");
  });

  test("Supplier model báo lỗi nếu thiếu tên, số điện thoại hoặc địa chỉ", () => {
    const invalidSupplier = new Supplier({});
    const error = invalidSupplier.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.phone).toBeDefined();
    expect(error.errors.address).toBeDefined();
  });
});
