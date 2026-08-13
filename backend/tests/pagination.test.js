const { getPagination, buildPaginationMeta, buildSearchFilter } = require("../app/utils/pagination");

describe("Pagination Utils Unit Tests", () => {
  test("getPagination trả về page, limit và skip an toàn", () => {
    expect(getPagination({ page: "2", limit: "10" })).toEqual({ page: 2, limit: 10, skip: 10 });
    expect(getPagination({ page: "-1", limit: "200" })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(getPagination({})).toEqual({ page: 1, limit: 100, skip: 0 });
  });

  test("buildPaginationMeta tính tổng số trang đúng", () => {
    expect(buildPaginationMeta(45, 1, 10)).toEqual({ page: 1, limit: 10, total: 45, totalPages: 5 });
    expect(buildPaginationMeta(0, 1, 10)).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  test("buildSearchFilter tạo query $or với regex không phân biệt hoa thường", () => {
    const filter = buildSearchFilter("cua", ["name", "description"]);
    expect(filter).toEqual({
      $or: [
        { name: { $regex: "cua", $options: "i" } },
        { description: { $regex: "cua", $options: "i" } },
      ],
    });

    expect(buildSearchFilter("   ", ["name"])).toBeNull();
    expect(buildSearchFilter(null, ["name"])).toBeNull();
  });
});
