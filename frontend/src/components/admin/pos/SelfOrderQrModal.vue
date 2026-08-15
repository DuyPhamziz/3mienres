<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">
            <i class="fa-solid fa-qrcode me-2"></i>QR Gọi Món Tại Bàn
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body text-center">
          <p class="small text-muted">Đưa mã QR này cho khách quét để tự gọi món (không cần đăng nhập):</p>
          <img
            v-if="qrUrl"
            :src="qrUrl"
            class="img-fluid rounded-3 border p-2 bg-white mb-2"
            style="max-width: 240px;"
            alt="QR gọi món"
          />
          <div class="small text-secondary bg-light p-2 rounded-3 border text-break">
            {{ targetUrl }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  qrUrl: {
    type: String,
    default: "",
  },
  targetUrl: {
    type: String,
    default: "",
  },
});

defineEmits(["close"]);
</script>
