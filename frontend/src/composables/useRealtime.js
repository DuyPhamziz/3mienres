import { onMounted, onBeforeUnmount } from "vue";
import { connectSocket } from "../services/socket";
import { useTableStore } from "../stores/tableStore";
import { useSessionStore } from "../stores/sessionStore";
import { useReservationStore } from "../stores/reservationStore";

// Composable dùng chung: khi mount, kết nối Socket.io và tự động refresh
// các Pinia store tương ứng mỗi khi backend broadcast sự kiện thay đổi.
export function useRealtime() {
  const tableStore = useTableStore();
  const sessionStore = useSessionStore();
  const reservationStore = useReservationStore();

  let socket = null;
  const listeners = [];

  const bind = (event, fn) => {
    if (!socket) return;
    socket.on(event, fn);
    listeners.push([event, fn]);
  };

  onMounted(() => {
    socket = connectSocket();
    bind("tables:changed", () => tableStore.fetchTables());
    bind("connections:changed", () => tableStore.fetchConnections());
    bind("sessions:changed", () => {
      sessionStore.fetchActiveSessions();
      reservationStore.fetchMyReservations();
    });
    bind("reservations:changed", () => {
      reservationStore.fetchAllReservations();
      reservationStore.fetchMyReservations();
    });
    // Đơn món / hóa đơn thay đổi cũng ảnh hưởng tới trạng thái phiên ăn & đơn đặt bàn.
    bind("orders:changed", () => {
      sessionStore.fetchActiveSessions();
      reservationStore.fetchMyReservations();
    });
    bind("invoices:changed", () => {
      sessionStore.fetchActiveSessions();
      reservationStore.fetchMyReservations();
    });
  });

  onBeforeUnmount(() => {
    listeners.forEach(([event, fn]) => socket && socket.off(event, fn));
  });
}
