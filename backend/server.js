const http = require("http");
const app = require("./app");
const config = require("./app/config");
const mongoose = require("mongoose");
const { initSocket } = require("./app/socket");

// Kết nối tới MongoDB & khởi chạy HTTP Server (kèm Socket.io)
async function startServer() {
  try {
    console.log("Đang kết nối tới MongoDB...");
    await mongoose.connect(config.mongoUri);
    console.log("Kết nối tới MongoDB thành công");

    const server = http.createServer(app);
    initSocket(server);

    const PORT = config.port || 3000;
    server.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error("Lỗi kết nối tới MongoDB:", error);
    process.exit(1);
  }
}

// Gọi hàm khởi động server
startServer();
