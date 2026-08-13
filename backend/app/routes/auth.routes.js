const express = require("express");
const authController = require("../controllers/auth.controller");
const { protect } = require("../utils/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", protect, authController.me);
router.post("/logout", protect, authController.logout);

module.exports = router;
