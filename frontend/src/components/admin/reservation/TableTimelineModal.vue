<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
      <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
        <!-- Header -->
        <div class="modal-header border-0 pb-2">
          <div>
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-calendar-day me-2"></i>Lịch Đặt Bàn Trong Ngày (Table Timeline)
            </h5>
            <small class="text-muted fs-8">Theo dõi trực quan phân bổ đặt chỗ của các bàn theo từng khung giờ trong ngày</small>
          </div>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>

        <!-- Filter Bar & Summary -->
        <div class="modal-body py-2">
          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 bg-light p-2.5 rounded-4 border">
            <!-- Date & Area Pickers -->
            <div class="d-flex gap-2 align-items-center flex-wrap">
              <div class="input-group input-group-sm" style="width: 170px;">
                <span class="input-group-text bg-white"><i class="fa-solid fa-calendar-days text-danger"></i></span>
                <input
                  v-model="selectedDate"
                  @change="fetchData"
                  type="date"
                  class="form-control fw-bold fs-8"
                />
              </div>

              <select v-model="selectedArea" class="form-select form-select-sm fs-8 fw-semibold" style="width: 160px;">
                <option value="">Tất cả khu vực</option>
                <option v-for="area in tableStore.areas" :key="area._id" :value="area._id">
                  {{ area.name }}
                </option>
              </select>

              <button @click="fetchData" class="btn btn-outline-danger btn-sm rounded-pill px-3 fs-8">
                <i class="fa-solid fa-rotate me-1"></i>Tải lại
              </button>
            </div>

            <!-- Summary Chips -->
            <div class="d-flex gap-2 align-items-center flex-wrap" style="font-size: 0.72rem;">
              <span class="badge bg-white text-dark border rounded-pill px-2.5 py-1.5 shadow-2xs">
                Tổng: <strong>{{ reservations.length }}</strong> đơn
              </span>
              <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1.5">
                Đã duyệt: <strong>{{ countByStatus('CONFIRMED') }}</strong>
              </span>
              <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5 py-1.5">
                Đang ăn: <strong>{{ countByStatus('ARRIVED') }}</strong>
              </span>
              <span class="badge bg-dark bg-opacity-10 text-dark rounded-pill px-2.5 py-1.5">
                Vắng mặt: <strong>{{ countByStatus('NO_SHOW') }}</strong>
              </span>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border spinner-border-sm text-danger" role="status"></div>
            <p class="text-muted small mt-2">Đang tải lịch đặt bàn...</p>
          </div>

          <!-- Timeline Grid View -->
          <div v-else-if="filteredTables.length > 0" class="timeline-container border rounded-4 bg-white p-3 table-responsive">
            <table class="table table-bordered align-middle timeline-table mb-0">
              <thead>
                <tr class="bg-light text-center" style="font-size: 0.72rem;">
                  <th style="width: 110px;" class="sticky-col">Bàn / Khung Giờ</th>
                  <th v-for="h in hourSlots" :key="h" style="min-width: 75px;">
                    {{ String(h).padStart(2, '0') }}:00
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in filteredTables" :key="t._id" style="font-size: 0.72rem;">
                  <!-- Table Column -->
                  <td class="sticky-col bg-white">
                    <div class="d-flex align-items-center gap-1.5">
                      <span class="badge bg-danger rounded-3 px-1.5 py-1 text-white fw-bold">
                        {{ t.tableNumber }}
                      </span>
                      <div>
                        <small class="d-block fw-semibold text-dark">{{ t.capacity }} chỗ</small>
                        <small class="text-muted fs-9 d-block text-truncate" style="max-width: 60px;">{{ t.area?.name }}</small>
                      </div>
                    </div>
                  </td>

                  <!-- Time Slots -->
                  <td
                    v-for="h in hourSlots"
                    :key="h"
                    class="position-relative time-cell p-1 text-center"
                    :class="{ 'bg-slot-active': getReservationInSlot(t._id, h) }"
                  >
                    <div
                      v-if="getReservationInSlot(t._id, h)"
                      class="res-chip rounded-2 p-1 text-start cursor-pointer shadow-2xs transition-all"
                      :class="chipClass(getReservationInSlot(t._id, h).status)"
                      @click="selectedReservation = getReservationInSlot(t._id, h)"
                      :title="`${getReservationInSlot(t._id, h).reservationCode} - ${getReservationInSlot(t._id, h).customerName}`"
                    >
                      <strong class="d-block text-truncate fs-9">{{ getReservationInSlot(t._id, h).customerName }}</strong>
                      <span class="fs-9 opacity-75">
                        {{ formatTime(getReservationInSlot(t._id, h).startAt) }} ({{ getReservationInSlot(t._id, h).guestsCount }}k)
                      </span>
                    </div>
                    <span v-else class="empty-dot">·</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center text-muted py-5">
            <i class="fa-solid fa-chair display-4 text-secondary mb-2 opacity-50"></i>
            <p class="small mb-0">Không có bàn nào thuộc khu vực đã chọn</p>
          </div>

          <!-- Detail Modal / Drawer nếu click vào 1 đơn -->
          <div v-if="selectedReservation" class="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4 p-3 mt-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge bg-danger rounded-pill px-2.5 py-1 fs-8 fw-bold me-2">
                  {{ selectedReservation.reservationCode }}
                </span>
                <strong class="text-dark fs-6">{{ selectedReservation.customerName }}</strong>
                <small class="text-muted ms-2">({{ selectedReservation.customerPhone }})</small>
              </div>
              <button @click="selectedReservation = null" class="btn-close btn-close-sm"></button>
            </div>
            <div class="row g-2 small text-secondary">
              <div class="col-md-3 col-6">
                <span class="text-muted">Thời gian:</span>
                <strong class="text-danger d-block">
                  {{ formatTime(selectedReservation.startAt) }} - {{ formatTime(selectedReservation.endAt) }}
                </strong>
              </div>
              <div class="col-md-3 col-6">
                <span class="text-muted">Số lượng khách:</span>
                <strong class="text-dark d-block">{{ selectedReservation.guestsCount }} người</strong>
              </div>
              <div class="col-md-3 col-6">
                <span class="text-muted">Trạng thái:</span>
                <span :class="['badge rounded-pill d-inline-block mt-0.5 fs-9', chipClass(selectedReservation.status)]">
                  {{ selectedReservation.status }}
                </span>
              </div>
              <div class="col-md-3 col-6">
                <span class="text-muted">Tiền cọc:</span>
                <strong class="text-dark d-block">
                  {{ selectedReservation.depositAmount > 0 ? selectedReservation.depositAmount.toLocaleString('vi-VN') + 'đ (' + selectedReservation.depositStatus + ')' : 'Không cọc' }}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer border-0 pt-2">
          <button @click="$emit('close')" class="btn btn-secondary btn-sm rounded-pill px-4">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTableStore } from "../../../stores/tableStore";
import api from "../../../services/api";

defineEmits(["close"]);

const tableStore = useTableStore();

const loading = ref(false);
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const selectedArea = ref("");
const reservations = ref([]);
const selectedReservation = ref(null);

const hourSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

const filteredTables = computed(() => {
  let list = tableStore.tables.filter((t) => t.isActive !== false);
  if (selectedArea.value) {
    list = list.filter((t) => (t.area?._id || t.area || t.areaId || "").toString() === selectedArea.value.toString());
  }
  return list;
});

const countByStatus = (status) => {
  return reservations.value.filter((r) => r.status === status).length;
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const chipClass = (status) => {
  switch (status) {
    case "CONFIRMED": return "bg-success text-white";
    case "ARRIVED": return "bg-primary text-white";
    case "NO_SHOW": return "bg-dark text-white";
    case "CANCELLED": return "bg-danger bg-opacity-25 text-danger";
    case "COMPLETED": return "bg-secondary text-white";
    default: return "bg-warning text-dark";
  }
};

const getReservationInSlot = (tableId, hour) => {
  const tStr = tableId.toString();
  return reservations.value.find((r) => {
    if (!["CONFIRMED", "ARRIVED", "COMPLETED", "NO_SHOW"].includes(r.status)) return false;
    const hasTable = r.tables && r.tables.some((t) => (t._id || t).toString() === tStr);
    if (!hasTable) return false;

    const startH = new Date(r.startAt).getHours();
    const endH = new Date(r.endAt).getHours();
    return hour >= startH && hour <= endH;
  });
};

const fetchData = async () => {
  loading.value = true;
  selectedReservation.value = null;
  try {
    const res = await api.get("/reservations", {
      params: { date: selectedDate.value, limit: 100 },
    });
    reservations.value = res.data?.data?.reservations || [];
  } catch (err) {
    console.error("Lỗi lấy dữ liệu timeline:", err);
    reservations.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  tableStore.fetchTables();
  tableStore.fetchAreas();
  await fetchData();
});
</script>

<style scoped>
.timeline-container {
  max-height: 480px;
  overflow-y: auto;
}
.timeline-table {
  border-collapse: separate;
  border-spacing: 0;
}
.sticky-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: #fff;
  border-right: 2px solid #e5e7eb;
}
.time-cell {
  height: 44px;
}
.bg-slot-active {
  background-color: #f8fafc;
}
.res-chip {
  line-height: 1.15;
  font-size: 0.65rem;
}
.res-chip:hover {
  transform: scale(1.04);
}
.empty-dot {
  color: #cbd5e1;
  font-size: 1.2rem;
  line-height: 1;
}
.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
