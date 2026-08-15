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

      <div class="col-md-12">
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
