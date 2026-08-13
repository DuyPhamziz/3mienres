const Invoice = require("../models/invoice.model");
const DiningSession = require("../models/dining-session.model");
const Order = require("../models/order.model");
const Table = require("../models/table.model");
const User = require("../models/user.model");
const Rank = require("../models/rank.model");
const AppError = require("../app-error");

// Hàm Helper: Tự động cộng dồn tiền tích lũy và xét thăng hạng thành viên cho khách
const updateCustomerRank = async (userId, paidAmount) => {
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) return;

  user.totalSpent = (user.totalSpent || 0) + paidAmount;

  // Lấy tất cả các hạng thành viên xếp theo mức chi tiêu tối thiểu từ cao xuống thấp
  const ranks = await Rank.find({ isActive: true }).sort({ minSpent: -1 });
  for (let r of ranks) {
    if (user.totalSpent >= r.minSpent) {
      user.rank = r._id;
      break;
    }
  }

  await user.save();
};

// 1. Xuất hóa đơn & Thanh toán giải phóng bàn
exports.createInvoice = async (req, res, next) => {
  try {
    const { diningSessionId, paymentMethod, discountAmount, taxPercent, notes } = req.body;

    // Lớp 1: Kiểm tra thiếu dữ liệu (400 Bad Request)
    if (!diningSessionId || !paymentMethod) {
      return next(new AppError("Vui lòng cung cấp lượt dùng bữa (diningSessionId) và Phương thức thanh toán (paymentMethod)", 400));
    }

    if (!["CASH", "CARD", "BANK_TRANSFER", "MOMO", "VNPAY"].includes(paymentMethod)) {
      return next(new AppError("Phương thức thanh toán không hợp lệ", 400));
    }

    // Lớp 2: Kiểm tra lượt dùng bữa
    const session = await DiningSession.findById(diningSessionId).populate("reservation");
    if (!session) return next(new AppError("Không tìm thấy lượt dùng bữa này", 404));

    // Xung đột nghiệp vụ: Không cho phép thanh toán 2 lần cho cùng 1 session
    const existingInvoice = await Invoice.findOne({ diningSession: session._id });
    if (existingInvoice) {
      return next(new AppError("Lượt dùng bữa này đã được thanh toán xuất hóa đơn từ trước!", 409));
    }

    // Lấy tất cả các đợt gọi món hợp lệ (Không bị CANCELLED)
    const validOrders = await Order.find({
      diningSession: session._id,
      status: { $ne: "CANCELLED" },
    });

    if (validOrders.length === 0) {
      return next(new AppError("Bàn ăn này chưa gọi bất kỳ món nào, không thể xuất hóa đơn!", 400));
    }

    // Tính tổng tiền các đợt gọi món
    const subtotal = validOrders.reduce((sum, ord) => sum + ord.subtotal, 0);

    const discount = discountAmount ? parseFloat(discountAmount) : 0;
    const vatPercent = taxPercent ? parseFloat(taxPercent) : 0;
    const taxAmount = (subtotal * vatPercent) / 100;

    // Tự động trừ tiền đặt cọc nếu có đơn đặt bàn trước đó
    let depositDeducted = 0;
    if (session.reservation && session.reservation.depositAmount) {
      depositDeducted = session.reservation.depositAmount;
    }

    // Số tiền thực tế phải thanh toán
    const finalAmount = Math.max(0, subtotal - discount + taxAmount - depositDeducted);

    // Sinh mã hóa đơn (VD: INV-20260813-102938)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    let invoiceCode;
    let isUnique = false;
    while (!isUnique) {
      invoiceCode = `INV-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
      const existing = await Invoice.findOne({ invoiceCode });
      if (!existing) isUnique = true;
    }

    // Lớp 3: Tạo Hóa đơn
    const newInvoice = await Invoice.create({
      invoiceCode,
      diningSession: session._id,
      orders: validOrders.map((o) => o._id),
      subtotal,
      discountAmount: discount,
      taxPercent: vatPercent,
      taxAmount,
      depositDeducted,
      finalAmount,
      paymentMethod,
      paymentStatus: "PAID",
      paidAt: now,
      cashier: req.user ? req.user._id : null,
      notes: notes ? notes.trim() : "",
    });

    // 1. Cập nhật lượt dùng bữa sang COMPLETED
    session.status = "COMPLETED";
    session.checkOutTime = now;
    await session.save();

    // 2. Giải phóng tất cả các bàn ăn về trạng thái AVAILABLE
    await Table.updateMany({ _id: { $in: session.tables } }, { status: "AVAILABLE" });

    // 3. Tự động tích lũy doanh số và thăng hạng thành viên cho khách hàng (nếu có tài khoản)
    if (session.reservation && session.reservation.user) {
      await updateCustomerRank(session.reservation.user, finalAmount);
    }

    const populatedInvoice = await Invoice.findById(newInvoice._id)
      .populate("diningSession")
      .populate("orders");

    res.status(201).json({
      status: "success",
      message: "Thanh toán thành công! Bàn ăn đã được giải phóng.",
      data: { invoice: populatedInvoice },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Xem chi tiết hóa đơn thanh toán của 1 bàn
exports.getInvoiceBySession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const invoice = await Invoice.findOne({ diningSession: sessionId })
      .populate("diningSession")
      .populate({
        path: "orders",
        populate: { path: "items.dish", select: "name price image" },
      })
      .populate("cashier", "name email");

    if (!invoice) return next(new AppError("Không tìm thấy hóa đơn cho lượt dùng bữa này", 404));

    res.status(200).json({
      status: "success",
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Quản lý xem toàn bộ danh sách hóa đơn / Báo cáo doanh thu
exports.getAllInvoices = async (req, res, next) => {
  try {
    const { date, paymentMethod } = req.query;
    const filter = {};

    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.paidAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const invoices = await Invoice.find(filter)
      .populate("diningSession", "sessionCode customerName customerPhone")
      .sort({ paidAt: -1 });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);

    res.status(200).json({
      status: "success",
      results: invoices.length,
      totalRevenue,
      data: { invoices },
    });
  } catch (error) {
    next(error);
  }
};