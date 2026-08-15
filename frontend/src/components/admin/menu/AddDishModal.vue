<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">Thêm Món Ăn Đặc Sản Mới</h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label fw-semibold">Tên món ăn <span class="text-danger">*</span></label>
            <input v-model="form.name" type="text" class="form-control" placeholder="Ví dụ: Cua Sốt Trứng Muối" required />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Vùng miền <span class="text-danger">*</span></label>
            <select v-model="form.region" class="form-select" required>
              <option value="Bắc">Miền Bắc</option>
              <option value="Trung">Miền Trung</option>
              <option value="Nam">Miền Nam</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Danh mục món ăn <span class="text-danger">*</span></label>
            <select v-model="form.category" class="form-select" required>
              <option value="" disabled>-- Chọn danh mục --</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Giá bán (VNĐ) <span class="text-danger">*</span></label>
            <input v-model.number="form.price" type="number" min="0" step="1000" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Mô tả món ăn</label>
            <textarea v-model="form.description" class="form-control" rows="2" placeholder="Hương vị, nguyên liệu đặc trưng..."></textarea>
          </div>
          <div v-if="error" class="alert alert-danger small rounded-3">{{ error }}</div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Hủy</button>
          <button @click="$emit('submit', form)" class="btn btn-danger rounded-pill px-4 fw-bold">
            Tạo Món Ăn Mới
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["close", "submit"]);

const form = reactive({
  name: "",
  region: "Nam",
  category: "",
  price: 150000,
  description: "",
});
</script>
