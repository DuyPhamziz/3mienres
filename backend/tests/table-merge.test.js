jest.mock("../app/models/table-connection.model", () => ({
  find: jest.fn(),
}));
jest.mock("../app/models/table.model", () => ({
  find: jest.fn().mockResolvedValue([]),
}));

const TableConnection = require("../app/models/table-connection.model");
const Table = require("../app/models/table.model");
const tableEngine = require("../app/utils/table-engine");

const mockTables = [
  { _id: "t1", tableNumber: "B01", capacity: 4 },
  { _id: "t2", tableNumber: "B02", capacity: 4 },
  { _id: "t3", tableNumber: "B03", capacity: 6 },
];

describe("validateMergeableTables", () => {
  test("2 bàn có liên kết kề nhau -> hợp lệ", async () => {
    TableConnection.find.mockResolvedValue([{ tableA: "t1", tableB: "t2" }]);
    const result = await tableEngine.validateMergeableTables(["t1", "t2"]);
    expect(result.isValid).toBe(true);
  });

  test("2 bàn không liên kết -> không hợp lệ", async () => {
    TableConnection.find.mockResolvedValue([{ tableA: "t1", tableB: "t2" }]);
    const result = await tableEngine.validateMergeableTables(["t1", "t3"]);
    expect(result.isValid).toBe(false);
    expect(result.disconnected).toContain("t3");
  });

  test("1 bàn duy nhất -> luôn hợp lệ", async () => {
    const result = await tableEngine.validateMergeableTables(["t1"]);
    expect(result.isValid).toBe(true);
  });
});

describe("findCombinations (tối ưu ít lãng phí chỗ)", () => {
  test("chọn tổ hợp ít lãng phí nhất", async () => {
    TableConnection.find.mockResolvedValue([
      { tableA: "t1", tableB: "t2" },
      { tableA: "t2", tableB: "t3" },
    ]);
    // Cụm: t1(4) - t2(4) - t3(6), cần 6 khách -> chọn [t3]=6 (waste 0) thay vì [t1,t2]=8
    const combos = await tableEngine.findCombinations(mockTables, 6);
    expect(combos.length).toBe(1);
    expect(combos[0].totalCapacity).toBe(6);
    expect(combos[0].tables.map((t) => t._id)).toEqual(["t3"]);
  });

  test("không có cụm đủ chỗ -> trả về rỗng", async () => {
    TableConnection.find.mockResolvedValue([{ tableA: "t1", tableB: "t2" }]);
    // Cụm t1+t2 = 8, cần 10 -> không đủ
    const combos = await tableEngine.findCombinations([mockTables[0], mockTables[1]], 10);
    expect(combos).toEqual([]);
  });
});
