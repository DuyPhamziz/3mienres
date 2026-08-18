const StockAudit = require("../app/models/stock-audit.model");

describe("Stock Audit & Periodic Consumption Unit Tests", () => {
  test("StockAudit model lưu đúng các trường kiểm kê, chênh lệch và trạng thái", () => {
    const audit = new StockAudit({
      auditCode: "KK-20260818-001",
      auditType: "WEEKLY",
      status: "DRAFT",
      notes: "Kiểm kê tổng kết cuối tuần 3 tháng 8",
      items: [
        {
          ingredient: "660000000000000000000001",
          ingredientName: "Cua Cà Mau Tươi Sống",
          unit: "kg",
          systemStock: 45.0,
          actualCount: 42.5,
          variance: -2.5,
          reason: "Hao hụt tự nhiên khi sơ chế & làm sạch",
        },
        {
          ingredient: "660000000000000000000002",
          ingredientName: "Hàu Sữa Cần Giờ",
          unit: "kg",
          systemStock: 30.0,
          actualCount: 30.0,
          variance: 0,
          reason: "Khớp hoàn toàn",
        },
      ],
    });

    const error = audit.validateSync();
    expect(error).toBeUndefined();
    expect(audit.auditCode).toBe("KK-20260818-001");
    expect(audit.auditType).toBe("WEEKLY");
    expect(audit.items.length).toBe(2);
    expect(audit.items[0].variance).toBe(-2.5);
    expect(audit.status).toBe("DRAFT");
  });
});
