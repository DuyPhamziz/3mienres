const { createPaymentUrl, verifyCallback } = require("../app/utils/vnpay");

const config = {
  tmnCode: "TESTTMN",
  hashSecret: "TESTSECRET",
  url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: "http://localhost:3000/api/payments/vnpay/callback",
};

describe("vnpay utils", () => {
  test("tạo URL thanh toán có chữ ký và amount x100", () => {
    const url = createPaymentUrl(config, {
      amount: 100000,
      txnRef: "TXN-1",
      orderInfo: "COC RES-123456",
      ipAddr: "127.0.0.1",
    });
    expect(url).toContain("vnp_Amount=10000000");
    expect(url).toContain("vnp_SecureHash=");
    expect(url).toContain("vnp_TmnCode=TESTTMN");
  });

  test("verifyCallback xác thực đúng chữ ký", () => {
    // Dùng chính chữ ký sinh ra để kiểm tra vòng khép kín
    const url = createPaymentUrl(config, {
      amount: 50000,
      txnRef: "TXN-2",
      orderInfo: "THANH TOAN",
      ipAddr: "127.0.0.1",
    });
    const query = Object.fromEntries(new URL(url).searchParams);
    expect(verifyCallback(config, query)).toBe(true);

    query.vnp_SecureHash = "wronghash";
    expect(verifyCallback(config, query)).toBe(false);
  });
});
