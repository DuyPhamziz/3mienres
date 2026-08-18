<template>
  <div v-if="show" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm-custom">
      <div class="modal-content rounded-5 p-3 shadow-lg border-0">
        <div class="modal-body text-center p-3">
          <!-- Icon -->
          <div
            :class="[
              'rounded-circle d-inline-flex align-items-center justify-content-center mb-3',
              iconBgClass
            ]"
            style="width: 56px; height: 56px;"
          >
            <i :class="[icon, 'fs-3', iconTextClass]"></i>
          </div>

          <!-- Title -->
          <h5 class="fw-bold brand-font text-dark mb-2 fs-6">
            {{ title }}
          </h5>

          <!-- Message -->
          <p class="text-secondary small mb-4 leading-relaxed" style="font-size: 0.84rem;">
            {{ message }}
          </p>

          <!-- Buttons -->
          <div class="d-flex justify-content-center gap-2">
            <button
              @click="$emit('cancel')"
              type="button"
              class="btn btn-light btn-sm rounded-pill px-4 fw-semibold fs-8"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              type="button"
              :class="['btn btn-sm rounded-pill px-4 fw-bold fs-8 shadow-sm', confirmButtonClass]"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Xác nhận hành động",
  },
  message: {
    type: String,
    default: "Bạn có chắc chắn muốn thực hiện hành động này không?",
  },
  confirmText: {
    type: String,
    default: "Xác nhận",
  },
  cancelText: {
    type: String,
    default: "Hủy",
  },
  confirmVariant: {
    type: String,
    default: "danger", // 'danger' | 'warning' | 'primary' | 'success' | 'dark'
  },
  icon: {
    type: String,
    default: "fa-solid fa-triangle-exclamation",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["confirm", "cancel"]);

const iconBgClass = computed(() => {
  switch (props.confirmVariant) {
    case "danger": return "bg-danger bg-opacity-10";
    case "warning": return "bg-warning bg-opacity-15";
    case "success": return "bg-success bg-opacity-10";
    case "dark": return "bg-dark bg-opacity-10";
    default: return "bg-primary bg-opacity-10";
  }
});

const iconTextClass = computed(() => {
  switch (props.confirmVariant) {
    case "danger": return "text-danger";
    case "warning": return "text-warning";
    case "success": return "text-success";
    case "dark": return "text-dark";
    default: return "text-primary";
  }
});

const confirmButtonClass = computed(() => {
  switch (props.confirmVariant) {
    case "danger": return "btn-danger";
    case "warning": return "btn-warning text-dark";
    case "success": return "btn-success";
    case "dark": return "btn-dark";
    default: return "btn-primary";
  }
});
</script>

<style scoped>
.modal-sm-custom {
  max-width: 400px;
}
</style>
