const { generateUniqueCode, generateInvoiceCode } = require("../app/utils/code-generator");

describe("Code Generator Unit Tests", () => {
  test("generateUniqueCode sinh mã theo prefix và kiểm tra không trùng lặp", async () => {
    const mockModel = {
      findOne: jest.fn().mockResolvedValueOnce({ code: "RES-123456" }).mockResolvedValueOnce(null),
    };

    const code = await generateUniqueCode(mockModel, "RES", "code", { min: 100000, max: 999999 });
    expect(code).toMatch(/^RES-\d{6}$/);
    expect(mockModel.findOne).toHaveBeenCalledTimes(2);
  });

  test("generateInvoiceCode sinh mã hóa đơn theo ngày YYYYMMDD", async () => {
    const mockInvoiceModel = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const fixedDate = new Date("2026-08-15T10:00:00.000Z");

    const code = await generateInvoiceCode(mockInvoiceModel, fixedDate);
    expect(code).toMatch(/^INV-20260815-\d{4}$/);
  });
});
