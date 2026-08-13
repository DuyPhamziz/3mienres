<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <small class="text-muted">
        <i class="fa-solid fa-chair text-danger me-1"></i>Chọn bàn (bỏ trống = hệ thống tự xếp)
      </small>
      <button v-if="selectedIds.length" type="button" @click="clearSelection" class="btn btn-link btn-sm text-danger p-0 fw-semibold">
        Bỏ chọn
      </button>
    </div>

    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm text-danger"></div>
    </div>

    <div v-else-if="hasData" class="table-picker-scroll">
      <!-- Bàn đơn phù hợp -->
      <small class="text-muted fw-semibold d-block mb-1">{{ langStore.isEnglish ? 'Single tables' : 'Bàn Đơn Phù Hợp' }}</small>
      <p v-if="singleMatches.length === 0" class="text-muted small mb-2">
        {{ langStore.isEnglish ? 'No single table fits' : 'Không có bàn đơn đủ chỗ' }}
      </p>
      <div
        v-for="t in singleMatches"
        :key="t._id"
        @click="selectSingle(t)"
        class="table-check border rounded-3 p-2 mb-1 d-flex align-items-center gap-2"
        :class="{ 'border-danger bg-danger bg-opacity-10': selectedKey === singleKey(t) }"
      >
        <i :class="selectedKey === singleKey(t) ? 'fa-solid fa-circle-check text-danger' : 'fa-regular fa-circle text-muted'"></i>
        <span class="small fw-semibold text-dark">
          Bàn {{ t.tableNumber }}
          <small class="text-muted fw-normal">· {{ t.area?.name || (langStore.isEnglish ? 'No area' : 'Chưa xếp khu vực') }}</small>
        </span>
        <span class="ms-auto text-danger fw-bold small">{{ t.capacity }} {{ langStore.isEnglish ? 'seats' : 'chỗ' }}</span>
      </div>

      <!-- Cụm ghép đề xuất -->
      <small class="text-muted fw-semibold d-block mb-1 mt-3">{{ langStore.isEnglish ? 'Suggested table combos' : 'Cụm Ghép Đề Xuất' }}</small>
      <p v-if="combos.length === 0" class="text-muted small mb-2">
        {{ langStore.isEnglish ? 'No combination fits' : 'Không có cụm ghép phù hợp' }}
      </p>
      <div
        v-for="combo in combos"
        :key="comboKey(combo)"
        @click="selectCombo(combo)"
        class="table-check border rounded-3 p-2 mb-1 d-flex align-items-center gap-2"
        :class="{ 'border-danger bg-danger bg-opacity-10': selectedKey === comboKey(combo) }"
      >
        <i :class="selectedKey === comboKey(combo) ? 'fa-solid fa-circle-check text-danger' : 'fa-regular fa-circle text-muted'"></i>
        <span class="small fw-semibold text-dark">
          <i class="fa-solid fa-link text-warning me-1"></i>
          {{ combo.tables.map((t) => t.tableNumber).join(' + ') }}
          <small class="text-muted fw-normal">· {{ combo.tables[0]?.area?.name }}</small>
        </span>
        <span class="ms-auto text-danger fw-bold small">{{ combo.totalCapacity }} {{ langStore.isEnglish ? 'seats' : 'chỗ' }}</span>
      </div>
    </div>

    <p v-else class="text-muted small mb-0">
      <i class="fa-solid fa-circle-info me-1"></i>
      {{ langStore.isEnglish ? 'Choose date & guests to see available tables.' : 'Chọn thời gian & số khách để xem bàn trống.' }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTableStore } from "../../stores/tableStore";
import { useLangStore } from "../../stores/langStore";

const props = defineProps({
  startAt: { type: String, default: "" },
  guestsCount: { type: Number, default: 1 },
});

const selectedIds = defineModel({ type: Array, default: () => [] });

const tableStore = useTableStore();
const langStore = useLangStore();

const singleMatches = ref([]);
const combos = ref([]);
const loading = ref(false);
const selectedKey = ref("");

const hasData = computed(() => singleMatches.value.length > 0 || combos.value.length > 0);

const singleKey = (t) => `single_${t._id}`;
const comboKey = (combo) => "combo_" + combo.tables.map((t) => t._id).sort().join("_");

const selectSingle = (t) => {
  selectedKey.value = singleKey(t);
  selectedIds.value = [t._id];
};

const selectCombo = (combo) => {
  selectedKey.value = comboKey(combo);
  selectedIds.value = combo.tables.map((t) => t._id);
};

const clearSelection = () => {
  selectedKey.value = "";
  selectedIds.value = [];
};

const fetchAvailability = async () => {
  if (!props.startAt) {
    singleMatches.value = [];
    combos.value = [];
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
    singleMatches.value = result.singleMatches || [];
    combos.value = result.suggestedCombinations || [];

    // Nếu lựa chọn cũ không còn khả dụng thì bỏ chọn
    if (selectedIds.value.length) {
      const validIds = new Set([
        ...singleMatches.value.map((t) => t._id),
        ...combos.value.flatMap((c) => c.tables.map((t) => t._id)),
      ]);
      if (!selectedIds.value.every((id) => validIds.has(id))) {
        clearSelection();
      }
    }
  } catch {
    singleMatches.value = [];
    combos.value = [];
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
  max-height: 260px;
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
