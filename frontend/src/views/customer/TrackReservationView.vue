<template>
  <div class="py-5">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="text-danger fw-bold text-uppercase tracking-wider">Tra cứu đơn</span>
        <h1 class="display-5 fw-bold brand-font">Tra Cứu Trạng Thái Đặt Bàn</h1>
        <p class="text-muted">Nhập Mã đặt bàn (RES-XXXXXX) và Số điện thoại để kiểm tra trạng thái</p>
      </div>

      <div class="max-w-xl mx-auto glass-card p-4 rounded-5 mb-5">
        <form @submit.prevent="handleSearch" class="d-flex flex-column flex-md-row gap-2">
          <input
            v-model="searchCode"
            type="text"
            class="form-control py-2 rounded-3 text-uppercase fw-bold"
            placeholder="Mã đơn (Ví dụ: RES-102938)"
            required
          />
          <input
            v-model="searchPhone"
            type="tel"
            class="form-control py-2 rounded-3"
            placeholder="Số điện thoại"
          />
          <button type="submit" :disabled="reservationStore.loading" class="btn btn-primary-crab px-4 text-nowrap">
            <i class="fa-solid fa-magnifying-glass me-1"></i> Tra Cứu
          </button>
        </form>
        <div v-if="errorMsg" class="alert alert-danger mt-3 mb-0 small rounded-3">
          {{ errorMsg }}
        </div>
      </div>

      <!-- Result Card -->
      <div v-if="reservation" class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5">
        <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
          <div>
            <span class="text-muted small d-block">Mã đơn đặt bàn</span>
            <h3 class="brand-font fw-bold text-danger mb-0">{{ reservation.reservationCode }}</h3>
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

        <div class="row g-3 mb-4">
          <div class="col-6">
            <span class="text-muted small d-block">Khách hàng</span>
            <strong class="d-block text-dark">{{ reservation.customerName }}</strong>
          </div>
          <div class="col-6">
            <span class="text-muted small d-block">Số điện thoại</span>
            <strong class="d-block text-dark">{{ reservation.customerPhone }}</strong>
          </div>
          <div class="col-6">
            <span class="text-muted small d-block">Số lượng khách</span>
            <strong class="d-block text-dark">{{ reservation.guestsCount }} người</strong>
          </div>
          <div class="col-6">
            <span class="text-muted small d-block">Thời gian bắt đầu</span>
            <strong class="d-block text-danger">{{ new Date(reservation.startAt).toLocaleString('vi-VN') }}</strong>
          </div>
        </div>

        <!-- Pre-assigned Tables -->
        <div class="p-3 bg-light rounded-4 mb-4">
          <h6 class="fw-bold brand-font text-dark mb-2">Bàn ăn dự kiến giữ chỗ:</h6>
          <div v-if="reservation.tables && reservation.tables.length > 0" class="d-flex flex-wrap gap-2">
            <span v-for="table in reservation.tables" :key="table._id" class="badge bg-danger px-3 py-2 rounded-pill fs-7">
              Bàn {{ table.tableNumber }} ({{ table.capacity }} chỗ)
            </span>
          </div>
          <span v-else class="text-muted small">Đang xếp bàn...</span>
        </div>

        <!-- Deposit VietQR QR Code if Deposit Required -->
        <div v-if="depositInfo && depositInfo.amount > 0" class="p-4 bg-white rounded-4 border text-center mb-4">
          <h6 class="fw-bold text-danger mb-2">Thanh Toán Tiền Cọc: {{ depositInfo.amount.toLocaleString('vi-VN') }}đ</h6>
          <img
            v-if="depositInfo.qrCodeUrl"
            :src="depositInfo.qrCodeUrl"
            alt="Mã QR VietQR Cọc"
            class="img-fluid rounded-3 border mb-2"
            style="max-width: 240px;"
          />
          <p class="small text-muted mb-0">Quét mã QR bằng app ngân hàng để chuyển khoản nộp cọc giữ chỗ.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useReservationStore } from "../../stores/reservationStore";

const route = useRoute();
const reservationStore = useReservationStore();

const searchCode = ref(route.query.code || "");
const searchPhone = ref("");
const errorMsg = ref("");
const reservation = ref(null);
const depositInfo = ref(null);

const handleSearch = async () => {
  errorMsg.value = "";
  try {
    const res = await reservationStore.trackReservation(searchCode.value, searchPhone.value);
    reservation.value = res.data.reservation;
    depositInfo.value = res.deposit;
  } catch (err) {
    errorMsg.value = err.message;
    reservation.value = null;
  }
};

onMounted(() => {
  if (searchCode.value) handleSearch();
});
</script>
