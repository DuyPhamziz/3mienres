<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-calendar-check me-1"></i> ĐẶT BÀN GIỮ CHỖ TỰ ĐỘNG
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">Đặt Bàn Trực Tuyến 3 Miền Cua</h1>
        <p class="text-muted small">Hệ thống sẽ tự động phân bổ bàn đơn hoặc cụm bàn ghép kề nhau tối ưu nhất cho đoàn của bạn</p>
      </div>

      <!-- Result Success Box with VietQR Deposit Code -->
      <div v-if="successData" class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5 text-center mb-5 border-success shadow-lg">
        <div class="badge bg-success px-3 py-2 rounded-pill fs-7 mb-3">
          <i class="fa-solid fa-circle-check me-1"></i> ĐẶT BÀN THÀNH CÔNG
        </div>
        <h2 class="brand-font text-success mb-2">Mã Đặt Bàn: {{ successData.data.reservation.reservationCode }}</h2>
        <p class="text-muted mb-4">Nhà hàng 3 Miền Cua đã ghi nhận và giữ chỗ cho Anh/Chị <strong>{{ successData.data.reservation.customerName }}</strong>!</p>

        <!-- Dynamic Combination Notice -->
        <div v-if="successData.isCombinedTable" class="alert alert-warning rounded-4 p-3 mb-4 text-start">
          <div class="d-flex align-items-center gap-3">
            <i class="fa-solid fa-puzzle-piece fs-3 text-warning"></i>
            <div>
              <strong class="d-block text-dark">Thông báo tự động ghép bàn:</strong>
              <small class="text-secondary">Vì đoàn {{ successData.data.reservation.guestsCount }} người khá đông, hệ thống đã tự động ghép cụm bàn kề nhau cho bạn!</small>
            </div>
          </div>
        </div>

        <!-- VietQR Deposit Payment Box -->
        <div v-if="successData.deposit && successData.deposit.amount > 0" class="p-4 bg-light rounded-4 border mb-4">
          <h5 class="fw-bold brand-font text-danger mb-2">
            <i class="fa-solid fa-qrcode me-2"></i>Thanh Toán Tiền Cọc Giữ Chỗ
          </h5>
          <p class="small text-muted mb-3">Vui lòng quét Mã QR bên dưới bằng ứng dụng Ngân hàng (MBBank, Vietcombank...) hoặc MoMo để nộp cọc <strong>{{ successData.deposit.amount.toLocaleString('vi-VN') }}đ</strong> (Số tiền cọc sẽ được tự động trừ trực tiếp vào hóa đơn khi bạn đến ăn).</p>
          
          <img
            v-if="successData.deposit.qrCodeUrl"
            :src="successData.deposit.qrCodeUrl"
            alt="Mã QR VietQR Đặt Cọc"
            class="img-fluid rounded-3 border shadow-sm mb-3"
            style="max-width: 260px;"
          />

          <div class="small text-secondary">
            <p class="mb-1"><strong>Ngân hàng:</strong> {{ successData.deposit.bankInfo.bankId }}</p>
            <p class="mb-1"><strong>Số tài khoản:</strong> {{ successData.deposit.bankInfo.accountNo }}</p>
            <p class="mb-0"><strong>Nội dung chuyển khoản:</strong> <span class="text-danger fw-bold">COC {{ successData.data.reservation.reservationCode }}</span></p>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3">
          <router-link :to="`/tra-cuu?code=${successData.data.reservation.reservationCode}`" class="btn btn-outline-danger rounded-pill px-4">
            Xem Trạng Thái Đơn
          </router-link>
          <button @click="resetForm" class="btn btn-primary-crab px-4">
            Đặt Thêm Đơn Khác
          </button>
        </div>
      </div>

      <!-- Booking Form -->
      <div v-else class="max-w-3xl mx-auto glass-card p-4 p-md-5 rounded-5 shadow-lg border-0">
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: User Info -->
          <div class="mb-4 pb-3 border-bottom">
            <h5 class="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <span class="badge bg-danger rounded-circle p-2 fs-8">1</span> Thông Tin Người Đặt Bàn
            </h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Họ và tên <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.customerName" type="text" class="form-control py-2.5" placeholder="Ví dụ: Nguyễn Văn A" required />
                  <i class="fa-solid fa-user"></i>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Số điện thoại <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.customerPhone" type="tel" class="form-control py-2.5" placeholder="Ví dụ: 0988776655" required />
                  <i class="fa-solid fa-phone"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Date & Guests -->
          <div class="mb-4 pb-3 border-bottom">
            <h5 class="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <span class="badge bg-danger rounded-circle p-2 fs-8">2</span> Thời Gian & Số Lượng Khách
            </h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Số lượng khách dùng bữa <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model.number="form.guestsCount" type="number" min="1" max="100" class="form-control py-2.5" required />
                  <i class="fa-solid fa-users"></i>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Thời gian bắt đầu <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.startAt" type="datetime-local" class="form-control py-2.5" required />
                  <i class="fa-solid fa-clock"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Special Notes -->
          <div class="mb-4">
            <h5 class="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <span class="badge bg-danger rounded-circle p-2 fs-8">3</span> Ghi Chú Đặc Biệt
            </h5>
            <textarea v-model="form.notes" class="form-control rounded-3 p-3" rows="3" placeholder="Ví dụ: Cần bàn gần cửa sổ, có ghế trẻ em, tiệc sinh nhật..."></textarea>
          </div>

          <div v-if="errorMsg" class="alert alert-danger mb-4 p-3 rounded-3 small d-flex align-items-center gap-2">
            <i class="fa-solid fa-circle-exclamation fs-5"></i>
            <div>{{ errorMsg }}</div>
          </div>

          <div class="text-center pt-2">
            <button type="submit" :disabled="reservationStore.loading" class="btn btn-primary-crab btn-lg px-5 py-3 w-100 shadow-sm fw-bold">
              <span v-if="reservationStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else><i class="fa-solid fa-paper-plane me-2"></i> ĐẶT BÀN GIỮ CHỖ NGAY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useReservationStore } from "../../stores/reservationStore";
import { useAuthStore } from "../../stores/authStore";

const reservationStore = useReservationStore();
const authStore = useAuthStore();

const errorMsg = ref("");
const successData = ref(null);

const form = reactive({
  customerName: authStore.user?.name || "",
  customerPhone: authStore.user?.phone || "",
  customerEmail: authStore.user?.email || "",
  guestsCount: 4,
  startAt: "",
  notes: "",
});

onMounted(() => {
  const nextHour = new Date();
  nextHour.setDate(nextHour.getDate() + 1);
  nextHour.setHours(19, 0, 0, 0);
  form.startAt = nextHour.toISOString().slice(0, 16);
});

const handleSubmit = async () => {
  errorMsg.value = "";
  try {
    const res = await reservationStore.createReservation({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      guestsCount: form.guestsCount,
      startAt: new Date(form.startAt).toISOString(),
      notes: form.notes,
    });
    successData.value = res;
  } catch (err) {
    errorMsg.value = err.message;
  }
};

const resetForm = () => {
  successData.value = null;
  form.notes = "";
};
</script>
