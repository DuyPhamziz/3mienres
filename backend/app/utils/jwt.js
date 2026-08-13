const jwt = require("jsonwebtoken");
const config = require("../config");

// Access token: thời hạn ngắn, dùng cho mọi request API
const signAccessToken = (id) => {
  return jwt.sign({ id, type: "access" }, config.jwtSecret, {
    expiresIn: "1h",
  });
};

// Refresh token: thời hạn dài, dùng để cấp lại access token mới khi hết hạn
const signRefreshToken = (id) => {
  return jwt.sign({ id, type: "refresh" }, config.jwtSecret, {
    expiresIn: "30d",
  });
};

// Giữ tương thích ngược cho code cũ dùng signtoken
const signtoken = signAccessToken;

module.exports = { signtoken, signAccessToken, signRefreshToken };
