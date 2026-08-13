const express = require("express");
const cors = require("cors");
const AppError = require("./app/app-error");
const morgan = require("morgan");
const authRouter = require("./app/routes/auth.routes");
const dishRouter = require("./app/routes/dish.routes");
const categoryRouter = require("./app/routes/category.routes");
const tableRouter = require("./app/routes/table.routes");
const reservationRouter = require("./app/routes/reservation.routes");
const ingredientRouter = require("./app/routes/ingredient.routes");
const recipeRouter = require("./app/routes/recipe.routes");
const areaRouter = require("./app/routes/area.routes");
const tableConnectionRouter = require("./app/routes/table-connection.routes");
const diningSessionRouter = require("./app/routes/dining-session.routes");
const orderRouter = require("./app/routes/order.routes");
const invoiceRouter = require("./app/routes/invoice.routes");
// 1. Cài đặt các middleware cho dự án
const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/dishes", dishRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/tables", tableRouter);
app.use("/api/reservations", reservationRouter);
app.use("/api/ingredients", ingredientRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/areas", areaRouter);
app.use("/api/table-connections", tableConnectionRouter);
app.use("/api/dining-sessions", diningSessionRouter);
app.use("/api/orders", orderRouter);
app.use("/api/invoices", invoiceRouter);
// 2. Định nghĩa các route của dự án
app.get("/", (req, res) => {
  res.json({ message: "Chào mừng bạn đến với nhà hàng 3 miền" });
});
// 3. Bắt các route không tồn tại và trả về lỗi 404
app.use((req, res, next) => {
  return next(new AppError("Không tìm thấy tài nguyên này", 404));
});

// 4. Middleware xử lý lỗi chung, khi bạn gọi next(error) ở bất kỳ đâu trong route, lỗi sẽ được truyền đến đây để xử lý
app.use((err, req, res, next) => {
  // Nếu lỗi không có statusCode, mặc định là 500 (Lỗi server)
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi server";
  return res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    // Nếu đang ở môi trường phát triển, trả về stack trace để dễ debug
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
module.exports = app;
