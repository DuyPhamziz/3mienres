<template>
  <div v-if="reservation" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-dialog-custom">
      <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
        <!-- Header -->
        <div class="modal-header border-0 pb-1">
          <div>
            <h5 class="modal-title fw-bold brand-font text-warning text-dark mb-0">
              <i class="fa-solid fa-money-bill-transfer text-danger me-2"></i>Xác Nhận Thu Tiền Cọc
            </h5>
            <small class="text-muted fs-8">
              Đơn <strong>{{ reservation.reservationCode }}</strong> - {{ reservation.customerName }}
            </small>
          </div>
          <button @click="$emit('close')" type="button" class="btn-close" :disabled="loading"></button>
        </div>

        <div class="modal-body py-3">
          <!-- Reservation Summary Box -->
          <div class="p-3 bg-light rounded-4 border mb-3">
            <div class="d-flex justify-content-between small text-secondary mb-1">
              <span>Khách hàng:</span>
              <strong class="text-dark">{{ reservation.customerName }}</strong>
            </div>
            <div class="d-flex justify-content-between small text-secondary mb-1">
              <span>Số điện thoại:</span>
              <strong class="text-dark">{{ reservation.customerPhone }}</strong>
            </div>
            <div class="d-flex justify-content-between small text-secondary mb-1">
              <span>Thời gian đặt:</span>
              <span class="text-dark">{{ formatFullTime(reservation.startAt) }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
              <span class="fw-bold text-dark fs-7">Số tiền cọc cần thu:</span>
              <strong class="text-danger fs-5">{{ reservation.depositAmount?.toLocaleString('vi-VN') }}đ</strong>
            </div>
          </div>

          <!-- Select Payment Method: Cash or Transfer -->
          <div class="mb-3">
            <label class="form-label fw-bold fs-7 text-dark mb-2">
              <i class="fa-solid fa-wallet text-danger me-1"></i>Chọn phương thức thu tiền cọc:
            </label>
            <div class="row g-2">
              <div class="col-6">
                <label
                  :class="[
                    'p-3 rounded-4 border text-center d-block cursor-pointer transition-all h-100',
                    selectedMethod === 'CASH' ? 'border-danger bg-danger bg-opacity-10 shadow-sm' : 'bg-white'
                  ]"
                >
                  <input
                    type="radio"
                    value="CASH"
                    v-model="selectedMethod"
                    class="d-none"
                    :disabled="loading"
                  />
                  <div class="fs-3 mb-1 text-success"><i class="fa-solid fa-money-bill-1-wave"></i></div>
                  <strong class="d-block fs-8 text-dark">Tiền Mặt Tại Quầy</strong>
                  <small class="text-muted fs-9 d-block">Thu tiền mặt trực tiếp</small>
                </label>
              </div>

              <div class="col-6">
                <label
                  :class="[
                    'p-3 rounded-4 border text-center d-block cursor-pointer transition-all h-100',
                    selectedMethod === 'TRANSFER' ? 'border-danger bg-danger bg-opacity-10 shadow-sm' : 'bg-white'
                  ]"
                >
                  <input
                    type="radio"
                    value="TRANSFER"
                    v-model="selectedMethod"
                    class="d-none"
                    :disabled="loading"
                  />
                  <div class="fs-3 mb-1 text-primary"><i class="fa-solid fa-qrcode"></i></div>
                  <strong class="d-block fs-8 text-dark">Chuyển Khoản VietQR</strong>
                  <small class="text-muted fs-9 d-block">Đã nhận qua tài khoản</small>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer border-0 pt-1">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4" :disabled="loading">
            Hủy
          </button>
          <button
            @click="handleSubmit"
            class="btn btn-warning rounded-pill px-4 fw-bold text-dark shadow-sm"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="fa-solid fa-circle-check me-1"></i>
            Xác Nhận Đã Thu Cọc ({{ selectedMethod === 'CASH' ? 'Tiền Mặt' : 'Chuyển Khoản' }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  reservation: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const selectedMethod = ref("CASH");

const formatFullTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN')}`;
};

const handleSubmit = () => {
  emit("submit", {
    reservationId: props.reservation._id,
    paymentMethod: selectedMethod.value,
  });
};
</script>

<style scoped>
.modal-dialog-custom {
  max-width: 480px;
}
.transition-all {
  transition: all 0.2s ease;
}
</style>
