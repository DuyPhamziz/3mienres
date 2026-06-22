const app = require("./app");
const config = require("./app/config");
const mongoose = require("mongoose");

// Kết nối tới MongoDB
async function startServer() {
  try {
    console.log("Đang kết nối tới MongoDB...");
    await mongoose.connect(config.mongoUri);
    console.log("Kết nối tới MongoDB thành công");
    const PORT = config.port || 3000;
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error("Lỗi kết nối tới MongoDB:", error);
    process.exit(1);
  }
}
// Gọi hàm khởi động server
startServer();
