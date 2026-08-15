<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg">
        <div class="modal-header border-0 pb-1">
          <div>
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-person-walking-luggage me-2"></i>Tiếp Nhận Khách Walk-in
            </h5>
            <small class="text-muted fs-8">Mở lượt dùng bữa trực tiếp cho khách vãng lai không đặt trước</small>
          </div>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>

        <div class="modal-body py-3">
          <div class="row g-3">
            <!-- Cột trái: Thông tin khách -->
            <div class="col-md-5 border-end-md">
              <div class="mb-3">
                <label class="form-label fw-semibold fs-7 text-dark">
                  Tên khách hàng <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.customerName"
                  type="text"
                  class="form-control fs-7"
                  placeholder="VD: Khách Walk-in / Anh Tuấn"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold fs-7 text-dark">
                  Số điện thoại <small class="text-muted fw-normal">(tích điểm thành viên)</small>
                </label>
                <input
                  v-model="form.customerPhone"
                  type="tel"
                  class="form-control fs-7"
                  placeholder="VD: 0988776655"
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold fs-7 text-dark">
                  Số lượng khách <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm px-3"
                    @click="decreaseGuests"
                  >
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input
                    v-model.number="form.guestsCount"
                    type="number"
                    min="1"
                    max="100"
                    class="form-control text-center fw-bold fs-6"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm px-3"
                    @click="increaseGuests"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold fs-7 text-dark">Ghi chú phục vụ</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  class="form-control fs-8"
                  placeholder="VD: Bàn cạnh cửa sổ, 1 ghế trẻ em..."
                ></textarea>
              </div>

              <!-- Tóm tắt sức chứa đã chọn -->
              <div
                class="p-3 rounded-4 border mb-2"
                :class="selectedTotalCapacity >= form.guestsCount ? 'bg-success bg-opacity-10 border-success' : 'bg-warning bg-opacity-10 border-warning'"
              >
                <div class="d-flex justify-content-between align-items-center small mb-1">
                  <span class="text-muted">Bàn đã chọn:</span>
                  <strong class="text-dark">{{ selectedTablesList.map(t => t.tableNumber).join(' + ') || 'Chưa chọn' }}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted">Sức chứa / Số khách:</span>
                  <strong :class="selectedTotalCapacity >= form.guestsCount ? 'text-success' : 'text-warning'">
                    {{ selectedTotalCapacity }} chỗ / {{ form.guestsCount }} khách
                  </strong>
                </div>
                <small
                  v-if="form.tableIds.length > 0 && selectedTotalCapacity < form.guestsCount"
                  class="text-danger d-block mt-1 fs-8 fw-semibold"
                >
                  <i class="fa-solid fa-triangle-exclamation me-1"></i>Sức chứa bàn chưa đủ cho số khách!
                </small>
              </div>
            </div>

            <!-- Cột phải: Danh sách bàn trống -->
            <div class="col-md-7">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-semibold fs-7 text-dark mb-0">
                  <i class="fa-solid fa-chair text-danger me-1"></i>Chọn bàn trống xếp cho khách
                </label>
                <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 fs-8">
                  {{ availableTables.length }} bàn trống
                </span>
              </div>

              <div class="table-select-scroll border rounded-4 p-3 bg-light">
                <div v-if="availableTables.length === 0" class="text-muted text-center py-4">
                  <i class="fa-solid fa-store-slash fs-3 d-block mb-2 opacity-50"></i>
                  <span class="small">Hiện không còn bàn trống nào khả dụng</span>
                </div>

                <div v-else>
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
          </div>

          <div v-if="error" class="alert alert-danger small rounded-3 mt-3 mb-0">
            <i class="fa-solid fa-circle-exclamation me-1"></i>{{ error }}
          </div>
        </div>

        <div class="modal-footer border-0 pt-2">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4" :disabled="submitting">Hủy</button>
          <button
            @click="handleSubmit"
            :disabled="form.tableIds.length === 0 || submitting"
            class="btn btn-danger rounded-pill px-5 fw-bold shadow-sm"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fa-solid fa-door-open me-1.5"></i>
            Mở Bàn Ngay ({{ form.tableIds.length }} bàn)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";

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

const emit = defineEmits(["close", "submit"]);

const submitting = ref(false);

const form = reactive({
  customerName: "Khách Walk-in",
  customerPhone: "",
  guestsCount: 2,
  tableIds: [],
  notes: "",
});

const selectedTablesList = computed(() => {
  return props.availableTables.filter((t) => form.tableIds.includes(t._id));
});

const selectedTotalCapacity = computed(() => {
  return selectedTablesList.value.reduce((sum, t) => sum + (t.capacity || 0), 0);
});

const tablesByArea = computed(() => {
  const grouped = {};
  for (const t of props.availableTables) {
    const areaName = t.area?.name || "Khu vực chung";
    (grouped[areaName] ||= []).push(t);
  }
  return grouped;
});

const decreaseGuests = () => {
  if (form.guestsCount > 1) form.guestsCount--;
};

const increaseGuests = () => {
  form.guestsCount++;
};

const handleSubmit = () => {
  submitting.value = true;
  emit("submit", { ...form });
};
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
  border-color: #dc3545 !important;
}
@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px solid #dee2e6;
    padding-right: 1.5rem;
  }
}
</style>
