const express = require("express");
const chatbotController = require("../controllers/chatbot.controller");

const router = express.Router();

// Route trò chuyện AI Chatbot (Công khai cho cả khách chưa đăng nhập)
router.post("/chat", chatbotController.processChat);

module.exports = router;
