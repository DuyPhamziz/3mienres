<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Đơn Đặt Bàn & Quét Mã QR Check-in</h2>
        <p class="text-muted small mb-0">Quét mã QR của khách khi tới quầy để xác nhận vào bàn tức thì trong 3 giây</p>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <div class="input-group input-group-sm" style="width: 240px;">
          <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input v-model="search" @keyup.enter="onSearch" type="text" class="form-control" placeholder="Tìm mã / tên / SĐT..." />
        </div>
        <button @click="fetchReservations" class="btn btn-outline-danger btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- QUICK QR CHECK-IN SCANNER BOX FOR STAFF -->
    <div class="glass-card p-4 rounded-4 mb-4 border-danger border-opacity-50 bg-white">
      <h5 class="fw-bold brand-font text-danger mb-2">
        <i class="fa-solid fa-qrcode me-2"></i>Quét / Nhập Mã QR Check-in Tốc Độ
      </h5>
      <p class="small text-muted mb-3">Sử dụng máy quét mã vạch hoặc gõ Mã đặt bàn trên vé của khách (VD: RES-393861) để tìm đơn tức thì:</p>
      <div class="input-group" style="max-width: 480px;">
        <span class="input-group-text bg-danger text-white"><i class="fa-solid fa-barcode"></i></span>
        <input
          v-model="qrSearchCode"
          @input="handleQRScanInput"
          type="text"
          class="form-control text-uppercase fw-bold border-danger py-2"
          placeholder="Quét hoặc nhập RES-XXXXXX..."
        />
        <button v-if="qrSearchCode" @click="qrSearchCode = ''" class="btn btn-outline-secondary" type="button">Xóa</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="glass-card p-4 rounded-4 bg-white">
      <div v-if="filteredReservations.length > 0" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Số Khách</th>
              <th>Giờ Đặt Bàn</th>
              <th>Bàn Dự Kiến</th>
              <th>Trạng Thái</th>
              <th>Tiền Cọc</th>
              <th class="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="res in filteredReservations"
              :key="res._id"
              :class="{ 'table-warning': qrSearchCode && res.reservationCode.includes(qrSearchCode.toUpperCase()) }"
            >
              <td><strong class="text-danger fs-6">{{ res.reservationCode }}</strong></td>
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
              <td>
                <template v-if="res.depositAmount > 0">
                  <strong class="d-block text-danger small">{{ res.depositAmount.toLocaleString('vi-VN') }}đ</strong>
                  <span :class="['badge rounded-pill fs-8', res.depositStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark']">
                    {{ res.depositStatus === 'PAID' ? 'Đã nhận cọc' : 'Chưa nhận cọc' }}
                  </span>
                </template>
                <span v-else class="text-muted fs-8">Không cọc</span>
              </td>
              <td class="text-end">
                <div class="d-flex gap-2 justify-content-end flex-wrap">
                  <button
                    v-if="res.depositAmount > 0 && res.depositStatus !== 'PAID' && (res.status === 'CONFIRMED' || res.status === 'PENDING')"
                    @click="handleConfirmDeposit(res)"
                    class="btn btn-warning btn-sm rounded-pill px-3 fw-bold"
                  >
                    <i class="fa-solid fa-money-bill-transfer me-1"></i> Nhận Cọc
                  </button>
                  <button
                    v-if="res.status === 'CONFIRMED' || res.status === 'PENDING'"
                    @click="handleCheckIn(res)"
                    class="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                  >
                    <i class="fa-solid fa-right-to-bracket me-1"></i> Check-in
                  </button>
                  <span v-if="res.status === 'ARRIVED' || res.status === 'COMPLETED'" class="text-muted small fs-8">Hoàn tất</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small py-4 text-center mb-0">Không tìm thấy đơn đặt bàn khớp với từ khóa tìm kiếm</p>

      <!-- Phân trang -->
      <div v-if="meta.totalPages > 1" class="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
        <small class="text-muted">Trang {{ meta.page }}/{{ meta.totalPages }} · {{ meta.total }} đơn</small>
        <div class="d-flex gap-2">
          <button @click="goPage(meta.page - 1)" :disabled="meta.page <= 1" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <i class="fa-solid fa-chevron-left me-1"></i> Trước
          </button>
          <button @click="goPage(meta.page + 1)" :disabled="meta.page >= meta.totalPages" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
            Sau <i class="fa-solid fa-chevron-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSessionStore } from "../../stores/sessionStore";
import { useReservationStore } from "../../stores/reservationStore";
import { toast } from "../../composables/useToast";

const sessionStore = useSessionStore();
const reservationStore = useReservationStore();
const loading = ref(false);
const qrSearchCode = ref("");
const search = ref("");
const page = ref(1);

const reservations = computed(() => reservationStore.allReservations);
const meta = computed(() => reservationStore.reservationMeta);

const fetchReservations = async () => {
  loading.value = true;
  try {
    await reservationStore.fetchAllReservations({ search: search.value, page: page.value, limit: 10 });
  } catch (err) {
    toast.error("Lỗi lấy danh sách đặt bàn: " + err.message);
  } finally {
    loading.value = false;
  }
};

const goPage = (p) => {
  if (p < 1 || p > meta.value.totalPages) return;
  page.value = p;
  fetchReservations();
};

const onSearch = () => {
  page.value = 1;
  fetchReservations();
};

const filteredReservations = computed(() => {
  if (!qrSearchCode.value) return reservations.value;
  const keyword = qrSearchCode.value.trim().toUpperCase();
  return reservations.value.filter((r) => r.reservationCode.includes(keyword) || r.customerPhone.includes(keyword));
});

const handleQRScanInput = () => {
  // Tự động trigger check-in nếu khớp chính xác 1 đơn
  const exact = filteredReservations.value.find((r) => r.reservationCode === qrSearchCode.value.trim().toUpperCase());
  if (exact && exact.status === "CONFIRMED") {
    handleCheckIn(exact);
  }
};

const handleConfirmDeposit = async (reservation) => {
  try {
    await reservationStore.confirmDeposit(reservation._id);
    toast.success(`Đã xác nhận nhận cọc ${reservation.depositAmount.toLocaleString('vi-VN')}đ cho ${reservation.reservationCode}`);
  } catch (err) {
    toast.error(err.message);
  }
};

const handleCheckIn = async (reservation) => {
  try {
    await sessionStore.checkInReservation(reservation._id, reservation.guestsCount, reservation.tables.map((t) => t._id));
    toast.success(`Check-in mở bàn thành công cho ${reservation.customerName}`);
    qrSearchCode.value = "";
    await fetchReservations();
  } catch (err) {
    toast.error("Lỗi Check-in: " + err.message);
  }
};

onMounted(() => {
  fetchReservations();
});
</script>
