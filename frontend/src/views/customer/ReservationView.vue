<template>
  <div class="reservation-page py-5">
    <div class="container">
      <div class="text-center mx-auto mb-5 reservation-intro">
        <span class="text-danger fw-bold text-uppercase">Đặt chỗ trực tuyến</span>
        <h1 class="display-5 fw-bold brand-font">Đặt bàn giữ chỗ tự động</h1>
        <p class="text-muted">
          Chọn thời gian và số khách, hệ thống sẽ kiểm tra bàn đơn hoặc cụm bàn ghép phù hợp trước khi xác nhận.
        </p>
      </div>

      <div v-if="successData" class="reservation-success mx-auto">
        <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
        <span class="badge bg-success px-3 py-2 rounded-pill mb-3">Đặt bàn thành công</span>
        <h2 class="brand-font text-success mb-2">Mã đặt bàn: {{ successData.data.reservation.reservationCode }}</h2>
        <p class="text-muted mb-4">
          Nhà hàng đã ghi nhận và giữ chỗ cho Anh/Chị
          <strong>{{ successData.data.reservation.customerName }}</strong>.
        </p>

        <div v-if="successData.isCombinedTable" class="alert alert-warning text-start">
          <i class="fa-solid fa-puzzle-piece me-2"></i>
          Hệ thống đã tự động ghép cụm bàn kề nhau cho đoàn {{ successData.data.reservation.guestsCount }} khách.
        </div>

        <div v-if="successData.deposit && successData.deposit.amount > 0" class="deposit-box">
          <h5 class="fw-bold text-danger mb-2">
            <i class="fa-solid fa-qrcode me-2"></i>Thanh toán tiền cọc giữ chỗ
          </h5>
          <p class="small text-muted mb-3">
            Quét mã để cọc {{ successData.deposit.amount.toLocaleString("vi-VN") }}đ. Số tiền này sẽ được trừ vào hóa đơn.
          </p>
          <img
            v-if="successData.deposit.qrCodeUrl"
            :src="successData.deposit.qrCodeUrl"
            alt="Mã QR VietQR đặt cọc"
            class="img-fluid rounded-3 border shadow-sm mb-3"
            style="max-width: 280px;"
          />
          <div class="small text-secondary">
            <p class="mb-1"><strong>Ngân hàng:</strong> {{ successData.deposit.bankInfo.bankId }}</p>
            <p class="mb-1"><strong>Số tài khoản:</strong> {{ successData.deposit.bankInfo.accountNo }}</p>
            <p class="mb-0">
              <strong>Nội dung:</strong>
              <span class="text-danger fw-bold">COC {{ successData.data.reservation.reservationCode }}</span>
            </p>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link :to="`/tra-cuu?code=${successData.data.reservation.reservationCode}`" class="btn btn-outline-danger px-4">
            Xem trạng thái đơn
          </router-link>
          <button @click="resetForm" class="btn btn-primary-crab px-4">Đặt thêm đơn khác</button>
        </div>
      </div>

      <div v-else class="reservation-shell mx-auto">
        <form @submit.prevent="handleSubmit" class="reservation-form">
          <div class="form-section">
            <div class="step-label">1</div>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Họ và tên <span class="text-danger">*</span></label>
                <input v-model="form.customerName" type="text" class="form-control py-2" placeholder="Nguyễn Văn A" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Số điện thoại <span class="text-danger">*</span></label>
                <input v-model="form.customerPhone" type="tel" class="form-control py-2" placeholder="0988776655" required />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Email</label>
                <input v-model="form.customerEmail" type="email" class="form-control py-2" placeholder="email@example.com" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Số lượng khách <span class="text-danger">*</span></label>
                <input v-model.number="form.guestsCount" type="number" min="1" max="100" class="form-control py-2" required />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="step-label">2</div>
            <div class="row g-3">
              <div class="col-md-7">
                <label class="form-label fw-semibold">Thời gian dùng bữa <span class="text-danger">*</span></label>
                <input v-model="form.startAt" type="datetime-local" class="form-control py-2" required />
              </div>
              <div class="col-md-5">
                <label class="form-label fw-semibold">Thời lượng dự kiến</label>
                <select v-model.number="durationMinutes" class="form-select py-2">
                  <option :value="90">90 phút</option>
                  <option :value="120">120 phút</option>
                  <option :value="180">180 phút</option>
                </select>
              </div>
              <div class="col-12">
                <button type="button" @click="checkTables" :disabled="checkingAvailability" class="btn btn-outline-danger w-100">
                  <span v-if="checkingAvailability" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fa-solid fa-magnifying-glass me-2"></i>
                  Kiểm tra bàn trống
                </button>
              </div>
            </div>
          </div>

          <div v-if="availability" class="availability-panel">
            <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
              <div>
                <h5 class="fw-bold mb-1">Gợi ý chỗ ngồi</h5>
                <p class="text-muted small mb-0">{{ availability.totalAvailableCount }} bàn đang khả dụng trong khung giờ đã chọn.</p>
              </div>
              <span :class="['availability-badge', canReserve ? 'ok' : 'danger']">
                {{ canReserve ? 'Có thể đặt' : 'Hết bàn phù hợp' }}
              </span>
            </div>

            <div v-if="bestSingleTables.length" class="suggestion-grid">
              <article v-for="table in bestSingleTables" :key="table._id" class="suggestion-card">
                <i class="fa-solid fa-chair"></i>
                <div>
                  <strong>Bàn {{ table.tableNumber }}</strong>
                  <span>{{ table.capacity }} chỗ · {{ table.area?.name || 'Khu vực chung' }}</span>
                </div>
              </article>
            </div>

            <div v-else-if="bestCombinations.length" class="suggestion-grid">
              <article v-for="combo in bestCombinations" :key="combo.tables.map((table) => table._id).join('-')" class="suggestion-card combo">
                <i class="fa-solid fa-puzzle-piece"></i>
                <div>
                  <strong>{{ combo.tables.map((table) => table.tableNumber).join(' + ') }}</strong>
                  <span>{{ combo.totalCapacity }} chỗ · cụm bàn ghép</span>
                </div>
              </article>
            </div>

            <p v-else class="text-danger fw-semibold small mb-0">
              Khung giờ này chưa có bàn đủ chỗ. Bạn thử giảm số khách hoặc chọn giờ khác nhé.
            </p>
          </div>

          <div class="form-section">
            <div class="step-label">3</div>
            <label class="form-label fw-semibold">Ghi chú đặc biệt</label>
            <textarea v-model="form.notes" class="form-control" rows="3" placeholder="Ví dụ: cần bàn gần cửa sổ, có trẻ em, sinh nhật..."></textarea>
          </div>

          <div v-if="errorMsg" class="alert alert-danger small mb-0">
            <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMsg }}
          </div>

          <button type="submit" :disabled="reservationStore.loading || !canReserve" class="btn btn-primary-crab btn-lg w-100 py-3">
            <span v-if="reservationStore.loading" class="spinner-border spinner-border-sm me-2"></span>
            <span v-else><i class="fa-solid fa-paper-plane me-2"></i>Đặt bàn ngay</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useReservationStore } from "../../stores/reservationStore";
import { useTableStore } from "../../stores/tableStore";
import { useAuthStore } from "../../stores/authStore";

const reservationStore = useReservationStore();
const tableStore = useTableStore();
const authStore = useAuthStore();

const errorMsg = ref("");
const successData = ref(null);
const availability = ref(null);
const checkingAvailability = ref(false);
const durationMinutes = ref(120);

const form = reactive({
  customerName: authStore.user?.name || "",
  customerPhone: authStore.user?.phone || "",
  customerEmail: authStore.user?.email || "",
  guestsCount: 4,
  startAt: "",
  notes: "",
});

const endAtIso = computed(() => {
  if (!form.startAt) return "";
  const start = new Date(form.startAt);
  return new Date(start.getTime() + durationMinutes.value * 60000).toISOString();
});

const bestSingleTables = computed(() => availability.value?.singleMatches?.slice(0, 3) || []);
const bestCombinations = computed(() => availability.value?.suggestedCombinations?.slice(0, 3) || []);
const canReserve = computed(() => bestSingleTables.value.length > 0 || bestCombinations.value.length > 0);

let checkTimer;
watch(
  () => [form.startAt, form.guestsCount, durationMinutes.value],
  () => {
    availability.value = null;
    clearTimeout(checkTimer);
    if (form.startAt && form.guestsCount > 0) {
      checkTimer = setTimeout(checkTables, 500);
    }
  }
);

onMounted(() => {
  const nextDinner = new Date();
  nextDinner.setDate(nextDinner.getDate() + 1);
  nextDinner.setHours(19, 0, 0, 0);
  form.startAt = nextDinner.toISOString().slice(0, 16);
});

const checkTables = async () => {
  errorMsg.value = "";
  if (!form.startAt || !form.guestsCount) return;

  checkingAvailability.value = true;
  try {
    availability.value = await tableStore.checkAvailability(
      new Date(form.startAt).toISOString(),
      endAtIso.value,
      form.guestsCount
    );
  } catch (err) {
    availability.value = null;
    errorMsg.value = err.message;
  } finally {
    checkingAvailability.value = false;
  }
};

const handleSubmit = async () => {
  errorMsg.value = "";
  if (!availability.value) await checkTables();
  if (!canReserve.value) {
    errorMsg.value = "Vui lòng chọn khung giờ còn bàn phù hợp trước khi đặt.";
    return;
  }

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
  availability.value = null;
  form.notes = "";
};
</script>
