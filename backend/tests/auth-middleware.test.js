const { restrictTo, protect } = require("../app/utils/auth");
const jwt = require("jsonwebtoken");
const config = require("../app/config");

describe("Auth Middleware Unit Tests", () => {
  describe("restrictTo middleware", () => {
    test("Cho phép nếu vai trò người dùng hợp lệ", () => {
      const middleware = restrictTo("admin", "manager");
      const req = { user: { role: "admin" } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    test("Từ chối 403 nếu người dùng không có vai trò hợp lệ", () => {
      const middleware = restrictTo("admin", "manager");
      const req = { user: { role: "customer" } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
      expect(error.message).toMatch(/không có quyền/i);
    });
  });

  describe("protect middleware token validation", () => {
    test("Trả về 401 nếu thiếu Authorization header", async () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    test("Từ chối 401 nếu sử dụng refresh token thay vì access token", async () => {
      const refreshToken = jwt.sign({ id: "123", type: "refresh" }, config.jwtSecret);
      const req = { headers: { authorization: `Bearer ${refreshToken}` } };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toMatch(/access token/i);
    });
  });
});
