<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1"><i class="fa-solid fa-fire-burner text-danger me-2"></i>Màn Hình Bếp (KDS)</h2>
        <p class="text-muted small mb-0">Theo dõi đơn món theo thời gian thực và chuyển trạng thái chế biến</p>
      </div>
      <button @click="fetchOrders" class="btn btn-outline-danger btn-sm rounded-pill px-3">
        <i class="fa-solid fa-rotate me-1"></i> Làm mới
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="row g-4">
      <!-- Cột trạng thái -->
      <div v-for="col in columns" :key="col.key" class="col-lg-4">
        <div :class="['kitchen-column p-3 rounded-4 h-100', `col-${col.key.toLowerCase()}`]">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
              <i :class="col.icon" :style="{ color: col.color }"></i>
              {{ col.label }}
            </h5>
            <span class="badge rounded-pill bg-dark">{{ ordersByStatus(col.key).length }}</span>
          </div>

          <div v-if="ordersByStatus(col.key).length === 0" class="text-center text-muted small py-4">
            <i class="fa-solid fa-inbox fs-4 d-block mb-2 opacity-50"></i>
            Không có đơn
          </div>

          <div v-for="order in ordersByStatus(col.key)" :key="order._id" class="kitchen-ticket bg-white rounded-4 border p-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge bg-danger px-2 py-1 rounded-pill fs-8">
                  <i class="fa-solid fa-chair me-1"></i>{{ tableNumbers(order) }}
                </span>
                <small class="text-muted ms-2">{{ order.orderCode }}</small>
              </div>
              <span class="badge bg-light text-dark border fs-8">{{ elapsed(order.createdAt) }} phút</span>
            </div>

            <div class="small mb-2">
              <div v-for="(item, idx) in order.items" :key="idx" class="d-flex justify-content-between py-1 border-bottom border-light">
                <span class="text-dark fw-semibold">{{ item.dish?.name || 'Món' }}</span>
                <span class="text-danger fw-bold">x{{ item.quantity }}</span>
              </div>
            </div>

            <p v-if="order.notes" class="small text-warning mb-2">
              <i class="fa-solid fa-circle-info me-1"></i>{{ order.notes }}
            </p>

            <!-- Hành động chuyển trạng thái -->
            <div v-if="col.key === 'PENDING'" class="d-grid">
              <button @click="advance(order, 'PREPARING')" class="btn btn-warning btn-sm rounded-pill fw-bold">
                <i class="fa-solid fa-play me-1"></i> Bắt Đầu Chế Biến
              </button>
            </div>
            <div v-else-if="col.key === 'PREPARING'" class="d-grid">
              <button @click="advance(order, 'SERVED')" class="btn btn-success btn-sm rounded-pill fw-bold">
                <i class="fa-solid fa-bell-concierge me-1"></i> Đã Xong / Phục Vụ
              </button>
            </div>
            <div v-else class="text-center text-success small fw-bold">
              <i class="fa-solid fa-circle-check me-1"></i>Đã phục vụ
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import api from "../../services/api";
import { onSocketEvent } from "../../services/socket";
import { toast } from "../../composables/useToast";

const orders = ref([]);
const loading = ref(false);
let offSocket = null;

const columns = [
  { key: "PENDING", label: "Chờ Chế Biến", icon: "fa-solid fa-hourglass-half", color: "#ef6c00" },
  { key: "PREPARING", label: "Đang Chế Biến", icon: "fa-solid fa-fire-burner", color: "#d32f2f" },
  { key: "SERVED", label: "Đã Phục Vụ", icon: "fa-solid fa-circle-check", color: "#2e7d32" },
];

const ordersByStatus = (status) => orders.value.filter((o) => o.status === status);

const tableNumbers = (order) => {
  const tables = order.diningSession?.tables || [];
  return tables.map((t) => t.tableNumber).join('+') || 'Bàn';
};

const elapsed = (createdAt) => {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await api.get("/orders/kitchen");
    orders.value = res.data.data.orders;
  } catch (err) {
    toast.error("Lỗi tải đơn bếp: " + err.message);
  } finally {
    loading.value = false;
  }
};

const advance = async (order, status) => {
  try {
    await api.patch(`/orders/${order._id}/status`, { status });
    toast.success(`Đã chuyển ${order.orderCode} sang ${status}`);
    await fetchOrders();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi chuyển trạng thái");
  }
};

onMounted(() => {
  fetchOrders();
  offSocket = onSocketEvent("orders:changed", fetchOrders);
});

onBeforeUnmount(() => {
  if (offSocket) offSocket();
});
</script>

<style scoped>
.kitchen-column {
  min-height: 300px;
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
.kitchen-ticket {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
