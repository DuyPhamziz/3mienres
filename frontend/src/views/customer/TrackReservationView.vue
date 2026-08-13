<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-ticket me-1"></i> QUẢN LÝ VÉ GIỮ CHỖ & MÃ QR CHECK-IN
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">Tra Cứu Vé Đặt Bàn Cá Nhân</h1>
        <p class="text-muted small">Chỉ có chính chủ tài khoản người đặt hoặc nhân viên nhà hàng mới có quyền xem vé này</p>
      </div>

      <!-- Yêu cầu đăng nhập nếu chưa đăng nhập -->
      <div v-if="!authStore.isAuthenticated" class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center shadow-lg bg-white border-danger border-opacity-25 mb-5">
        <i class="fa-solid fa-user-shield display-4 text-danger mb-3 d-block"></i>
        <h3 class="fw-bold text-dark mb-2">Vui Lòng Đăng Nhập Để Tra Cứu</h3>
        <p class="text-muted small mb-4">Để bảo mật thông tin đặt bàn cá nhân, vui lòng đăng nhập tài khoản chính chủ của bạn.</p>
        <router-link to="/login?redirect=/tra-cuu" class="btn btn-primary-crab px-4 py-2.5 fw-bold">
          <i class="fa-solid fa-right-to-bracket me-2"></i> Đăng Nhập Ngay
        </router-link>
      </div>

      <template v-else>
        <!-- Search Box -->
        <div class="max-w-xl mx-auto glass-card p-4 rounded-5 mb-5 shadow-sm bg-white">
          <form @submit.prevent="handleSearch" class="d-flex flex-column flex-md-row gap-2">
            <div class="form-control-icon flex-grow-1">
              <input
                v-model="searchCode"
                type="text"
                class="form-control py-2.5 text-uppercase fw-bold"
                placeholder="Mã đơn (Ví dụ: RES-393861)"
                required
              />
              <i class="fa-solid fa-ticket"></i>
            </div>
            <button type="submit" :disabled="reservationStore.loading" class="btn btn-primary-crab px-4 text-nowrap fw-bold">
              <i class="fa-solid fa-magnifying-glass me-1"></i> Tra Cứu Vé
            </button>
          </form>
          <div v-if="errorMsg" class="alert alert-danger mt-3 mb-0 small rounded-3 d-flex align-items-center gap-2">
            <i class="fa-solid fa-circle-exclamation fs-5"></i>
            <div>{{ errorMsg }}</div>
          </div>
        </div>

        <!-- Result Ticket Pass Card -->
        <div v-if="reservation" class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5 shadow-lg bg-white border-top border-danger border-5">
          <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
            <div class="d-flex align-items-center gap-2">
              <div class="p-2 bg-danger bg-opacity-10 text-danger rounded-3">
                <i class="fa-solid fa-utensils fs-4"></i>
              </div>
              <div>
                <strong class="d-block text-dark brand-font">NHÀ HÀNG 3 MIỀN CUA</strong>
                <small class="text-muted fs-8">PHIẾU GIỮ CHỖ & MÃ QR CHECK-IN</small>
              </div>
            </div>
            <span
              :class="[
                'badge px-3 py-2 rounded-pill fs-7',
                reservation.status === 'CONFIRMED' ? 'bg-success' : reservation.status === 'ARRIVED' ? 'bg-primary' : 'bg-secondary'
              ]"
            >
              {{ reservation.status === 'CONFIRMED' ? 'ĐÃ GIỮ CHỖ' : reservation.status === 'ARRIVED' ? 'ĐÃ CHECK-IN' : reservation.status }}
            </span>
          </div>

          <!-- MÃ QR CHECK-IN TỐC ĐỘ TẠI QUẦY -->
          <div class="p-4 bg-light rounded-4 border text-center mb-4">
            <span class="badge bg-danger text-white px-3 py-1.5 rounded-pill mb-2 fw-bold fs-8">
              <i class="fa-solid fa-qrcode me-1"></i> MÃ QR CHECK-IN VÀO BÀN
            </span>
            <h4 class="brand-font fw-bold text-danger mb-2">Mã Đơn: {{ reservation.reservationCode }}</h4>
            
            <img
              v-if="checkInQrUrl"
              :src="checkInQrUrl"
              alt="Mã QR Check-in Quầy POS"
              class="img-fluid rounded-3 border bg-white p-2 shadow-sm mb-2"
              style="max-width: 220px;"
            />

            <p class="small text-dark mb-0 fw-semibold">
              <i class="fa-solid fa-bolt text-warning me-1"></i> Đưa mã QR này cho Thu ngân quét để tự động xác nhận vào bàn trong 3 giây!
            </p>
          </div>

          <!-- Customer & Booking Details Grid -->
          <div class="row g-3 mb-4 p-3 bg-light rounded-4 border">
            <div class="col-6">
              <span class="text-muted small d-block">Họ và tên khách hàng</span>
              <strong class="d-block text-dark fs-6">{{ reservation.customerName }}</strong>
            </div>
            <div class="col-6">
              <span class="text-muted small d-block">Số điện thoại liên hệ</span>
              <strong class="d-block text-dark fs-6">{{ reservation.customerPhone }}</strong>
            </div>
            <div class="col-6">
              <span class="text-muted small d-block">Số lượng khách</span>
              <strong class="d-block text-dark fs-6">{{ reservation.guestsCount }} người</strong>
            </div>
            <div class="col-6">
              <span class="text-muted small d-block">Thời gian dùng bữa</span>
              <strong class="d-block text-danger fs-6">{{ new Date(reservation.startAt).toLocaleString('vi-VN') }}</strong>
            </div>
          </div>

          <!-- Pre-assigned Tables -->
          <div class="p-3 bg-white rounded-4 border mb-4">
            <h6 class="fw-bold brand-font text-dark mb-2">
              <i class="fa-solid fa-chair text-danger me-1"></i> Vị trí bàn giữ chỗ:
            </h6>
            <div v-if="reservation.tables && reservation.tables.length > 0" class="d-flex flex-wrap gap-2">
              <span v-for="table in reservation.tables" :key="table._id" class="badge bg-danger px-3 py-2 rounded-pill fs-7">
                Bàn {{ table.tableNumber }} ({{ table.capacity }} chỗ)
              </span>
            </div>
            <span v-else class="text-muted small">Đang tự động gán bàn...</span>
          </div>

          <!-- Deposit VietQR QR Code if Deposit Required -->
          <div v-if="depositInfo && depositInfo.amount > 0" class="p-4 bg-white rounded-4 border text-center mb-4">
            <h6 class="fw-bold text-danger mb-2">Thanh Toán Tiền Cọc: {{ depositInfo.amount.toLocaleString('vi-VN') }}đ</h6>
            <img
              v-if="depositInfo.qrCodeUrl"
              :src="depositInfo.qrCodeUrl"
              alt="Mã QR VietQR Cọc"
              class="img-fluid rounded-3 border mb-2"
              style="max-width: 220px;"
            />
            <p class="small text-muted mb-0">Nộp cọc qua VietQR để nhà hàng giữ chỗ và chuẩn bị món pre-order.</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useReservationStore } from "../../stores/reservationStore";
import { useAuthStore } from "../../stores/authStore";

const route = useRoute();
const reservationStore = useReservationStore();
const authStore = useAuthStore();

const searchCode = ref(route.query.code || "");
const errorMsg = ref("");
const reservation = ref(null);
const depositInfo = ref(null);
const checkInQrUrl = ref("");

const handleSearch = async () => {
  errorMsg.value = "";
  try {
    const res = await reservationStore.trackReservation(searchCode.value, authStore.user?.phone);
    reservation.value = res.data.reservation;
    depositInfo.value = res.deposit;
    checkInQrUrl.value = res.checkInQrUrl;
  } catch (err) {
    errorMsg.value = err.message;
    reservation.value = null;
  }
};

onMounted(() => {
  if (searchCode.value && authStore.isAuthenticated) handleSearch();
});
</script>
