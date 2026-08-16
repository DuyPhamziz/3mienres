<template>
  <div class="wizard-panel">
    <h4 class="fw-bold text-danger brand-font mb-4 d-flex align-items-center gap-2">
      <i class="fa-solid fa-address-card"></i>
      {{ isEnglish ? 'Step 1: Customer Contact Information' : 'Bước 1: Thông Tin Người Đặt Bàn' }}
    </h4>

    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <label class="form-label fw-semibold fs-7 text-dark">
          {{ isEnglish ? 'Full Name' : 'Họ và tên người đặt' }} <span class="text-danger">*</span>
        </label>
        <div class="form-control-icon">
          <input
            v-model="form.customerName"
            type="text"
            class="form-control py-3 fs-7"
            placeholder="Ví dụ: Nguyễn Văn A"
            required
          />
          <i class="fa-solid fa-user"></i>
        </div>
      </div>

      <div class="col-md-6">
        <label class="form-label fw-semibold fs-7 text-dark">
          {{ isEnglish ? 'Phone Number' : 'Số điện thoại liên hệ' }} <span class="text-danger">*</span>
        </label>
        <div class="form-control-icon">
          <input
            v-model="form.customerPhone"
            type="tel"
            class="form-control py-3 fs-7"
            placeholder="Ví dụ: 0988776655"
            required
          />
          <i class="fa-solid fa-phone"></i>
        </div>
      </div>

      <div class="col-md-6">
        <label class="form-label fw-semibold fs-7 text-dark">
          {{ isEnglish ? 'Number of Guests' : 'Số lượng khách (Số người)' }} <span class="text-danger">*</span>
        </label>
        <div class="input-group">
          <button
            type="button"
            class="btn btn-outline-secondary px-3 py-2.5"
            @click="form.guestsCount > 1 ? form.guestsCount-- : null"
          >
            <i class="fa-solid fa-minus"></i>
          </button>
          <input
            v-model.number="form.guestsCount"
            type="number"
            min="1"
            max="100"
            class="form-control text-center fw-bold fs-6 py-2.5"
            placeholder="Số người"
            required
          />
          <button
            type="button"
            class="btn btn-outline-secondary px-3 py-2.5"
            @click="form.guestsCount++"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <small class="text-muted fs-8 mt-1 d-block">
          {{ isEnglish ? 'Specify how many guests will dine at the restaurant.' : 'Nhập chính xác số người để nhà hàng chuẩn bị không gian chu đáo.' }}
        </small>
      </div>

      <div class="col-md-6">
        <label class="form-label fw-semibold fs-7 text-dark">
          {{ isEnglish ? 'Email (Optional)' : 'Địa chỉ Email (Nhận mã vé đặt bàn)' }}
        </label>
        <div class="form-control-icon">
          <input
            v-model="form.customerEmail"
            type="email"
            class="form-control py-3 fs-7"
            placeholder="email@example.com"
          />
          <i class="fa-solid fa-envelope"></i>
        </div>
        <small class="text-muted fs-8 mt-1 d-block">
          {{ isEnglish ? 'Used to receive booking confirmation card.' : 'Dùng để gửi thẻ vé check-in và hóa đơn điện tử.' }}
        </small>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger py-2 px-3 rounded-3 small mb-4">
      <i class="fa-solid fa-circle-exclamation me-1"></i>{{ error }}
    </div>

    <div class="d-flex justify-content-end pt-3">
      <button type="button" @click="$emit('next')" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm">
        {{ isEnglish ? 'Next: Select Table' : 'Tiếp Theo: Chọn Thời Gian & Bàn' }}
        <i class="fa-solid fa-arrow-right ms-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["next"]);
</script>

<style scoped>
.form-control-icon {
  position: relative;
}
.form-control-icon i {
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  color: #a0aec0;
}
</style>
