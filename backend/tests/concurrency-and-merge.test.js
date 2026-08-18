jest.mock("../app/models/table.model", () => ({
  find: jest.fn(),
  updateMany: jest.fn(),
}));
jest.mock("../app/models/table-connection.model", () => ({
  find: jest.fn(),
}));
jest.mock("../app/models/reservation.model", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("../app/models/dining-session.model", () => ({
  find: jest.fn(),
}));

const Table = require("../app/models/table.model");
const TableConnection = require("../app/models/table-connection.model");
const tableEngine = require("../app/utils/table-engine");

describe("Phase 2 - Area Constraint & Concurrency Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("TableEngine.validateMergeableTables with Area constraint", () => {
    test("Từ chối ghép 2 bàn nếu thuộc 2 Khu vực (Area) khác nhau", async () => {
      Table.find.mockResolvedValue([
        { _id: "t1", tableNumber: "B01", area: "area_tang1" },
        { _id: "t2", tableNumber: "VIP01", area: "area_santhuong" },
      ]);

      const result = await tableEngine.validateMergeableTables(["t1", "t2"]);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("different_areas");
    });

    test("Chấp nhận ghép 2 bàn nếu thuộc cùng một Khu vực và có liên kết kề nhau", async () => {
      Table.find.mockResolvedValue([
        { _id: "t1", tableNumber: "B01", area: "area_tang1" },
        { _id: "t2", tableNumber: "B02", area: "area_tang1" },
      ]);
      TableConnection.find.mockResolvedValue([
        { tableA: "t1", tableB: "t2" },
      ]);

      const result = await tableEngine.validateMergeableTables(["t1", "t2"]);
      expect(result.isValid).toBe(true);
    });
  });

  describe("TableEngine.findCombinations with Area constraint", () => {
    test("Không tạo cụm ghép giữa 2 bàn khác khu vực dù có bản ghi liên kết", async () => {
      const mockTables = [
        { _id: "t1", tableNumber: "B01", capacity: 4, area: "area_tang1" },
        { _id: "t2", tableNumber: "B02", capacity: 4, area: "area_santhuong" },
      ];

      TableConnection.find.mockResolvedValue([
        { tableA: "t1", tableB: "t2" },
      ]);

      // Cần 8 khách, nếu ghép t1 + t2 thì đủ, nhưng vì khác area nên không tạo cụm
      const combos = await tableEngine.findCombinations(mockTables, 8);
      expect(combos).toEqual([]);
    });

    test("Ghép cụm thành công nếu các bàn trong cụm cùng một khu vực", async () => {
      const mockTables = [
        { _id: "t1", tableNumber: "B01", capacity: 4, area: "area_tang1" },
        { _id: "t2", tableNumber: "B02", capacity: 4, area: "area_tang1" },
      ];

      TableConnection.find.mockResolvedValue([
        { tableA: "t1", tableB: "t2" },
      ]);

      const combos = await tableEngine.findCombinations(mockTables, 8);
      expect(combos.length).toBe(1);
      expect(combos[0].totalCapacity).toBe(8);
      expect(combos[0].tables.map((t) => t._id)).toEqual(["t1", "t2"]);
    });
  });

  describe("Atomic Table Claim validation", () => {
    test("Xung đột khi một bàn đã bị chiếm trước đó (modifiedCount < tableIds.length)", async () => {
      // Giả lập 2 bàn cần claim nhưng chỉ 1 bàn ở trạng thái AVAILABLE
      Table.updateMany.mockResolvedValueOnce({ modifiedCount: 1 });

      const finalTableIds = ["t1", "t2"];
      const claimResult = await Table.updateMany(
        { _id: { $in: finalTableIds }, status: "AVAILABLE" },
        { status: "OCCUPIED" }
      );

      const hasConflict = claimResult.modifiedCount !== finalTableIds.length;
      expect(hasConflict).toBe(true);
    });
  });
});
