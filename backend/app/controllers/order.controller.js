const Order = require("../models/order.model");
const DiningSession = require("../models/dining-session.model");
const Dish = require("../models/dish.model");
const AppError = require("../app-error");
const { generateUniqueCode } = require("../utils/code-generator");
const { emitEvent } = require("../socket");
const { deductOrderIngredients } = require("../utils/inventory");

// Helper: Kiểm tra hợp lệ các món và tính tổng tiền (dùng chung cho POS & khách tự gọi)
async function buildOrderItems(items) {
  let subtotal = 0;
  const formattedItems = [];

  for (let item of items) {
    if (!item.dish || !item.quantity || item.quantity <= 0) {
      throw new AppError("Mỗi món ăn phải có ID hợp lệ và số lượng lớn hơn 0", 400);
    }

    const dishInfo = await Dish.findById(item.dish);
    if (!dishInfo) throw new AppError(`Món ăn với ID '${item.dish}' không tồn tại`, 404);
    if (!dishInfo.availability) {
      throw new AppError(`Món '${dishInfo.name}' hiện tại đã hết hàng!`, 400);
    }

    subtotal += dishInfo.price * item.quantity;

    formattedItems.push({
      dish: dishInfo._id,
      quantity: item.quantity,
      price: dishInfo.price,
      notes: item.notes ? item.notes.trim() : "",
    });
  }

  return { subtotal, formattedItems };
}

// 1. Tạo đợt gọi món mới tại bàn (Order)
exports.createOrder = async (req, res, next) => {
  try {
    const { diningSessionId, items, notes } = req.body;

    // Lớp 1: Kiểm tra thiếu đầu vào (400 Bad Request)
    if (!diningSessionId || !items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError("Vui lòng cung cấp lượt dùng bữa (diningSessionId) và danh sách món gọi (items)", 400));
    }

    // Lớp 2: Kiểm tra lượt dùng bữa có đang hoạt động (ACTIVE) không
    const session = await DiningSession.findById(diningSessionId);
    if (!session) return next(new AppError("Không tìm thấy lượt dùng bữa này", 404));

    if (session.status !== "ACTIVE") {
      return next(new AppError("Lượt dùng bữa này đã kết thúc, không thể gọi thêm món!", 409));
    }

    // Kiểm tra tính hợp lệ và tính tổng tiền đợt gọi món
    const { subtotal, formattedItems } = await buildOrderItems(items);

    // Sinh mã đợt gọi món duy nhất
    const orderCode = await generateUniqueCode(Order, "ORD", "orderCode");

    // Lớp 3: Tạo đợt gọi món
    const newOrder = await Order.create({
      orderCode,
      diningSession: session._id,
      items: formattedItems,
      subtotal,
      status: "PENDING",
      orderedBy: req.user ? req.user._id : null,
      notes: notes ? notes.trim() : "",
    });

    const populatedOrder = await Order.findById(newOrder._id).populate("items.dish", "name image price");

    emitEvent("orders:changed");

    res.status(201).json({
      status: "success",
      message: "Ghi nhận đợt gọi món thành công!",
      data: { order: populatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Lấy danh sách tất cả các đợt gọi món của một bàn (DiningSession)
exports.getOrdersBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const orders = await Order.find({ diningSession: sessionId })
      .populate("items.dish", "name image price")
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Cập nhật trạng thái món ăn (Chế biến, Phục vụ, Hủy món)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "PREPARING", "SERVED", "CANCELLED"].includes(status)) {
      return next(new AppError("Trạng thái đợt gọi món không hợp lệ", 400));
    }

    const order = await Order.findById(id);
    if (!order) return next(new AppError("Không tìm thấy đợt gọi món này", 404));

    const previousStatus = order.status;
    order.status = status;

    // Tự động trừ kho nguyên liệu theo công thức khi món được phục vụ (SERVED)
    if (status === "SERVED" && previousStatus !== "SERVED" && !order.stockDeducted) {
      await deductOrderIngredients(order);
      order.stockDeducted = true;
    }

    await order.save();

    emitEvent("orders:changed");

    res.status(200).json({
      status: "success",
      message: "Cập nhật trạng thái gọi món thành công",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Lấy danh sách đơn món cho màn hình bếp (KDS) - chỉ các đơn của bàn đang hoạt động
exports.getKitchenOrders = async (req, res, next) => {
  try {
    const activeSessions = await DiningSession.find({ status: "ACTIVE" }).select("_id");
    const sessionIds = activeSessions.map((s) => s._id);

    const orders = await Order.find({
      diningSession: { $in: sessionIds },
      status: { $ne: "CANCELLED" },
    })
      .populate("items.dish", "name image price")
      .populate({
        path: "diningSession",
        select: "sessionCode customerName",
        populate: { path: "tables", select: "tableNumber" },
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Khách tự gọi món qua QR bàn (công khai, không cần đăng nhập)
exports.createGuestOrder = async (req, res, next) => {
  try {
    const { sessionCode, items, notes } = req.body;

    if (!sessionCode || !items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError("Vui lòng cung cấp mã bàn (sessionCode) và danh sách món gọi", 400));
    }

    const session = await DiningSession.findOne({ sessionCode: sessionCode.trim().toUpperCase() });
    if (!session) return next(new AppError("Không tìm thấy lượt dùng bữa với mã bàn này", 404));
    if (session.status !== "ACTIVE") {
      return next(new AppError("Lượt dùng bữa này đã kết thúc, không thể gọi thêm món!", 409));
    }

    const { subtotal, formattedItems } = await buildOrderItems(items);
    const orderCode = await generateUniqueCode(Order, "ORD", "orderCode");

    const newOrder = await Order.create({
      orderCode,
      diningSession: session._id,
      items: formattedItems,
      subtotal,
      status: "PENDING",
      orderedBy: null,
      notes: notes ? notes.trim() : "Khách tự gọi qua QR bàn",
    });

    const populatedOrder = await Order.findById(newOrder._id).populate("items.dish", "name image price");

    emitEvent("orders:changed");

    res.status(201).json({
      status: "success",
      message: "Gửi món thành công! Nhà bếp sẽ chế biến ngay.",
      data: { order: populatedOrder },
    });
  } catch (error) {
    next(error);
  }
};