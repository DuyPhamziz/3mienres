import { io } from "socket.io-client";

// Kết nối Socket.io tới backend để nhận cập nhật realtime.
// Dùng singleton để toàn bộ app chỉ mở đúng 1 connection.

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io("http://localhost:3000", {
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

// Đăng ký lắng nghe sự kiện và trả về hàm hủy đăng ký.
export function onSocketEvent(event, handler) {
  const s = connectSocket();
  s.on(event, handler);
  return () => s.off(event, handler);
}
