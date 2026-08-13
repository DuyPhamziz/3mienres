<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Đơn Đặt Bàn Trực Tuyến</h2>
        <p class="text-muted small mb-0">Duyệt đơn, gán bàn dự kiến và bấm Check-in khi khách hàng tới nhà hàng</p>
      </div>
      <button @click="fetchReservations" class="btn btn-outline-danger btn-sm rounded-pill px-3">
        <i class="fa-solid fa-rotate me-1"></i> Làm mới
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="glass-card p-4 rounded-4">
      <div v-if="reservations.length > 0" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Số Khách</th>
              <th>Giờ Đặt Bàn</th>
              <th>Bàn Dự Kiến</th>
              <th>Trạng Thái</th>
              <th class="text-end">Thao Tác Check-in</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="res in reservations" :key="res._id">
              <td><strong class="text-danger">{{ res.reservationCode }}</strong></td>
              <td>
                <strong class="d-block text-dark">{{ res.customerName }}</strong>
                <small class="text-muted">{{ res.customerPhone }}</small>
              </td>
              <td><span class="badge bg-secondary rounded-pill px-3 py-1">{{ res.guestsCount }} người</span></td>
              <td><small class="fw-semibold text-danger">{{ new Date(res.startAt).toLocaleString('vi-VN') }}</small></td>
              <td>
                <div v-if="res.tables && res.tables.length > 0" class="d-flex gap-1 flex-wrap">
                  <span v-for="t in res.tables" :key="t._id" class="badge bg-danger rounded-pill">
                    Bàn {{ t.tableNumber }}
                  </span>
                </div>
                <span v-else class="text-muted fs-8">Chưa gán bàn</span>
              </td>
              <td>
                <span
                  :class="[
                    'badge px-3 py-2 rounded-pill fs-8',
                    res.status === 'CONFIRMED' ? 'bg-success' : res.status === 'ARRIVED' ? 'bg-primary' : 'bg-secondary'
                  ]"
                >
                  {{ res.status === 'CONFIRMED' ? 'Đã duyệt giữ chỗ' : res.status === 'ARRIVED' ? 'Khách Đã Đến' : res.status }}
                </span>
              </td>
              <td class="text-end">
                <button
                  v-if="res.status === 'CONFIRMED' || res.status === 'PENDING'"
                  @click="handleCheckIn(res)"
                  class="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                >
                  <i class="fa-solid fa-right-to-bracket me-1"></i> Check-in Mở Bàn
                </button>
                <span v-else class="text-muted small fs-8">Hoàn tất</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small py-4 text-center mb-0">Chưa có đơn đặt bàn nào trong hệ thống</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";
import { useSessionStore } from "../../stores/sessionStore";

const sessionStore = useSessionStore();
const reservations = ref([]);
const loading = ref(false);

const fetchReservations = async () => {
  loading.value = true;
  try {
    const res = await api.get("/reservations");
    reservations.value = res.data.data.reservations;
  } catch (err) {
    console.error("Lỗi lấy danh sách đặt bàn:", err);
  } finally {
    loading.value = false;
  }
};

const handleCheckIn = async (reservation) => {
  if (!confirm(`Xác nhận Check-in đón đoàn khách '${reservation.customerName}' vào bàn?`)) return;
  try {
    await sessionStore.checkInReservation(reservation._id, reservation.guestsCount, reservation.tables.map(t => t._id));
    alert("Check-in mở bàn thành công!");
    await fetchReservations();
  } catch (err) {
    alert("Lỗi Check-in: " + err.message);
  }
};

onMounted(() => {
  fetchReservations();
});
</script>
