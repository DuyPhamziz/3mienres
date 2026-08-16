<template>
  <div class="wizard-panel">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h4 class="fw-bold text-danger brand-font mb-1 d-flex align-items-center gap-2">
          <i class="fa-solid fa-chair"></i>
          {{ isEnglish ? 'Step 2: Select Arrival Time & Dining Area' : 'Bước 2: Chọn Thời Gian & Bàn Mong Muốn' }}
        </h4>
        <small class="text-muted fs-8">
          {{ isEnglish ? `Booking for ${form.guestsCount} guests. Pick your preferred table or area.` : `Đang đặt cho đoàn ${form.guestsCount} khách. Quý khách chọn 1 bàn mẫu mong muốn, nhà hàng sẽ chuẩn bị chỗ chu đáo.` }}
        </small>
      </div>

      <!-- Status legend -->
      <div class="d-flex align-items-center gap-3 fs-8 fw-semibold">
        <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-success fs-9"></i> {{ isEnglish ? 'Available' : 'Bàn trống' }}</span>
        <span class="d-inline-flex align-items-center gap-1"><i class="fa-solid fa-circle text-secondary fs-9"></i> {{ isEnglish ? 'Booked' : 'Đã kín chỗ' }}</span>
      </div>
    </div>

    <!-- Arrival Time Input & Party Size Reminder -->
    <div class="row g-3 mb-3 align-items-end">
      <div class="col-md-6">
        <label class="form-label fw-semibold fs-7 text-dark">{{ isEnglish ? 'Arrival Time' : 'Thời gian bắt đầu dùng bữa' }} <span class="text-danger">*</span></label>
        <div class="form-control-icon">
          <input
            :value="form.startAt"
            @input="onTimeChange($event.target.value)"
            type="datetime-local"
            class="form-control py-2.5 fs-7"
            required
          />
          <i class="fa-solid fa-clock"></i>
        </div>
      </div>

      <div class="col-md-6">
        <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-users text-danger fs-5"></i>
            <div>
              <small class="text-muted fs-9 d-block">{{ isEnglish ? 'Party Size:' : 'Số khách đã chọn:' }}</small>
              <strong class="text-dark fs-7">{{ form.guestsCount }} {{ isEnglish ? 'guests' : 'người' }}</strong>
            </div>
          </div>
          <button type="button" @click="$emit('back')" class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 fs-9">
            <i class="fa-solid fa-pen me-1"></i>{{ isEnglish ? 'Change' : 'Đổi số khách' }}
          </button>
        </div>
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

    <!-- Visual Interactive Table Grid (Single Table Selection) -->
    <div class="table-map-container p-3 p-md-4 rounded-4 border bg-light mb-3">
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
            @click="selectTable(table)"
            :class="[
              'table-seat-card p-3 rounded-4 border-2 text-center transition-all position-relative',
              getTableCardClass(table)
            ]"
          >
            <!-- Check badge when selected -->
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

    <!-- Selected Table Details & Staff Table Assignment Notice -->
    <div v-if="selectedTable" class="p-3 bg-danger bg-opacity-10 rounded-4 border border-danger border-opacity-25 mb-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong class="text-danger fs-7 d-block">
            <i class="fa-solid fa-circle-check me-1"></i>
            {{ isEnglish ? 'Selected Preferred Table:' : 'Bàn mong muốn đã chọn:' }}
            {{ selectedTable.tableNumber }} ({{ selectedTable.capacity }} chỗ ngồi)
          </strong>
          <small v-if="form.guestsCount > selectedTable.capacity" class="text-dark fs-8 fw-medium">
            <i class="fa-solid fa-info-circle text-primary me-1"></i>
            {{ isEnglish ? `For party of ${form.guestsCount} guests, restaurant manager will automatically prepare and combine adjacent tables for you!` : `Vì đoàn ${form.guestsCount} khách đông hơn sức chứa bàn đơn này, Quản lý nhà hàng sẽ tự động điều phối và ghép thêm bàn liền kề chu đáo khi quý khách đến!` }}
          </small>
          <small v-else class="text-secondary fs-8">
            {{ isEnglish ? `Suitable for ${form.guestsCount} guests.` : `Sức chứa phù hợp cho đoàn ${form.guestsCount} khách.` }}
          </small>
        </div>

        <span class="badge bg-white text-danger border border-danger rounded-pill px-3 py-1.5 fs-8 fw-semibold shadow-2xs">
          {{ selectedTable.area?.name || 'Khu vực chính' }}
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

      <button type="button" @click="$emit('next')" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm" :disabled="!form.tableIds || form.tableIds.length === 0">
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

const emit = defineEmits(["back", "next", "time-change", "select-table"]);

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

const isTableSelected = (id) => (props.form.tableIds || [])[0] === id;

const selectedTable = computed(() => {
  const selectedId = (props.form.tableIds || [])[0];
  if (!selectedId) return null;
  return props.tables.find((t) => t._id === selectedId) || null;
});

const getTableCardClass = (table) => {
  if (isTableSelected(table._id)) {
    return "border-danger bg-danger bg-opacity-10 shadow-sm cursor-pointer";
  }
  if (table.isOccupied) {
    return "border-secondary bg-light opacity-60 cursor-not-allowed";
  }
  return "border-success bg-white hover-shadow cursor-pointer";
};

const selectTable = (table) => {
  if (table.isOccupied) return;
  // Single table selection: only 1 preferred table
  props.form.tableIds = [table._id];
  emit("select-table", table);
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
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
</style>
