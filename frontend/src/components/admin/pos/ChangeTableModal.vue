<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-primary">
            <i class="fa-solid fa-right-left me-2"></i>Đổi Bàn / Ghép Thêm Bàn
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <p class="small text-muted">Bàn hiện tại: <strong class="text-dark">{{ currentTables }}</strong></p>
          <label class="form-label fw-semibold">Chọn bàn mới (giữ bàn hiện tại + thêm bàn trống)</label>
          <div class="table-select-scroll border rounded-3 p-2 bg-light">
            <div v-for="t in options" :key="t._id" class="form-check d-flex align-items-center gap-2">
              <input
                class="form-check-input"
                type="checkbox"
                :id="`ct-${t._id}`"
                :value="t._id"
                v-model="selectedTableIds"
              />
              <label class="form-check-label small" :for="`ct-${t._id}`">
                Bàn {{ t.tableNumber }} ({{ t.capacity }} chỗ)
                <span v-if="t.isCurrent" class="text-primary fw-bold">· đang ngồi</span>
              </label>
            </div>
          </div>
          <div v-if="error" class="alert alert-danger small rounded-3 mt-3 mb-0">{{ error }}</div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Hủy</button>
          <button @click="$emit('submit', selectedTableIds)" class="btn btn-primary rounded-pill px-4 fw-bold">
            Xác Nhận Đổi Bàn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
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

const selectedTableIds = ref((props.session.tables || []).map((t) => t._id || t));

const currentTables = computed(() => {
  return (props.session.tables || []).map((t) => t.tableNumber).join(", ");
});

const options = computed(() => {
  const currentIds = (props.session.tables || []).map((t) => t._id || t);
  const currentList = (props.session.tables || []).map((t) => ({ ...t, isCurrent: true }));
  const availableList = props.availableTables
    .filter((t) => !currentIds.includes(t._id))
    .map((t) => ({ ...t, isCurrent: false }));
  return [...currentList, ...availableList];
});
</script>

<style scoped>
.table-select-scroll {
  max-height: 180px;
  overflow-y: auto;
}
</style>
