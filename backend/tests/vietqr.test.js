const { generateVietQRUrl, generateCheckInQRUrl } = require("../app/utils/vietqr");

describe("vietqr utils", () => {
  test("không sinh QR khi số tiền <= 0", () => {
    expect(generateVietQRUrl("MB", "123", "NAME", 0, "COC X")).toBeNull();
  });

  test("sinh URL VietQR có chứa amount và nội dung", () => {
    const url = generateVietQRUrl("MB", "0988776655", "NHA HANG", 100000, "COC RES-123456");
    expect(url).toContain("img.vietqr.io");
    expect(url).toContain("amount=100000");
    expect(url).toContain("MB-0988776655");
  });

  test("sinh URL QR check-in có mã đặt bàn", () => {
    const url = generateCheckInQRUrl("RES-123456");
    expect(url).toContain("api.qrserver.com");
  });
});
