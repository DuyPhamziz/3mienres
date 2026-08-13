const { isTimeOverlap } = require("../app/utils/table-engine");

describe("table engine - isTimeOverlap", () => {
  test("nhận diện 2 khung giờ trùng nhau", () => {
    const overlap = isTimeOverlap(
      "2026-08-13T10:00:00",
      "2026-08-13T12:00:00",
      "2026-08-13T11:00:00",
      "2026-08-13T13:00:00",
    );
    expect(overlap).toBe(true);
  });

  test("không trùng khi kết thúc đúng lúc bắt đầu", () => {
    const overlap = isTimeOverlap(
      "2026-08-13T10:00:00",
      "2026-08-13T12:00:00",
      "2026-08-13T12:00:00",
      "2026-08-13T13:00:00",
    );
    expect(overlap).toBe(false);
  });
});
