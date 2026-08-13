<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h2 class="fw-bold brand-font mb-1">Sơ Đồ Bàn Ăn & Ghép Bàn Kéo Thả</h2>
        <p class="text-muted small mb-0">Kéo thả một bàn lên bàn khác cùng khu vực để tạo liên kết ghép bàn tự động</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="showConnectModal = true" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-puzzle-piece me-1"></i> Liên Kết Thủ Công
        </button>
        <button @click="openAreaModal" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-map-pin me-1"></i> Khu Vực
        </button>
        <button @click="refreshAll" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Hướng dẫn kéo thả -->
    <div class="glass-card p-3 mb-3 rounded-4 d-flex align-items-center gap-3">
      <i class="fa-solid fa-hand-pointer text-danger fs-4"></i>
      <span class="small text-muted">
        Giữ chuột kéo 1 bàn rồi <strong>thả lên bàn khác cùng khu vực</strong> để liên kết ghép bàn.
        Hai bàn đã liên kết sẽ được hệ thống ưu tiên ghép khi có đoàn đông khách.
      </span>
    </div>

    <!-- Status Legend Badges -->
    <div class="glass-card p-3 mb-4 rounded-4 d-flex flex-wrap gap-4 align-items-center">
      <span class="fw-bold small text-muted">Chú thích trạng thái:</span>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-success rounded-circle p-2"></span>
        <span class="small">Bàn Trống (AVAILABLE)</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-warning rounded-circle p-2"></span>
        <span class="small">Đã Có Lịch Giữ Chỗ (RESERVED)</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-danger rounded-circle p-2"></span>
        <span class="small">Khách Đang Ăn (OCCUPIED)</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-secondary rounded-circle p-2"></span>
        <span class="small">Bảo Trì (MAINTENANCE)</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="tableStore.loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <!-- Floor plan grouped by area -->
    <div v-else>
      <div v-for="(areaTables, areaName) in tablesByArea" :key="areaName" class="mb-4">
        <h5 class="fw-bold text-dark mb-2">
          <i class="fa-solid fa-map-pin text-danger me-1"></i>{{ areaName }}
        </h5>
        <div class="row g-3">
          <div v-for="table in areaTables" :key="table._id" class="col-md-3 col-sm-6">
            <div
              :class="[
                'table-card glass-card p-3 rounded-4 text-center position-relative border-2',
                statusClass(table.status),
                { 'drag-source': dragTableId === table._id, 'drop-target': dropTargetId === table._id },
              ]"
              draggable="true"
              @dragstart="onDragStart(table)"
              @dragend="onDragEnd"
              @dragover.prevent="onDragOver(table)"
              @dragleave="onDragLeave(table)"
              @drop.prevent="onDrop(table)"
            >
              <span
                :class="[
                  'position-absolute top-0 end-0 m-2 badge rounded-pill fs-8',
                  statusBadgeClass(table.status),
                ]"
              >
                {{ table.status }}
              </span>

              <div class="my-3">
                <i class="fa-solid fa-chair display-4 text-danger d-block"></i>
              </div>
              <h4 class="fw-bold brand-font mb-1">Bàn {{ table.tableNumber }}</h4>
              <p class="text-muted small mb-2">Sức chứa: {{ table.capacity }} người</p>
              <small class="badge bg-light text-dark border">{{ table.area?.name || 'Chưa xếp khu vực' }}</small>
              <div class="mt-2 text-secondary opacity-50 small">
                <i class="fa-solid fa-grip-vertical me-1"></i>Kéo để ghép bàn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Connections List -->
    <div class="mt-5 glass-card p-4 rounded-4">
      <h4 class="fw-bold brand-font mb-3">
        <i class="fa-solid fa-link text-danger me-2"></i>Danh Sách Các Cặp Bàn Kề Nhau Có Thể Ghép
      </h4>
      <div v-if="tableStore.connections.length > 0" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Bàn thứ nhất</th>
              <th></th>
              <th>Bàn thứ hai (Kề nhau)</th>
              <th>Ghi chú vị trí</th>
              <th class="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="conn in tableStore.connections" :key="conn._id">
              <td><span class="badge bg-danger px-3 py-2 fs-7">Bàn {{ conn.tableA?.tableNumber }} ({{ conn.tableA?.capacity }} chỗ)</span></td>
              <td class="text-center text-muted fs-5"><i class="fa-solid fa-link"></i></td>
              <td><span class="badge bg-danger px-3 py-2 fs-7">Bàn {{ conn.tableB?.tableNumber }} ({{ conn.tableB?.capacity }} chỗ)</span></td>
              <td class="small text-muted">{{ conn.note || 'Kề sát nhau' }}</td>
              <td class="text-end">
                <button @click="handleDeleteConnection(conn)" class="btn btn-outline-danger btn-sm rounded-pill">
                  <i class="fa-solid fa-trash-can me-1"></i> Gỡ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small mb-0">Chưa có liên kết ghép bàn nào. Hãy kéo thả hoặc tạo liên kết thủ công.</p>
    </div>

    <!-- Connect Tables Modal (fallback thủ công) -->
    <div v-if="showConnectModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">Tạo Liên Kết Bàn Kề Nhau</h5>
            <button @click="showConnectModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Bàn thứ nhất (Nhập số bàn như B01, B02)</label>
              <input v-model="connForm.tableA" type="text" class="form-control text-uppercase" placeholder="Ví dụ: B01" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Bàn thứ hai (Kề sát bàn 1)</label>
              <input v-model="connForm.tableB" type="text" class="form-control text-uppercase" placeholder="Ví dụ: B02" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Ghi chú vị trí</label>
              <input v-model="connForm.note" type="text" class="form-control" placeholder="Ví dụ: 2 bàn sát nhau dãy cửa sổ" />
            </div>
            <div v-if="modalError" class="alert alert-danger small rounded-3">{{ modalError }}</div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showConnectModal = false" class="btn btn-light rounded-pill px-4">Hủy</button>
            <button @click="handleCreateConnection" class="btn btn-warning rounded-pill px-4 fw-bold">Tạo Liên Kết</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Quản Lý Khu Vực -->
    <div v-if="showAreaModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">Quản Lý Khu Vực Bàn Ăn</h5>
            <button @click="showAreaModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2 mb-3">
              <div class="col-8">
                <input v-model="newArea.name" type="text" class="form-control" placeholder="Tên khu vực mới..." />
              </div>
              <div class="col-4">
                <button @click="submitArea" class="btn btn-danger rounded-pill w-100 fw-bold">Thêm</button>
              </div>
            </div>

            <div v-if="areas.length > 0" class="table-responsive">
              <table class="table table-sm align-middle">
                <tbody>
                  <tr v-for="area in areas" :key="area._id">
                    <td><strong class="text-dark">{{ area.name }}</strong></td>
                    <td class="text-end">
                      <button @click="deleteArea(area)" class="btn btn-outline-danger btn-sm rounded-pill">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted small text-center py-2 mb-0">Chưa có khu vực nào</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useTableStore } from "../../stores/tableStore";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const tableStore = useTableStore();
const showConnectModal = ref(false);
const showAreaModal = ref(false);
const modalError = ref("");
const dragTableId = ref(null);
const dropTargetId = ref(null);
const merging = ref(false);

const newArea = reactive({ name: "" });
const areas = computed(() => tableStore.areas);

const connForm = reactive({
  tableA: "",
  tableB: "",
  note: "",
});

const tablesByArea = computed(() => {
  const grouped = {};
  for (const t of tableStore.tables) {
    const areaName = t.area?.name || "Chưa xếp khu vực";
    if (!grouped[areaName]) grouped[areaName] = [];
    grouped[areaName].push(t);
  }
  return grouped;
});

const statusClass = (status) => ({
  "border-success": status === "AVAILABLE",
  "border-warning": status === "RESERVED",
  "border-danger": status === "OCCUPIED",
  "border-secondary": status === "MAINTENANCE",
});

const statusBadgeClass = (status) => ({
  "bg-success": status === "AVAILABLE",
  "bg-warning text-dark": status === "RESERVED",
  "bg-danger": status === "OCCUPIED",
  "bg-secondary": status === "MAINTENANCE",
});

const onDragStart = (table) => {
  dragTableId.value = table._id;
};
const onDragEnd = () => {
  dragTableId.value = null;
  dropTargetId.value = null;
};
const onDragOver = (table) => {
  if (dragTableId.value && dragTableId.value !== table._id) {
    dropTargetId.value = table._id;
  }
};
const onDragLeave = (table) => {
  if (dropTargetId.value === table._id) dropTargetId.value = null;
};
const onDrop = async (target) => {
  const source = tableStore.tables.find((t) => t._id === dragTableId.value);
  dragTableId.value = null;
  dropTargetId.value = null;
  if (!source || source._id === target._id) return;

  merging.value = true;
  try {
    await tableStore.createConnection(source.tableNumber, target.tableNumber, "Kéo thả ghép bàn");
    toast.success(`Đã liên kết ghép bàn ${source.tableNumber} + ${target.tableNumber}`);
  } catch (err) {
    toast.error(err.message);
  } finally {
    merging.value = false;
  }
};

const handleCreateConnection = async () => {
  modalError.value = "";
  try {
    await tableStore.createConnection(connForm.tableA, connForm.tableB, connForm.note);
    toast.success("Tạo liên kết ghép bàn thành công");
    showConnectModal.value = false;
    connForm.tableA = "";
    connForm.tableB = "";
    connForm.note = "";
  } catch (err) {
    modalError.value = err.message;
  }
};

const handleDeleteConnection = async (conn) => {
  if (!confirm(`Gỡ liên kết giữa Bàn ${conn.tableA?.tableNumber} và Bàn ${conn.tableB?.tableNumber}?`)) return;
  try {
    await tableStore.deleteConnection(conn._id);
    toast.success("Đã gỡ liên kết ghép bàn");
  } catch (err) {
    toast.error(err.message);
  }
};

const refreshAll = () => {
  tableStore.fetchTables();
  tableStore.fetchConnections();
  tableStore.fetchAreas();
};

const openAreaModal = () => {
  showAreaModal.value = true;
  tableStore.fetchAreas();
};

const submitArea = async () => {
  if (!newArea.name.trim()) {
    toast.error("Vui lòng nhập tên khu vực");
    return;
  }
  try {
    await api.post("/areas", { name: newArea.name });
    toast.success("Thêm khu vực thành công!");
    newArea.name = "";
    await tableStore.fetchAreas();
  } catch (err) {
    toast.error(err.response?.data?.message || "Thêm khu vực thất bại!");
  }
};

const deleteArea = async (area) => {
  if (!confirm(`Xóa khu vực '${area.name}'?`)) return;
  try {
    await api.delete(`/areas/${area._id}`);
    toast.success("Đã xóa khu vực");
    await tableStore.fetchAreas();
  } catch (err) {
    toast.error(err.response?.data?.message || "Xóa khu vực thất bại!");
  }
};

onMounted(() => {
  refreshAll();
});
</script>

<style scoped>
.table-card {
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.table-card:active {
  cursor: grabbing;
}
.drag-source {
  opacity: 0.55;
  transform: scale(0.97);
}
.drop-target {
  border-color: #ffb300 !important;
  box-shadow: 0 0 0 4px rgba(255, 179, 0, 0.35);
  transform: scale(1.03);
}
</style>
