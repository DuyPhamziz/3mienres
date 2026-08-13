const jwt = require("jsonwebtoken");
const config = require("../app/config");
const { signAccessToken, signRefreshToken, signtoken } = require("../app/utils/jwt");

describe("JWT Utils Unit Tests", () => {
  test("signAccessToken sinh access token hợp lệ", () => {
    const token = signAccessToken("user123");
    expect(typeof token).toBe("string");
    const decoded = jwt.verify(token, config.jwtSecret);
    expect(decoded.id).toBe("user123");
    expect(decoded.type).toBe("access");
  });

  test("signRefreshToken sinh refresh token với type = refresh", () => {
    const token = signRefreshToken("user123");
    expect(typeof token).toBe("string");
    const decoded = jwt.verify(token, config.jwtSecret);
    expect(decoded.id).toBe("user123");
    expect(decoded.type).toBe("refresh");
  });

  test("signtoken tương thích ngược với signAccessToken", () => {
    const token = signtoken("user456");
    const decoded = jwt.verify(token, config.jwtSecret);
    expect(decoded.id).toBe("user456");
    expect(decoded.type).toBe("access");
  });
});
