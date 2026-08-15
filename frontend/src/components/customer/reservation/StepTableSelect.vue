<template>
  <div class="wizard-panel">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h4 class="fw-bold text-danger brand-font mb-0 d-flex align-items-center gap-2">
        <i class="fa-solid fa-chair"></i>
        {{ isEnglish ? 'Step 2: Select Arrival Time & Table' : 'Bước 2: Thời Gian & Sơ Đồ Chọn Bàn Thực Tế' }}
      </h4>

      <!-- Status legend -->
      <div class="d-flex align-items-center gap-3 fs-8 fw-semibold">
        <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-success fs-9"></i> {{ isEnglish ? 'Available' : 'Bàn trống' }}</span>
        <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-secondary fs-9"></i> {{ isEnglish ? 'Booked' : 'Đã đặt' }}</span>
        <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-warning fs-9"></i> {{ isEnglish ? 'Custom/Group' : 'Bàn tùy chỉnh' }}</span>
      </div>
    </div>

    <!-- Arrival Time Input -->
    <div class="mb-4">
      <label class="form-label fw-semibold fs-7 text-dark">{{ isEnglish ? 'Arrival Time' : 'Thời gian bắt đầu dùng bữa' }} <span class="text-danger">*</span></label>
      <div class="form-control-icon" style="max-width: 320px;">
        <input
          :value="form.startAt"
          @input="onTimeChange($event.target.value)"
          type="datetime-local"
          class="form-control py-2.5"
          required
        />
        <i class="fa-solid fa-clock"></i>
      </div>
    </div>

    <!-- Area Filter Tabs -->
    <div class="d-flex align-items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        @click="selectedAreaId = 'ALL'"
        :class="['btn btn-sm rounded-pill px-3 fw-semibold text-nowrap flex-shrink-0', selectedAreaId === 'ALL' ? 'btn-danger' : 'btn-light']"
      >
        {{ isEnglish ? 'All Areas' : 'Tất Cả Khu Vực' }}
      </button>
      <button
        v-for="area in areas"
        :key="area._id"
        type="button"
        @click="selectedAreaId = area._id"
        :class="['btn btn-sm rounded-pill px-3 fw-semibold text-nowrap flex-shrink-0', selectedAreaId === area._id ? 'btn-danger' : 'btn-light']"
      >
        {{ area.name }}
      </button>
    </div>

    <!-- Visual Interactive Table Grid -->
    <div class="table-map-container p-3 p-md-4 rounded-4 border bg-light mb-4">
      <div v-if="loadingTables" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
        <p class="text-muted small mt-2">Đang kiểm tra bàn trống theo khung giờ...</p>
      </div>

      <div v-else-if="filteredTables.length === 0" class="text-center py-5 text-muted small">
        <i class="fa-solid fa-store-slash fs-2 d-block mb-2 text-secondary opacity-50"></i>
        Không có bàn nào trong khu vực này
      </div>

      <div v-else class="row g-3">
        <div
          v-for="table in filteredTables"
          :key="table._id"
          class="col-6 col-sm-4 col-md-3 col-lg-2"
        >
          <div
            @click="toggleTable(table)"
            :class="[
              'table-seat-card p-3 rounded-4 border-2 text-center transition-all cursor-pointer position-relative',
              getTableCardClass(table)
            ]"
          >
            <!-- Badge for selected / status -->
            <span v-if="isTableSelected(table._id)" class="position-absolute top-0 end-0 m-1.5 badge bg-danger rounded-circle p-1" style="width: 20px; height: 20px;">
              <i class="fa-solid fa-check fs-9 text-white"></i>
            </span>

            <i class="fa-solid fa-chair fs-3 mb-1" :class="isTableSelected(table._id) ? 'text-danger' : (table.isOccupied ? 'text-secondary opacity-50' : 'text-success')"></i>
            <strong class="d-block text-dark fs-6">{{ table.tableNumber }}</strong>
            <small class="text-muted fs-8 d-block">{{ table.capacity }} {{ isEnglish ? 'seats' : 'chỗ' }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Tables Summary & Auto Combine Notice -->
    <div v-if="selectedTables.length > 0" class="p-3 bg-danger bg-opacity-10 rounded-4 border border-danger border-opacity-25 mb-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong class="text-danger fs-7 d-block">
            <i class="fa-solid fa-circle-check me-1"></i>
            {{ isEnglish ? 'Selected Tables:' : 'Bàn đã chọn:' }}
            {{ selectedTables.map(t => t.tableNumber).join(' + ') }}
          </strong>
          <small class="text-secondary fs-8">
            {{ isEnglish ? `Total capacity: ${totalSelectedCapacity} seats` : `Tổng sức chứa: ${totalSelectedCapacity} chỗ ngồi` }}
          </small>
        </div>

        <span v-if="selectedTables.length > 1" class="badge bg-warning text-dark px-3 py-1.5 rounded-pill fw-bold">
          <i class="fa-solid fa-puzzle-piece me-1"></i> {{ isEnglish ? 'Combined Tables' : 'Ghép Cụm Bàn' }}
        </span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger py-2 px-3 rounded-3 small mb-4">
      <i class="fa-solid fa-circle-exclamation me-1"></i>{{ error }}
    </div>

    <!-- Navigation Buttons -->
    <div class="d-flex justify-content-between align-items-center pt-3 border-top">
      <button type="button" @click="$emit('back')" class="btn btn-outline-secondary rounded-pill px-4 fw-bold">
        <i class="fa-solid fa-arrow-left me-2"></i> {{ isEnglish ? 'Back' : 'Quay Lại' }}
      </button>

      <button type="button" @click="$emit('next')" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm">
        {{ isEnglish ? 'Next: Pre-order Dishes' : 'Tiếp Theo: Đặt Món Trước' }}
        <i class="fa-solid fa-arrow-right ms-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  tables: {
    type: Array,
    default: () => [],
  },
  areas: {
    type: Array,
    default: () => [],
  },
  occupiedTableIds: {
    type: Set,
    default: () => new Set(),
  },
  loadingTables: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back", "next", "time-change", "toggle-table"]);

const selectedAreaId = ref("ALL");

const onTimeChange = (val) => {
  props.form.startAt = val;
  emit("time-change", val);
};

const processedTables = computed(() => {
  return props.tables.map((t) => ({
    ...t,
    isOccupied: props.occupiedTableIds.has(t._id),
  }));
});

const filteredTables = computed(() => {
  if (selectedAreaId.value === "ALL") return processedTables.value;
  return processedTables.value.filter(
    (t) => (t.area?._id || t.area) === selectedAreaId.value
  );
});

const isTableSelected = (id) => (props.form.tableIds || []).includes(id);

const selectedTables = computed(() => {
  const ids = new Set(props.form.tableIds || []);
  return props.tables.filter((t) => ids.has(t._id));
});

const totalSelectedCapacity = computed(() => {
  return selectedTables.value.reduce((sum, t) => sum + (t.capacity || 0), 0);
});

const getTableCardClass = (table) => {
  if (isTableSelected(table._id)) {
    return "border-danger bg-danger bg-opacity-10 shadow-sm";
  }
  if (table.isOccupied) {
    return "border-secondary bg-light opacity-60 cursor-not-allowed";
  }
  return "border-success bg-white hover-shadow";
};

const toggleTable = (table) => {
  if (table.isOccupied) return;
  emit("toggle-table", table);
};
</script>

<style scoped>
.form-control-icon {
  position: relative;
}
.form-control-icon i {
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  color: #a0aec0;
}
.table-seat-card {
  user-select: none;
}
.table-seat-card:hover:not(.cursor-not-allowed) {
  transform: translateY(-2px);
}
</style>
