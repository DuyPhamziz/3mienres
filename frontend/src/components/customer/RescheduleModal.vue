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
          <label class="form-label fw-semibold text-dark">
            {{ isEnglish ? 'New dining time' : 'Thời gian dùng bữa mới' }}
          </label>
          <input
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            type="datetime-local"
            class="form-control"
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
