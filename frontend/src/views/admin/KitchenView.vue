<template>
  <div :class="['kitchen-view-wrapper', isDarkMode ? 'kds-dark-mode' : '']">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="fw-bold brand-font mb-1" :class="isDarkMode ? 'text-white' : 'text-dark'">
          <i class="fa-solid fa-fire-burner text-danger me-2"></i>Màn Hình Bếp Trực Tuyến (KDS)
        </h4>
        <p class="small mb-0" :class="isDarkMode ? 'text-secondary' : 'text-muted'">
          Theo dõi đơn món theo thời gian thực, chuông báo đơn mới và chuyển trạng thái chế biến
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- Nút Thử Chuông Bếp -->
        <button @click="testChime" class="btn btn-sm rounded-pill px-3 fw-semibold" :class="isDarkMode ? 'btn-outline-warning text-warning' : 'btn-outline-warning text-dark'" title="Phát thử chuông gọi bếp">
          <i class="fa-solid fa-bell me-1"></i> Chuông Báo
        </button>

        <!-- Nút Chuyển Dark Mode -->
        <button @click="toggleDarkMode" class="btn btn-sm rounded-pill px-3 fw-semibold" :class="isDarkMode ? 'btn-light text-dark' : 'btn-dark text-white'" title="Chuyển chế độ tối/sáng">
          <i :class="isDarkMode ? 'fa-solid fa-sun text-warning me-1' : 'fa-solid fa-moon me-1'"></i>
          {{ isDarkMode ? 'Giao Diện Sáng' : 'Giao Diện Tối (KDS)' }}
        </button>

        <button @click="fetchOrders" class="btn btn-outline-danger btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="row g-3">
      <!-- Cột trạng thái -->
      <div v-for="col in columns" :key="col.key" class="col-lg-4">
        <div :class="['kitchen-column p-3 rounded-4 h-100', `col-${col.key.toLowerCase()}`, isDarkMode ? 'kds-column-dark' : '']">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="fw-bold mb-0 d-flex align-items-center gap-2" :class="isDarkMode ? 'text-light' : 'text-dark'">
              <i :class="col.icon" :style="{ color: col.color }"></i>
              {{ col.label }}
            </h6>
            <span class="badge rounded-pill" :class="colBadgeClass(col.key)">{{ ordersByStatus(col.key).length }}</span>
          </div>

          <div v-if="ordersByStatus(col.key).length === 0" class="text-center small py-5" :class="isDarkMode ? 'text-secondary' : 'text-muted'">
            <i class="fa-solid fa-inbox fs-3 d-block mb-2 opacity-40"></i>
            Không có món nào
          </div>

          <div
            v-for="order in ordersByStatus(col.key)"
            :key="order._id"
            class="kitchen-ticket rounded-4 p-3 mb-3 border position-relative transition-all"
            :class="isDarkMode ? 'kds-ticket-dark border-secondary' : 'bg-white border-light shadow-2xs'"
          >
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge bg-danger px-2.5 py-1 rounded-pill fs-8 fw-bold">
                  <i class="fa-solid fa-chair me-1"></i>{{ tableNumbers(order) }}
                </span>
                <small class="ms-2 font-monospace" :class="isDarkMode ? 'text-secondary' : 'text-muted'">{{ order.orderCode }}</small>
              </div>
              <span
                :class="[
                  'badge rounded-pill fs-9 fw-semibold px-2 py-0.5',
                  elapsed(order.createdAt) > 15 ? 'bg-danger text-white' : 'bg-light text-dark border'
                ]"
              >
                <i class="fa-solid fa-clock me-1"></i>{{ elapsed(order.createdAt) }} phút
              </span>
            </div>

            <div class="small mb-2">
              <div
                v-for="(item, idx) in order.items"
                :key="idx"
                class="d-flex justify-content-between py-1.5 border-bottom"
                :class="isDarkMode ? 'border-secondary border-opacity-25' : 'border-light'"
              >
                <span class="fw-semibold" :class="isDarkMode ? 'text-light' : 'text-dark'">{{ item.dish?.name || 'Món ăn' }}</span>
                <strong class="text-danger fs-7">x{{ item.quantity }}</strong>
              </div>
            </div>

            <p v-if="order.notes" class="small mb-2 p-1.5 rounded-3 bg-warning bg-opacity-15 text-warning fw-semibold fs-9">
              <i class="fa-solid fa-circle-info me-1"></i>Ghi chú: {{ order.notes }}
            </p>

            <!-- Hành động chuyển trạng thái -->
            <div v-if="col.key === 'PENDING'" class="d-grid mt-2">
              <button @click="advance(order, 'PREPARING')" class="btn btn-warning btn-sm rounded-pill fw-bold text-dark shadow-2xs">
                <i class="fa-solid fa-fire-burner me-1.5"></i> Bắt Đầu Chế Biến
              </button>
            </div>
            <div v-else-if="col.key === 'PREPARING'" class="d-grid mt-2">
              <button @click="advance(order, 'SERVED')" class="btn btn-success btn-sm rounded-pill fw-bold shadow-2xs">
                <i class="fa-solid fa-bell-concierge me-1.5"></i> Nấu Xong / Phục Vụ
              </button>
            </div>
            <div v-else class="text-center text-success small fw-bold mt-2">
              <i class="fa-solid fa-circle-check me-1"></i>Đã phục vụ xong
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import api from "../../services/api";
import { onSocketEvent } from "../../services/socket";
import { toast } from "../../composables/useToast";
import { soundHelper } from "../../utils/soundHelper";

const orders = ref([]);
const loading = ref(false);
const isDarkMode = ref(localStorage.getItem("kds_dark_mode") === "true");
let offSocket = null;

const columns = [
  { key: "PENDING", label: "Chờ Chế Biến", icon: "fa-solid fa-hourglass-half", color: "#ef6c00" },
  { key: "PREPARING", label: "Đang Chế Biến", icon: "fa-solid fa-fire-burner", color: "#d32f2f" },
  { key: "SERVED", label: "Đã Nấu Xong / Ra Món", icon: "fa-solid fa-circle-check", color: "#2e7d32" },
];

const ordersByStatus = (status) => orders.value.filter((o) => o.status === status);

const colBadgeClass = (key) => {
  switch (key) {
    case "PENDING": return "bg-warning text-dark";
    case "PREPARING": return "bg-danger text-white";
    case "SERVED": return "bg-success text-white";
    default: return "bg-dark text-white";
  }
};

const tableNumbers = (order) => {
  const tables = order.diningSession?.tables || [];
  return tables.map((t) => t.tableNumber).join("+") || "Bàn";
};

const elapsed = (createdAt) => {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("kds_dark_mode", String(isDarkMode.value));
};

const testChime = () => {
  soundHelper.playKitchenChime();
  toast.info("Đã phát chuông gọi bếp!");
};

const fetchOrders = async (isFromSocket = false) => {
  if (!isFromSocket) loading.value = true;
  try {
    const res = await api.get("/orders/kitchen");
    const prevPendingCount = ordersByStatus("PENDING").length;
    orders.value = res.data.data.orders || [];

    const newPendingCount = ordersByStatus("PENDING").length;
    // Nếu có đơn mới chờ chế biến gửi đến qua realtime socket
    if (isFromSocket && newPendingCount > prevPendingCount) {
      soundHelper.playKitchenChime();
      toast.info("🔔 Có đơn gọi món mới gửi đến bếp!");
    }
  } catch (err) {
    if (!isFromSocket) toast.error("Lỗi tải đơn bếp: " + err.message);
  } finally {
    loading.value = false;
  }
};

const advance = async (order, status) => {
  try {
    await api.patch(`/orders/${order._id}/status`, { status });
    toast.success(`Đã chuyển ${order.orderCode} sang ${status === 'PREPARING' ? 'Đang chế biến' : 'Đã phục vụ'}`);
    await fetchOrders();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi chuyển trạng thái");
  }
};

onMounted(() => {
  fetchOrders();
  offSocket = onSocketEvent("orders:changed", () => fetchOrders(true));
});

onBeforeUnmount(() => {
  if (offSocket) offSocket();
});
</script>

<style scoped>
.kitchen-column {
  min-height: 420px;
}
.col-pending {
  background: rgba(239, 108, 0, 0.06);
  border: 1px dashed rgba(239, 108, 0, 0.4);
}
.col-preparing {
  background: rgba(211, 47, 47, 0.05);
  border: 1px dashed rgba(211, 47, 47, 0.4);
}
.col-served {
  background: rgba(46, 125, 50, 0.06);
  border: 1px dashed rgba(46, 125, 50, 0.4);
}
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* Dark Mode Styles */
.kds-dark-mode {
  background-color: #121212;
  color: #e0e0e0;
  min-height: 80vh;
  padding: 1.5rem;
  border-radius: 1.5rem;
}
.kds-column-dark {
  background: #1e1e1e !important;
  border: 1px solid #333 !important;
}
.kds-ticket-dark {
  background-color: #252525 !important;
  color: #fff !important;
}
</style>
