const Invoice = require("../models/invoice.model");
const Reservation = require("../models/reservation.model");
const Table = require("../models/table.model");
const Ingredient = require("../models/ingredient.model");
const Order = require("../models/order.model");
const AppError = require("../app-error");

// Báo cáo tổng quan kinh doanh cho Dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    // 1. Thống kê Doanh thu từ Hóa đơn đã thanh toán
    const invoices = await Invoice.find({
      paidAt: { $gte: start, $lte: end },
      paymentStatus: "PAID",
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const invoiceCount = invoices.length;

    // 2. Thống kê Đặt bàn (Reservation)
    const reservationsCount = await Reservation.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    // 3. Thống kê Tỷ lệ lấp đầy bàn hiện tại
    const totalTables = await Table.countDocuments({ isActive: true });
    const occupiedTables = await Table.countDocuments({ isActive: true, status: "OCCUPIED" });
    const occupancyRate = totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0;

    // 4. Top 5 món ăn bán chạy nhất
    const topDishesPipeline = [
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.dish",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "dishes",
          localField: "_id",
          foreignField: "_id",
          as: "dishInfo",
        },
      },
      { $unwind: "$dishInfo" },
      {
        $project: {
          _id: 1,
          name: "$dishInfo.name",
          image: "$dishInfo.image",
          price: "$dishInfo.price",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ];

    const topDishes = await Order.aggregate(topDishesPipeline);

    // 5. Thống kê cảnh báo tồn kho (Nguyên liệu chạm ngưỡng)
    const allIngredients = await Ingredient.find();
    const lowStockIngredients = allIngredients.filter((ing) => ing.stockQuantity <= ing.minStockLevel);

    res.status(200).json({
      status: "success",
      filterRange: { start, end },
      data: {
        totalRevenue,
        invoiceCount,
        reservationsCount,
        tablesOverview: {
          totalTables,
          occupiedTables,
          occupancyRate: `${occupancyRate}%`,
        },
        topDishes,
        lowStockAlerts: {
          count: lowStockIngredients.length,
          ingredients: lowStockIngredients,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};