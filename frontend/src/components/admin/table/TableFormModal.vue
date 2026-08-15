<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content rounded-4 p-2 shadow">
        <div class="modal-header border-0 pb-1">
          <h6 class="modal-title fw-bold brand-font text-danger" style="font-size: 0.9rem">
            <i :class="isEditing ? 'fa-pen-to-square' : 'fa-plus'" class="fa-solid me-1"></i>
            {{ isEditing ? 'Cập Nhật Bàn Ăn' : 'Thêm Bàn Ăn Mới' }}
          </h6>
          <button @click="$emit('close')" type="button" class="btn-close btn-close-sm"></button>
        </div>
        <div class="modal-body py-1" style="font-size: 0.78rem">
          <div class="mb-2">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Số bàn / Mã bàn <span class="text-danger">*</span></label>
            <input v-model="form.tableNumber" type="text" class="form-control form-control-sm text-uppercase" placeholder="VD: B09, VIP04" required style="font-size: 0.75rem" />
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Sức chứa (số khách) <span class="text-danger">*</span></label>
            <input v-model.number="form.capacity" type="number" min="1" max="20" class="form-control form-control-sm" placeholder="VD: 4" required style="font-size: 0.75rem" />
            <div class="text-muted" style="font-size: 0.62rem">Quy định từ 1 đến 20 chỗ</div>
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Khu vực <span class="text-danger">*</span></label>
            <select v-model="form.area" class="form-select form-select-sm" style="font-size: 0.75rem" required>
              <option value="" disabled>-- Chọn khu vực --</option>
              <option v-for="area in areas" :key="area._id" :value="area._id">
                {{ area.name }}
              </option>
            </select>
          </div>
          <div v-if="isEditing" class="mb-2">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Trạng thái bàn</label>
            <select v-model="form.status" class="form-select form-select-sm" style="font-size: 0.75rem">
              <option value="AVAILABLE">Trống (Sẵn sàng)</option>
              <option value="RESERVED">Đã đặt trước</option>
              <option value="OCCUPIED">Đang dùng bữa</option>
              <option value="MAINTENANCE">Bảo trì / Tạm ngưng</option>
            </select>
          </div>
          <div v-if="error" class="alert alert-danger small rounded-3 py-1 px-2 mb-0" style="font-size: 0.7rem">
            {{ error }}
          </div>
        </div>
        <div class="modal-footer border-0 pt-1">
          <button @click="$emit('close')" class="btn btn-light btn-sm rounded-pill px-3" style="font-size: 0.72rem">Hủy</button>
          <button @click="$emit('submit', form)" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold" style="font-size: 0.72rem">
            <i class="fa-solid fa-check me-1"></i>{{ isEditing ? 'Lưu Thay Đổi' : 'Tạo Bàn' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ tableNumber: "", capacity: 4, area: "", status: "AVAILABLE" }),
  },
  areas: {
    type: Array,
    default: () => [],
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["close", "submit"]);

const form = reactive({
  tableNumber: "",
  capacity: 4,
  area: "",
  status: "AVAILABLE",
});

watch(
  () => props.initialData,
  (val) => {
    if (val) Object.assign(form, val);
  },
  { immediate: true, deep: true },
);
</script>
