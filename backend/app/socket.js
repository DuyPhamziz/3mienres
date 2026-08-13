// Khởi tạo Socket.io cho realtime (đồng bộ trạng thái bàn, phiên ăn, đơn món, đặt bàn, hóa đơn).
// Module giữ 1 instance `io` duy nhất, các controller gọi emitEvent() để broadcast sự kiện.

let io = null;

exports.initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // Client có thể join "admin" room nếu cần lọc theo vai trò (mở rộng sau).
    console.log(`Socket.io client kết nối: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Socket.io client ngắt kết nối: ${socket.id}`);
    });
  });

  return io;
};

exports.getIO = () => io;

// Broadcast 1 sự kiện tới tất cả client đang kết nối.
exports.emitEvent = (event, payload = {}) => {
  if (io) io.emit(event, payload);
};
