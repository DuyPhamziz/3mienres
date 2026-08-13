const { roundMoney, toNonNegative, toPercent } = require("../app/utils/money");

describe("money utils", () => {
  test("roundMoney làm tròn về số nguyên", () => {
    expect(roundMoney(1.5)).toBe(2);
    expect(roundMoney(1.4)).toBe(1);
    expect(roundMoney("abc")).toBe(0);
  });

  test("toNonNegative chỉ nhận số dương hoặc 0", () => {
    expect(toNonNegative(-5)).toBe(0);
    expect(toNonNegative(100)).toBe(100);
    expect(toNonNegative("abc")).toBe(0);
  });

  test("toPercent giới hạn 0-100", () => {
    expect(toPercent(8)).toBe(8);
    expect(toPercent(150)).toBe(0);
    expect(toPercent(-1)).toBe(0);
  });
});
