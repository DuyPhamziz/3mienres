const Order = require("../models/order.model");
const DiningSession = require("../models/dining-session.model");
const Dish = require("../models/dish.model");
const AppError = require("../app-error");

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
    let subtotal = 0;
    const formattedItems = [];

    for (let item of items) {
      if (!item.dish || !item.quantity || item.quantity <= 0) {
        return next(new AppError("Mỗi món ăn phải có ID hợp lệ và số lượng lớn hơn 0", 400));
      }

      const dishInfo = await Dish.findById(item.dish);
      if (!dishInfo) return next(new AppError(`Món ăn với ID '${item.dish}' không tồn tại`, 404));
      if (!dishInfo.availability) {
        return next(new AppError(`Món '${dishInfo.name}' hiện tại đã hết hàng!`, 400));
      }

      const itemTotal = dishInfo.price * item.quantity;
      subtotal += itemTotal;

      formattedItems.push({
        dish: dishInfo._id,
        quantity: item.quantity,
        price: dishInfo.price,
        notes: item.notes ? item.notes.trim() : "",
      });
    }

    // Sinh mã đợt gọi món
    let orderCode;
    let isUnique = false;
    while (!isUnique) {
      orderCode = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const existing = await Order.findOne({ orderCode });
      if (!existing) isUnique = true;
    }

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

    order.status = status;
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Cập nhật trạng thái gọi món thành công",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};