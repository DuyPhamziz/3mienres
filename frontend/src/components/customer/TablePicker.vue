<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <small class="text-muted">
        <i class="fa-solid fa-chair text-danger me-1"></i>Chọn bàn cụ thể (bỏ trống = hệ thống tự xếp)
      </small>
      <button v-if="selectedIds.length" type="button" @click="selectedIds = []" class="btn btn-link btn-sm text-danger p-0 fw-semibold">
        Bỏ chọn
      </button>
    </div>

    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm text-danger"></div>
    </div>

    <div v-else-if="tables.length > 0" class="table-picker-scroll">
      <div
        v-for="t in tables"
        :key="t._id"
        class="table-check border rounded-3 p-2 mb-1 d-flex align-items-center gap-2"
        :class="{ 'border-danger bg-danger bg-opacity-10': selectedIds.includes(t._id) }"
      >
        <input
          class="form-check-input mt-0"
          type="checkbox"
          :id="`tp-${t._id}`"
          :value="t._id"
          v-model="selectedIds"
        />
        <label class="form-check-label w-100 d-flex justify-content-between align-items-center" :for="`tp-${t._id}`">
          <span class="small fw-semibold text-dark">
            Bàn {{ t.tableNumber }}
            <small class="text-muted fw-normal">· {{ t.area?.name || 'Chưa xếp khu vực' }}</small>
          </span>
          <span class="text-danger fw-bold small">{{ t.capacity }} chỗ</span>
        </label>
      </div>
    </div>

    <p v-else class="text-muted small mb-0">
      <i class="fa-solid fa-circle-info me-1"></i>Chọn thời gian & số khách để xem bàn trống.
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useTableStore } from "../../stores/tableStore";

const props = defineProps({
  startAt: { type: String, default: "" },
  guestsCount: { type: Number, default: 1 },
});

const selectedIds = defineModel({ type: Array, default: () => [] });

const tableStore = useTableStore();
const tables = ref([]);
const loading = ref(false);

const fetchAvailability = async () => {
  if (!props.startAt) {
    tables.value = [];
    return;
  }
  loading.value = true;
  try {
    const start = new Date(props.startAt);
    const end = new Date(start.getTime() + 120 * 60000); // 120 phút mặc định
    const result = await tableStore.checkAvailability(
      start.toISOString(),
      end.toISOString(),
      props.guestsCount,
    );
    tables.value = result.availableTables || [];
    // Bỏ các bàn đã chọn nhưng không còn khả dụng
    const ids = new Set(tables.value.map((t) => t._id));
    selectedIds.value = selectedIds.value.filter((id) => ids.has(id));
  } catch {
    tables.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.startAt, props.guestsCount],
  () => fetchAvailability(),
  { immediate: true },
);
</script>

<style scoped>
.table-picker-scroll {
  max-height: 220px;
  overflow-y: auto;
}
.table-check {
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.table-check:hover {
  border-color: rgba(211, 47, 47, 0.5);
}
</style>
