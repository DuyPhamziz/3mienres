<template>
  <div
    :class="[
      'glass-card p-4 rounded-4 position-relative border-2 h-100 d-flex flex-column',
      session.isOverTime ? 'border-warning bg-warning bg-opacity-10' : 'border-danger'
    ]"
  >
    <!-- Overtime Badge -->
    <span v-if="session.isOverTime" class="position-absolute top-0 end-0 m-3 badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
      <i class="fa-solid fa-triangle-exclamation me-1"></i> QUÁ GIỜ ({{ session.elapsedMinutes }} phút)
    </span>
    <span v-else class="position-absolute top-0 end-0 m-3 badge bg-danger rounded-pill px-3 py-2">
      ĐANG ĂN ({{ session.elapsedMinutes }} phút)
    </span>

    <h4 class="fw-bold brand-font mb-1 text-danger">
      Bàn {{ session.tables.map(t => t.tableNumber).join(' + ') }}
    </h4>
    <p class="text-muted small mb-2">Mã lượt dùng bữa: <strong>{{ session.sessionCode }}</strong> ({{ session.type }})</p>

    <div class="p-3 bg-white rounded-3 border mb-3 flex-grow-1">
      <div class="d-flex justify-content-between small mb-1">
        <span class="text-muted">Khách hàng:</span>
        <strong class="text-dark">{{ session.customerName }}</strong>
      </div>
      <div class="d-flex justify-content-between small mb-1">
        <span class="text-muted">Số người:</span>
        <strong class="text-dark">{{ session.actualGuestsCount }} người</strong>
      </div>
      <div class="d-flex justify-content-between small">
        <span class="text-muted">Giờ vào:</span>
        <strong class="text-secondary">{{ new Date(session.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</strong>
      </div>
    </div>

    <div class="d-flex gap-2 mt-auto pt-2 border-top">
      <button @click="$emit('open-qr', session)" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold" title="QR cho khách tự gọi món">
        <i class="fa-solid fa-qrcode"></i>
      </button>
      <button @click="$emit('change-table', session)" class="btn btn-outline-primary btn-sm rounded-pill fw-bold" title="Đổi bàn / ghép thêm bàn">
        <i class="fa-solid fa-right-left"></i>
      </button>
      <button @click="$emit('dish-status', session)" class="btn btn-outline-warning btn-sm rounded-pill fw-bold" title="Xem danh sách món & trạng thái bếp">
        <i class="fa-solid fa-list-check"></i>
      </button>
      <button @click="$emit('order', session)" class="btn btn-outline-danger btn-sm rounded-pill flex-fill fw-bold">
        <i class="fa-solid fa-utensils me-1"></i> Gọi Món
      </button>
      <button @click="$emit('checkout', session)" class="btn btn-success btn-sm rounded-pill flex-fill fw-bold">
        <i class="fa-solid fa-receipt me-1"></i> Thanh Toán
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  session: {
    type: Object,
    required: true,
  },
});

defineEmits(["open-qr", "change-table", "dish-status", "order", "checkout"]);
</script>
