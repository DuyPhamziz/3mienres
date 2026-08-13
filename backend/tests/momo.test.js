const { buildSignature, verifySignature } = require("../app/utils/momo");

describe("momo utils", () => {
  const secretKey = "TESTSECRET";
  const params = {
    partnerCode: "MOMO",
    accessKey: "ACCESS",
    requestId: "REQ-1",
    amount: "100000",
    orderId: "ORD-1",
    orderInfo: "COC RES-123456",
    redirectUrl: "http://localhost/cb",
    ipnUrl: "http://localhost/ipn",
    requestType: "captureWallet",
    extraData: "",
  };

  test("tạo chữ ký HMAC-SHA256 ổn định", () => {
    const sig1 = buildSignature(secretKey, params);
    const sig2 = buildSignature(secretKey, params);
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64); // hex sha256
  });

  test("verifySignature xác thực đúng/sai", () => {
    const signature = buildSignature(secretKey, params);
    expect(verifySignature(secretKey, { ...params, signature })).toBe(true);
    expect(verifySignature(secretKey, { ...params, signature: "wrong" })).toBe(false);
  });
});
