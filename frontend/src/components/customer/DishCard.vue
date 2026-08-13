<template>
  <div class="dish-card p-3 border rounded-4 bg-white h-100 d-flex align-items-center justify-content-between gap-2 shadow-sm">
    <div class="d-flex align-items-center gap-3 min-w-0">
      <div class="dish-thumb flex-shrink-0">
        <img :src="getImageUrl(dish.image)" :alt="dish.name" loading="lazy" decoding="async" />
      </div>
      <div class="min-w-0">
        <div class="d-flex align-items-center gap-2 mb-1">
          <i class="fa-solid fa-grip-vertical text-secondary opacity-50" title="Kéo thả để thêm món"></i>
          <strong class="d-block text-dark text-truncate fs-7">{{ dish.name }}</strong>
        </div>
        <span class="text-danger fw-bold small">{{ dish.price.toLocaleString('vi-VN') }}đ</span>
      </div>
    </div>

    <!-- Khu vực nút bấm không kích hoạt kéo thả (no-drag) -->
    <div class="no-drag d-flex align-items-center gap-2 flex-shrink-0">
      <button
        type="button"
        @click="$emit('decrement')"
        class="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
        style="width: 30px; height: 30px;"
        :disabled="quantity <= 0"
      >
        <i class="fa-solid fa-minus fs-8"></i>
      </button>
      <span class="fw-bold px-1 fs-7" style="min-width: 18px; text-align: center;">{{ quantity || 0 }}</span>
      <button
        type="button"
        @click="$emit('increment')"
        class="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
        style="width: 30px; height: 30px;"
      >
        <i class="fa-solid fa-plus fs-8"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl } from "../../utils/imageHelper";

defineProps({
  dish: { type: Object, required: true },
  quantity: { type: Number, default: 0 },
});

defineEmits(["increment", "decrement"]);
</script>

<style scoped>
.dish-thumb {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dish-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dish-thumb i {
  font-size: 1.4rem;
}
.dish-card {
  cursor: grab;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.dish-card:active {
  cursor: grabbing;
}
.dish-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
</style>
