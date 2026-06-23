const jwt = require("jsonwebtoken");
const config = require("../config");
// Hàm tạo token JWT dựa trên ID người dùng
// Token sẽ có thời gian hết hạn là 30 ngày

const signtoken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: "30d",
  });
};
module.exports = { signtoken };
