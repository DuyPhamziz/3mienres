<template>
  <div class="py-5">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="text-danger fw-bold text-uppercase tracking-wider">Đặt chỗ trực tuyến</span>
        <h1 class="display-5 fw-bold brand-font">Đặt Bàn Giữ Chỗ Tự Động</h1>
        <p class="text-muted">Hệ thống sẽ tự động phân bổ bàn đơn hoặc cụm bàn ghép kề nhau tối ưu cho đoàn của bạn</p>
      </div>

      <!-- Result Success Box with VietQR Deposit Code -->
      <div v-if="successData" class="max-w-2xl mx-auto glass-card p-4 rounded-5 text-center mb-5 border-success">
        <div class="badge bg-success px-3 py-2 rounded-pill fs-7 mb-3">
          <i class="fa-solid fa-circle-check me-1"></i> ĐẶT BÀN THÀNH CÔNG
        </div>
        <h2 class="brand-font text-success mb-2">Mã Đặt Bàn: {{ successData.data.reservation.reservationCode }}</h2>
        <p class="text-muted mb-4">Nhà hàng 3 Miền Cua đã ghi nhận và giữ chỗ cho Anh/Chị <strong>{{ successData.data.reservation.customerName }}</strong>!</p>

        <!-- Dynamic Combination Notice -->
        <div v-if="successData.isCombinedTable" class="alert alert-warning rounded-4 p-3 mb-4 text-start">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-puzzle-piece fs-4 text-warning"></i>
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
            style="max-width: 280px;"
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
      <div v-else class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Họ và tên người đặt <span class="text-danger">*</span></label>
              <input v-model="form.customerName" type="text" class="form-control py-2 rounded-3" placeholder="Ví dụ: Nguyễn Văn A" required />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Số điện thoại liên hệ <span class="text-danger">*</span></label>
              <input v-model="form.customerPhone" type="tel" class="form-control py-2 rounded-3" placeholder="Ví dụ: 0988776655" required />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Số lượng khách <span class="text-danger">*</span></label>
              <input v-model.number="form.guestsCount" type="number" min="1" max="100" class="form-control py-2 rounded-3" placeholder="Số lượng người" required />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Thời gian dùng bữa <span class="text-danger">*</span></label>
              <input v-model="form.startAt" type="datetime-local" class="form-control py-2 rounded-3" required />
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Ghi chú đặc biệt</label>
              <textarea v-model="form.notes" class="form-control rounded-3" rows="3" placeholder="Ví dụ: Cần bàn gần cửa sổ, có trẻ em..."></textarea>
            </div>
          </div>

          <div v-if="errorMsg" class="alert alert-danger mt-3 mb-0 rounded-3 small">
            <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMsg }}
          </div>

          <div class="mt-4 text-center">
            <button type="submit" :disabled="reservationStore.loading" class="btn btn-primary-crab btn-lg px-5 py-3 w-100">
              <span v-if="reservationStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else><i class="fa-solid fa-paper-plane me-2"></i> ĐẶT BÀN NGAY BÂY GIỜ</span>
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
  // Mặc định thời gian là 19h ngày hôm nay hoặc hôm sau
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
