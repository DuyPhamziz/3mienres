<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">
            <i class="fa-solid fa-list-check me-2"></i>Món Đã Gọi & Trạng Thái Bếp (Bàn {{ session?.tables?.map(t => t.tableNumber).join(' + ') }})
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-danger" role="status"></div>
          </div>
          <div v-else-if="orders.length === 0" class="text-center text-muted py-4">
            <i class="fa-solid fa-utensils fs-3 d-block mb-2 opacity-50"></i>
            Bàn này chưa gọi bất kỳ món nào
          </div>
          <div v-else class="space-y-3">
            <div v-for="ord in orders" :key="ord._id" class="p-3 bg-light rounded-4 border mb-2.5">
              <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <div>
                  <strong class="text-dark fs-7">Đợt gọi món: {{ ord.orderCode }}</strong>
                  <small class="text-muted ms-2">{{ new Date(ord.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</small>
                </div>
                <span :class="['badge rounded-pill px-3 py-1.5 fw-bold fs-8', dishStatusBadge(ord.status)]">
                  {{ dishStatusText(ord.status) }}
                </span>
              </div>
              <div class="space-y-1">
                <div v-for="(item, idx) in ord.items" :key="idx" class="d-flex justify-content-between align-items-center py-1">
                  <span class="text-dark fw-semibold fs-7">{{ item.dish?.name || 'Món ăn' }}</span>
                  <div class="d-flex align-items-center gap-3">
                    <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2.5 py-1 fw-bold fs-8">x{{ item.quantity }}</span>
                    <strong class="text-dark fs-7">{{ ((item.dish?.price || item.price || 0) * item.quantity).toLocaleString('vi-VN') }}đ</strong>
                  </div>
                </div>
              </div>
              <small v-if="ord.notes" class="text-warning d-block mt-2">
                <i class="fa-solid fa-note-sticky me-1"></i>{{ ord.notes }}
              </small>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  session: {
    type: Object,
    required: true,
  },
  orders: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);

const dishStatusBadge = (s) => ({
  PENDING: "bg-warning text-dark",
  PREPARING: "bg-primary text-white",
  SERVED: "bg-success text-white",
  CANCELLED: "bg-danger text-white",
})[s] || "bg-secondary text-white";

const dishStatusText = (s) => ({
  PENDING: "Chờ Bếp Nhận",
  PREPARING: "Bếp Đang Nấu",
  SERVED: "Đã Ra Bàn",
  CANCELLED: "Đã Hủy Món",
})[s] || s;
</script>
