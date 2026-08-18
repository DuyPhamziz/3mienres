const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const AppError = require("./app/app-error");
const config = require("./app/config");

// Importer tất cả Router chuẩn hóa
const authRouter = require("./app/routes/auth.routes");
const areaRouter = require("./app/routes/area.routes");
const tableRouter = require("./app/routes/table.routes");
const tableConnectionRouter = require("./app/routes/table-connection.routes");
const reservationRouter = require("./app/routes/reservation.routes");
const diningSessionRouter = require("./app/routes/dining-session.routes");
const categoryRouter = require("./app/routes/category.routes");
const dishRouter = require("./app/routes/dish.routes");
const orderRouter = require("./app/routes/order.routes");
const invoiceRouter = require("./app/routes/invoice.routes");
const ingredientRouter = require("./app/routes/ingredient.routes");
const recipeRouter = require("./app/routes/recipe.routes");
const supplierRouter = require("./app/routes/supplier.routes");
const importReceiptRouter = require("./app/routes/import-receipt.routes");
const reviewRouter = require("./app/routes/review.routes");
const feedbackRouter = require("./app/routes/feedback.routes");
const rankRouter = require("./app/routes/rank.routes");
const chatbotRouter = require("./app/routes/chatbot.routes");
const uploadRouter = require("./app/routes/upload.routes");
const settingRouter = require("./app/routes/setting.routes");
const dashboardRouter = require("./app/routes/dashboard.routes");
const paymentRouter = require("./app/routes/payment.routes");
const userRouter = require("./app/routes/user.routes");
const voucherRouter = require("./app/routes/voucher.routes");
const auditRouter = require("./app/routes/audit.routes");

const app = express();

// 1. Cài đặt các Middleware cơ bản
app.use(helmet());

// CORS chỉ cho phép frontend đã cấu hình (và localhost khi dev)
app.use(
  cors({
    origin: [config.frontendUrl, /^http:\/\/localhost(:\d+)?$/],
    credentials: true,
  }),
);

// Chỉ log request ở môi trường development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Đứng sau reverse proxy (nginx/vps) để rate limiter tính đúng IP
app.set("trust proxy", 1);

// Giới hạn tốc độ chung (chống spam / brute-force)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút",
});
app.use(generalLimiter);

// Giới hạn tốc độ riêng cho /api/auth (chống brute-force đăng nhập)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút",
});
app.use("/api/auth", authLimiter);

// Serve tĩnh thư mục hình ảnh uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// 2. Mount tất cả API Routes
app.use("/api/auth", authRouter);
app.use("/api/areas", areaRouter);
app.use("/api/tables", tableRouter);
app.use("/api/table-connections", tableConnectionRouter);
app.use("/api/reservations", reservationRouter);
app.use("/api/dining-sessions", diningSessionRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/dishes", dishRouter);
app.use("/api/orders", orderRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/ingredients", ingredientRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/import-receipts", importReceiptRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/ranks", rankRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/settings", settingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/users", userRouter);
app.use("/api/vouchers", voucherRouter);
app.use("/api/audit-logs", auditRouter);

// 3. Route trang chủ
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Chào mừng bạn đến với API Hệ thống Quản lý & Đặt bàn Nhà hàng 3 Miền Cua!",
  });
});

// 4. Bắt route 404 Not Found
app.use((req, res, next) => {
  return next(new AppError("Không tìm thấy tài nguyên API này trên hệ thống", 404));
});

// 5. Middleware xử lý lỗi tập trung chuẩn 5 mã lỗi HTTP
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi máy chủ nội bộ";

  return res.status(statusCode).json({
    status: err.status || "error",
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
