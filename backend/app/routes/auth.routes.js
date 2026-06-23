const expresss = require("express");
const authController = require("../controllers/auth.controller");

const router = expresss.Router();

// Route đăng ký POST http://localhost:3000/api/auth/register
router.post("/register", authController.register);
// Route đăng nhập POST http://localhost:3000/api/auth/login
router.post("/login", authController.login);

module.exports = router;
