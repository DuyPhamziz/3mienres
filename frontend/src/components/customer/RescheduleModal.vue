<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">
            <i class="fa-solid fa-calendar-days me-2"></i>
            {{ isEnglish ? 'Reschedule Booking' : 'Dời Lịch Đặt Bàn' }}
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div class="p-3 bg-light rounded-4 border mb-3 small text-dark">
            <div class="d-flex align-items-center gap-2 fw-bold text-danger mb-1">
              <i class="fa-solid fa-info-circle"></i>
              {{ isEnglish ? 'Reschedule Notice:' : 'Quy trình dời lịch đặt bàn:' }}
            </div>
            <p class="text-muted fs-8 mb-0">
              {{ isEnglish ? 'Your reschedule request will be sent to the restaurant manager for confirmation and table reassignment.' : 'Quý khách chọn thời gian mới mong muốn. Yêu cầu sẽ được gửi tới Quản lý nhà hàng để kiểm tra bàn trống và xác nhận.' }}
            </p>
          </div>

          <label class="form-label fw-semibold text-dark fs-7">
            {{ isEnglish ? 'New dining time' : 'Thời gian dùng bữa mới' }} <span class="text-danger">*</span>
          </label>
          <input
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            type="datetime-local"
            class="form-control py-2.5 fs-7"
            required
          />
          <div v-if="error" class="alert alert-danger small mt-3 mb-0 rounded-3">
            {{ error }}
          </div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">
            {{ isEnglish ? 'Cancel' : 'Hủy' }}
          </button>
          <button @click="$emit('submit')" class="btn btn-primary-crab rounded-pill px-4 fw-bold">
            {{ isEnglish ? 'Confirm' : 'Xác Nhận' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
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

defineEmits(["update:modelValue", "close", "submit"]);
</script>
