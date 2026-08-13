const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const Dish = require("../models/dish.model");
const RestaurantSetting = require("../models/setting.model");
const AppError = require("../app-error");
const tableEngine = require("../utils/table-engine");

// Helper: Phân tích số người từ tin nhắn bằng Regex NLP
const extractGuests = (text) => {
  const match = text.match(/(\d+)\s*(người|khách|chỗ|bàn)/i);
  if (match) return parseInt(match[1], 10);
  const numOnly = text.match(/\b(\d{1,2})\b/);
  return numOnly ? parseInt(numOnly[1], 10) : 2; // Mặc định 2 người nếu không ghi rõ
};

// Helper: Phân tích ngày giờ từ tin nhắn
const extractDateTime = (text) => {
  const now = new Date();
  let targetDate = new Date(now);

  if (/tối mai|ngày mai|chiều mai|sáng mai/i.test(text)) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (/ngày kia|mốt/i.test(text)) {
    targetDate.setDate(targetDate.getDate() + 2);
  }

  // Tìm giờ (VD: 19h, 19h30, 7h tối, 18:30)
  const timeMatch = text.match(/(\d{1,2})\s*(h|gờ|:)\s*(\d{2})?/i);
  let hours = 19; // Mặc định 19h tối
  let minutes = 0;

  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    if (timeMatch[3]) minutes = parseInt(timeMatch[3], 10);
    if (/tối|đêm|chiều/i.test(text) && hours < 12) hours += 12;
  }

  targetDate.setHours(hours, minutes, 0, 0);
  if (targetDate < now) {
    targetDate.setDate(targetDate.getDate() + 1); // Nếu giờ đã qua thì chuyển sang ngày hôm sau
  }

  return targetDate;
};

// 1. AI Chatbot NLP xử lý trò chuyện và Đặt bàn tự động
exports.processChat = async (req, res, next) => {
  try {
    const { prompt, customerName, customerPhone } = req.body;

    if (!prompt || !prompt.trim()) {
      return next(new AppError("Vui lòng nhập tin nhắn cho AI Chatbot", 400));
    }

    const text = prompt.trim();
    const isBookingIntent = /đặt bàn|giữ chỗ|bàn cho|đặt chỗ|đặt 1 bàn|đặt hai bàn/i.test(text);
    const isMenuIntent = /thực đơn|menu|món ăn|có món gì|đặc sản/i.test(text);

    // KỊCH BẢN 1: KHÁCH YÊU CẦU ĐẶT BÀN BẰNG NGÔN NGỮ TỰ NHIÊN
    if (isBookingIntent) {
      const guests = extractGuests(text);
      const startTime = extractDateTime(text);
      const name = customerName ? customerName.trim() : (req.user ? req.user.name : "Khách hàng AI");
      const phone = customerPhone ? customerPhone.trim() : (req.user ? req.user.phone : "0988776655");

      let durationMinutes = 120;
      let defaultDeposit = 100000;
      let bankInfo = { bankId: "MB", accountNo: "0988776655", accountName: "NHA HANG 3 MIEN CUA" };

      const settings = await RestaurantSetting.findOne();
      if (settings) {
        if (settings.reservation) {
          if (settings.reservation.defaultDurationMinutes) durationMinutes = settings.reservation.defaultDurationMinutes;
          if (settings.reservation.defaultDepositAmount !== undefined) defaultDeposit = settings.reservation.defaultDepositAmount;
        }
        if (settings.bankAccount) bankInfo = settings.bankAccount;
      }

      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      // Thuật toán tìm bàn trống
      const occupiedTableIds = await tableEngine.getOccupiedTableIds(startTime, endTime);
      const allTables = await Table.find({ isActive: { $ne: false }, status: { $ne: "MAINTENANCE" } }).populate("area", "name");
      const availableTables = allTables.filter((t) => !occupiedTableIds.has(t._id.toString()));

      let assignedTables = [];
      let isCombined = false;
      let tableNamesStr = "";

      const singleMatches = availableTables.filter((t) => t.capacity >= guests).sort((a, b) => a.capacity - b.capacity);

      if (singleMatches.length > 0) {
        assignedTables = [singleMatches[0]._id];
        tableNamesStr = `bàn ${singleMatches[0].tableNumber} (${singleMatches[0].capacity} chỗ)`;
      } else {
        const combinations = await tableEngine.findCombinations(availableTables, guests);
        if (combinations.length > 0) {
          combinations.sort((a, b) => a.totalCapacity - b.totalCapacity);
          assignedTables = combinations[0].tables.map((t) => t._id);
          isCombined = true;
          tableNamesStr = `cụm bàn ghép ${combinations[0].tables.map((t) => t.tableNumber).join(" + ")}`;
        }
      }

      if (assignedTables.length === 0) {
        return res.status(200).json({
          status: "success",
          reply: `Dạ em rất tiếc! Khung giờ ${startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${startTime.toLocaleDateString("vi-VN")} nhà hàng đã hết bàn đủ chỗ cho ${guests} người. Anh/Chị có thể đổi sang khung giờ khác giúp em được không ạ?`,
        });
      }

      const depositAmount = guests >= 4 ? defaultDeposit : 0;

      // Sinh mã đặt bàn
      let reservationCode;
      let isUnique = false;
      while (!isUnique) {
        reservationCode = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
        const existing = await Reservation.findOne({ reservationCode });
        if (!existing) isUnique = true;
      }

      const qrCodeUrl = depositAmount > 0
        ? `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact.png?amount=${depositAmount}&addInfo=COC%20${reservationCode}&accountName=${encodeURIComponent(bankInfo.accountName)}`
        : null;

      const newReservation = await Reservation.create({
        reservationCode,
        user: req.user ? req.user._id : null,
        customerName: name,
        customerPhone: phone,
        guestsCount: guests,
        startAt: startTime,
        endAt: endTime,
        status: "CONFIRMED",
        tables: assignedTables,
        depositAmount,
        notes: `Đặt bàn qua AI Chatbot: "${text}"`,
      });

      const formattedTime = startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const formattedDate = startTime.toLocaleDateString("vi-VN");

      let botReply = `Dạ chào ${name}! AI Assistant của Nhà hàng 3 Miền Cua đã tự động đặt bàn thành công cho Anh/Chị:\n\n`;
      botReply += `📌 Mã đặt bàn: ${reservationCode}\n`;
      botReply += `👥 Số khách: ${guests} người\n`;
      botReply += `⏰ Thời gian: ${formattedTime} ngày ${formattedDate}\n`;
      botReply += `🪑 Vị trí phân bổ: ${tableNamesStr}\n`;

      if (isCombined) {
        botReply += `💡 Cảnh báo ghép bàn: Vì đoàn ${guests} người khá đông nên hệ thống đã tự động ghép các bàn kề nhau để đoàn ngồi liền dãi thoải mái nhất!\n`;
      }

      if (depositAmount > 0) {
        botReply += `\n💳 Tiền cọc giữ chỗ: ${depositAmount.toLocaleString("vi-VN")}đ. Anh/Chị vui lòng quét mã QR bên dưới để chuyển khoản cọc nhé!`;
      }

      return res.status(200).json({
        status: "success",
        reply: botReply,
        intent: "BOOKING_SUCCESS",
        deposit: {
          amount: depositAmount,
          qrCodeUrl,
          bankInfo,
        },
        reservation: newReservation,
      });
    }

    // KỊCH BẢN 2: TRA CỨU THỰC ĐƠN MÓN ĂN
    if (isMenuIntent) {
      const dishes = await Dish.find({ availability: true }).limit(5);
      let reply = `Dạ Nhà hàng 3 Miền Cua xin gợi ý một số món ăn đặc sản 3 miền nổi tiếng nhất ạ:\n\n`;
      dishes.forEach((d, idx) => {
        reply += `${idx + 1}. 🦀 ${d.name} (${d.region}) - ${d.price.toLocaleString("vi-VN")}đ\n`;
      });
      reply += `\nAnh/Chị có thể gõ "Đặt bàn X người vào giờ Y" để em hỗ trợ giữ bàn ngay nhé!`;

      return res.status(200).json({
        status: "success",
        reply,
        intent: "MENU_INFO",
        dishes,
      });
    }

    // KỊCH BẢN MẶC ĐỊNH: HỖ TRỢ TƯ VẤN CHUNG
    return res.status(200).json({
      status: "success",
      reply: `Dạ em là AI Assistant của Nhà hàng 3 Miền Cua! Em có thể giúp Anh/Chị đặt bàn tự động, tra cứu thực đơn đặc sản 3 miền, hoặc gợi ý món ăn. Anh/Chị có thể gõ ví dụ: "Cho tui đặt bàn 6 người tối mai lúc 19h" để em giữ bàn ngay ạ!`,
      intent: "GENERAL_HELP",
    });
  } catch (error) {
    next(error);
  }
};
