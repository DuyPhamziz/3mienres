<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
    <TransitionGroup name="toast">
      <div
        v-for="t in toastState.list"
        :key="t.id"
        class="toast-box d-flex align-items-start gap-3 shadow-lg mb-2"
        :class="`toast-${t.type}`"
        role="alert"
      >
        <i :class="iconClass(t.type)" class="fs-4"></i>
        <div class="flex-grow-1">
          <strong class="d-block small">{{ t.title }}</strong>
          <span class="small opacity-75">{{ t.message }}</span>
        </div>
        <button type="button" class="btn-close btn-close-white ms-auto" @click="remove(t.id)"></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { toastState, remove } from "../../composables/useToast";

const iconClass = (type) => ({
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-circle-exclamation",
  info: "fa-solid fa-circle-info",
  warning: "fa-solid fa-triangle-exclamation",
})[type] || "fa-solid fa-circle-info";
</script>

<style scoped>
.toast-box {
  width: 320px;
  padding: 14px 16px;
  border-radius: 14px;
  color: #fff;
  backdrop-filter: blur(8px);
}
.toast-success {
  background: linear-gradient(135deg, #2e7d32, #43a047);
}
.toast-error {
  background: linear-gradient(135deg, #b71c1c, #d32f2f);
}
.toast-info {
  background: linear-gradient(135deg, #1565c0, #1e88e5);
}
.toast-warning {
  background: linear-gradient(135deg, #ef6c00, #fb8c00);
  color: #1e293b;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
