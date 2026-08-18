<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
        <!-- Header -->
        <div class="modal-header border-0 pb-1">
          <div>
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-sliders me-2"></i>Tùy Chỉnh Check-in / Đổi Bàn & Số Khách
            </h5>
            <small class="text-muted fs-8">
              Đơn đặt bàn <strong>{{ reservation.reservationCode }}</strong> - {{ reservation.customerName }}
            </small>
          </div>
          <button @click="$emit('close')" type="button" class="btn-close" :disabled="loading"></button>
        </div>

        <div class="modal-body py-3">
          <div class="row g-3">
            <!-- Cột trái: Điều chỉnh số khách & Tóm tắt -->
            <div class="col-md-5 border-end-md">
              <div class="p-3 bg-light rounded-4 border mb-3">
                <div class="d-flex justify-content-between small text-secondary mb-1">
                  <span>Khách hàng:</span>
                  <strong class="text-dark">{{ reservation.customerName }}</strong>
                </div>
                <div class="d-flex justify-content-between small text-secondary mb-1">
                  <span>Số điện thoại:</span>
                  <strong class="text-dark">{{ reservation.customerPhone }}</strong>
                </div>
                <div class="d-flex justify-content-between small text-secondary mb-1">
                  <span>Số khách đặt ban đầu:</span>
                  <span class="badge bg-secondary rounded-pill">{{ reservation.guestsCount }} người</span>
                </div>
                <div class="d-flex justify-content-between small text-secondary">
                  <span>Bàn ban đầu:</span>
                  <strong class="text-danger">
                    {{ (reservation.tables || []).map(t => t.tableNumber || t).join(', ') || 'Chưa gán' }}
                  </strong>
                </div>
              </div>

              <!-- Điều chỉnh số khách thực tế -->
              <div class="mb-3">
                <label class="form-label fw-semibold fs-7 text-dark">
                  Số khách thực tế đến ăn <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm px-3"
                    @click="decreaseGuests"
                    :disabled="loading"
                  >
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input
                    v-model.number="form.actualGuestsCount"
                    type="number"
                    min="1"
                    max="100"
                    class="form-control text-center fw-bold fs-6"
                    required
                    :disabled="loading"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm px-3"
                    @click="increaseGuests"
                    :disabled="loading"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <small class="text-muted fs-8 mt-1 d-block">
                  (Khách có thể đi nhiều hơn hoặc ít hơn số lượng đã đặt)
                </small>
              </div>

              <!-- Sức chứa bàn đã chọn -->
              <div
                class="p-3 rounded-4 border mb-2"
                :class="selectedTotalCapacity >= form.actualGuestsCount ? 'bg-success bg-opacity-10 border-success' : 'bg-warning bg-opacity-10 border-warning'"
              >
                <div class="d-flex justify-content-between align-items-center small mb-1">
                  <span class="text-muted">Bàn chọn thực tế:</span>
                  <strong class="text-dark">{{ selectedTablesList.map(t => t.tableNumber).join(' + ') || 'Chưa chọn' }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted">Sức chứa / Số khách:</span>
                  <strong :class="selectedTotalCapacity >= form.actualGuestsCount ? 'text-success' : 'text-warning'">
                    {{ selectedTotalCapacity }} chỗ / {{ form.actualGuestsCount }} khách
                  </strong>
                </div>
                <small
                  v-if="form.tableIds.length > 0 && selectedTotalCapacity < form.actualGuestsCount"
                  class="text-danger d-block mt-1 fs-8 fw-semibold"
                >
                  <i class="fa-solid fa-triangle-exclamation me-1"></i>Sức chứa bàn chưa đủ cho số khách!
                </small>
              </div>
            </div>

            <!-- Cột phải: Chọn bàn trống thực tế -->
            <div class="col-md-7">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-semibold fs-7 text-dark mb-0">
                  <i class="fa-solid fa-chair text-danger me-1"></i>Chọn bàn thực tế mở cho khách
                </label>
                <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 fs-8">
                  {{ selectableTables.length }} bàn khả dụng
                </span>
              </div>

              <div class="table-select-scroll border rounded-4 p-3 bg-light">
                <div v-for="(tablesInArea, areaName) in tablesByArea" :key="areaName" class="mb-3">
                  <div class="fw-bold text-secondary small mb-1.5 pb-1 border-bottom" style="font-size: 0.75rem;">
                    <i class="fa-solid fa-map-pin me-1 text-danger"></i>{{ areaName }}
                  </div>
                  <div class="row g-2">
                    <div v-for="t in tablesInArea" :key="t._id" class="col-6 col-sm-4">
                      <label
                        :class="[
                          'table-choice-card p-2 rounded-3 border text-center d-block cursor-pointer transition-all',
                          form.tableIds.includes(t._id) ? 'border-danger bg-danger bg-opacity-10 shadow-sm' : 'bg-white'
                        ]"
                      >
                        <input
                          type="checkbox"
                          :value="t._id"
                          v-model="form.tableIds"
                          class="d-none"
                          :disabled="loading"
                        />
                        <div class="d-flex justify-content-between align-items-center mb-0.5">
                          <span class="badge bg-light text-dark border fs-8 fw-bold">Bàn {{ t.tableNumber }}</span>
                          <i v-if="form.tableIds.includes(t._id)" class="fa-solid fa-circle-check text-danger fs-8"></i>
                          <span v-else class="text-success fs-9"><i class="fa-solid fa-circle"></i></span>
                        </div>
                        <small class="text-muted d-block fs-8">{{ t.capacity }} chỗ</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger small rounded-3 mt-3 mb-0">
            <i class="fa-solid fa-circle-exclamation me-1"></i>{{ error }}
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer border-0 pt-2">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4" :disabled="loading">Hủy</button>
          <button
            @click="handleSubmit"
            :disabled="form.tableIds.length === 0 || loading"
            class="btn btn-success rounded-pill px-5 fw-bold shadow-sm"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fa-solid fa-door-open me-1.5"></i>
            Xác Nhận Check-in Mở Bàn ({{ form.tableIds.length }} bàn)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from "vue";
import { useTableStore } from "../../../stores/tableStore";

const props = defineProps({
  reservation: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "submit"]);

const tableStore = useTableStore();

const initialTableIds = (props.reservation.tables || []).map((t) => (t._id || t).toString());

const form = reactive({
  actualGuestsCount: props.reservation.guestsCount || 2,
  tableIds: [...initialTableIds],
});

const selectableTables = computed(() => {
  // Cho phép chọn các bàn AVAILABLE hoặc các bàn đã được gán sẵn cho đơn này
  return tableStore.tables.filter((t) => {
    const isAlreadyAssigned = initialTableIds.includes(t._id.toString());
    return t.status === "AVAILABLE" || isAlreadyAssigned;
  });
});

const selectedTablesList = computed(() => {
  return tableStore.tables.filter((t) => form.tableIds.includes(t._id));
});

const selectedTotalCapacity = computed(() => {
  return selectedTablesList.value.reduce((sum, t) => sum + (t.capacity || 0), 0);
});

const tablesByArea = computed(() => {
  const grouped = {};
  for (const t of selectableTables.value) {
    const areaName = t.area?.name || "Khu vực chung";
    (grouped[areaName] ||= []).push(t);
  }
  return grouped;
});

const decreaseGuests = () => {
  if (form.actualGuestsCount > 1) form.actualGuestsCount--;
};

const increaseGuests = () => {
  form.actualGuestsCount++;
};

const handleSubmit = () => {
  emit("submit", {
    reservationId: props.reservation._id,
    actualGuestsCount: form.actualGuestsCount,
    tableIds: form.tableIds,
  });
};

onMounted(() => {
  tableStore.fetchTables();
});
</script>

<style scoped>
.table-select-scroll {
  max-height: 280px;
  overflow-y: auto;
}
.table-choice-card {
  user-select: none;
}
.table-choice-card:hover {
  border-color: #16a34a !important;
}
@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px solid #dee2e6;
    padding-right: 1.5rem;
  }
}
</style>
