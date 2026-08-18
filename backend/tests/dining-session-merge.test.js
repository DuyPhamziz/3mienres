const DiningSession = require("../app/models/dining-session.model");

describe("DiningSession Merge & Extended Unit Tests", () => {
  test("DiningSession schema lưu đúng thông tin nhiều bàn và ghi chú gộp", () => {
    const session = new DiningSession({
      sessionCode: "SS-20260818-001",
      customerName: "Nguyễn Văn A",
      actualGuestsCount: 6,
      tables: ["660000000000000000000001", "660000000000000000000002"],
      status: "ACTIVE",
      type: "WALK_IN",
      expectedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      notes: "Đã gộp từ bàn SS-20260818-002",
    });

    const error = session.validateSync();
    expect(error).toBeUndefined();
    expect(session.sessionCode).toBe("SS-20260818-001");
    expect(session.tables.length).toBe(2);
    expect(session.actualGuestsCount).toBe(6);
    expect(session.notes).toContain("Đã gộp");
  });
});
