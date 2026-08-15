<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">Tiếp Nhận Khách Walk-in</h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label fw-semibold">Tên khách hàng</label>
            <input v-model="form.customerName" type="text" class="form-control" placeholder="Khách vãng lai" required />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Số lượng khách</label>
            <input v-model.number="form.guestsCount" type="number" min="1" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Chọn bàn trống xếp cho khách</label>
            <div class="table-select-scroll border rounded-3 p-2 bg-light">
              <div v-for="table in availableTables" :key="table._id" class="form-check d-flex align-items-center gap-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="`walkin-table-${table._id}`"
                  :value="table._id"
                  v-model="form.tableIds"
                />
                <label class="form-check-label small" :for="`walkin-table-${table._id}`">
                  Bàn {{ table.tableNumber }} ({{ table.capacity }} chỗ)
                </label>
              </div>
              <div v-if="availableTables.length === 0" class="text-muted small text-center py-2">
                <i class="fa-solid fa-circle-info me-1"></i>Không còn bàn trống
              </div>
            </div>
          </div>
          <div v-if="error" class="alert alert-danger small rounded-3">{{ error }}</div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Hủy</button>
          <button @click="$emit('submit', form)" class="btn btn-danger rounded-pill px-4 fw-bold">Mở Bàn Ngay</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const props = defineProps({
  availableTables: {
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
  customerName: "Khách Walk-in",
  customerPhone: "",
  guestsCount: 2,
  tableIds: [],
});
</script>

<style scoped>
.table-select-scroll {
  max-height: 180px;
  overflow-y: auto;
}
</style>
