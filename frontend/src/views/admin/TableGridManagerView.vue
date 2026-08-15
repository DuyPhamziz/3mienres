<template>
  <div>
    <!-- ═══ 1. HEADER ═══ -->
    <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
      <div>
        <h5 class="fw-bold brand-font mb-0" style="font-size: 1.1rem">
          <i class="fa-solid fa-grip text-danger me-2"></i>Sơ Đồ Bàn & Ghép Bàn
        </h5>
        <p class="text-muted mb-0" style="font-size: 0.72rem">
          Kéo thả bàn lên bàn khác để tạo liên kết ghép bàn tự động, hoặc quản lý bàn & khu vực
        </p>
      </div>
      <div class="d-flex gap-1 flex-wrap">
        <button @click="openCreateTableModal" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold" style="font-size: 0.72rem">
          <i class="fa-solid fa-plus me-1"></i>Thêm Bàn Mới
        </button>
        <button @click="openAreaModal" class="btn btn-outline-primary btn-sm rounded-pill px-2 fw-bold" style="font-size: 0.7rem">
          <i class="fa-solid fa-map-pin me-1"></i>Khu Vực
        </button>
        <button @click="showConnectModal = true" class="btn btn-outline-warning btn-sm rounded-pill px-2 fw-bold text-dark" style="font-size: 0.7rem">
          <i class="fa-solid fa-puzzle-piece me-1"></i>Liên Kết Thủ Công
        </button>
        <button @click="refreshAll" class="btn btn-outline-secondary btn-sm rounded-pill px-2" style="font-size: 0.7rem">
          <i class="fa-solid fa-rotate me-1"></i>Làm mới
        </button>
      </div>
    </div>

    <!-- ═══ 2. STATUS LEGEND ═══ -->
    <div class="d-flex gap-3 align-items-center mb-2 px-1 flex-wrap" style="font-size: 0.68rem">
      <span class="text-muted fw-bold">Trạng thái:</span>
      <span class="d-flex align-items-center gap-1"><span class="legend-dot" style="background:#22c55e"></span>Trống</span>
      <span class="d-flex align-items-center gap-1"><span class="legend-dot" style="background:#f59e0b"></span>Đã đặt</span>
      <span class="d-flex align-items-center gap-1"><span class="legend-dot" style="background:#ef4444"></span>Đang dùng</span>
      <span class="d-flex align-items-center gap-1"><span class="legend-dot" style="background:#6b7280"></span>Bảo trì</span>
      <span class="text-muted ms-auto fst-italic">💡 Kéo bàn này thả vào bàn khác để ghép bàn nhanh</span>
    </div>

    <!-- ═══ 3. LOADING ═══ -->
    <div v-if="tableStore.loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-danger" role="status"></div>
    </div>

    <!-- ═══ 4. FLOOR PLAN (Compact Grid) ═══ -->
    <div v-else>
      <div v-for="(areaTables, areaName) in tablesByArea" :key="areaName" class="mb-3">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="fw-bold text-dark mb-0" style="font-size: 0.8rem">
            <i class="fa-solid fa-map-pin text-danger me-1" style="font-size: 0.7rem"></i>{{ areaName }}
            <span class="text-muted fw-normal ms-1" style="font-size: 0.65rem">({{ areaTables.length }} bàn)</span>
          </h6>
        </div>
        <div class="row g-2">
          <div v-for="table in areaTables" :key="table._id" class="col-xxl-2 col-xl-2 col-lg-3 col-md-4 col-sm-6">
            <TableCard
              :table="table"
              :connectedNumbers="connectedNumbers(table._id)"
              :isDragSource="dragTableId === table._id"
              :isDropTarget="dropTargetId === table._id"
              :dragSourceNumber="dragSourceTable?.tableNumber || ''"
              @drag-start="onDragStart"
              @drag-end="onDragEnd"
              @drag-over="onDragOver"
              @drag-leave="onDragLeave"
              @drop="onDrop"
              @edit="openEditTableModal"
              @delete="handleDeleteTable"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 5. NETWORK GRAPH (SVG) ═══ -->
    <div v-if="tableStore.connections.length > 0" class="glass-card rounded-3 p-3 mb-3">
      <h6 class="fw-bold mb-2" style="font-size: 0.8rem">
        <i class="fa-solid fa-diagram-project text-danger me-1"></i>Sơ Đồ Mạng Liên Kết Ghép Bàn
        <span class="text-muted fw-normal ms-1" style="font-size: 0.62rem">(hover để xem liên kết)</span>
      </h6>
      <TableNetworkGraph :tables="tableStore.tables" :connections="tableStore.connections" />
    </div>

    <!-- ═══ 6. CONNECTIONS TABLE ═══ -->
    <div class="glass-card rounded-3 p-3 mb-3">
      <h6 class="fw-bold mb-2" style="font-size: 0.8rem">
        <i class="fa-solid fa-link text-danger me-1"></i>Danh Sách Cặp Bàn Ghép
        <span v-if="tableStore.connections.length" class="badge bg-danger bg-opacity-10 text-danger rounded-pill ms-1" style="font-size: 0.6rem">
          {{ tableStore.connections.length }}
        </span>
      </h6>
      <div v-if="tableStore.connections.length > 0" class="table-responsive">
        <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.7rem">
          <thead>
            <tr class="text-muted" style="font-size: 0.65rem">
              <th>Bàn A</th>
              <th class="text-center" style="width: 28px"></th>
              <th>Bàn B</th>
              <th>Ghi chú</th>
              <th class="text-end" style="width: 50px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="conn in tableStore.connections" :key="conn._id">
              <td><span class="conn-badge">{{ conn.tableA?.tableNumber }} ({{ conn.tableA?.capacity }} chỗ)</span></td>
              <td class="text-center text-muted"><i class="fa-solid fa-link" style="font-size: 0.55rem"></i></td>
              <td><span class="conn-badge">{{ conn.tableB?.tableNumber }} ({{ conn.tableB?.capacity }} chỗ)</span></td>
              <td class="text-muted" style="font-size: 0.65rem">{{ conn.note || 'Kề sát nhau' }}</td>
              <td class="text-end">
                <button @click="handleDeleteConnection(conn)" class="btn btn-outline-danger rounded-pill px-2 py-0" style="font-size: 0.6rem" title="Gỡ liên kết">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted mb-0" style="font-size: 0.7rem">
        Chưa có liên kết nào. Hãy kéo thả các ô bàn lên nhau để ghép bàn nhanh.
      </p>
    </div>

    <!-- ═══ 7. CREATE / EDIT TABLE MODAL ═══ -->
    <div v-if="showTableModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 p-2 shadow">
          <div class="modal-header border-0 pb-1">
            <h6 class="modal-title fw-bold brand-font text-danger" style="font-size: 0.9rem">
              <i :class="isEditingTable ? 'fa-pen-to-square' : 'fa-plus'" class="fa-solid me-1"></i>
              {{ isEditingTable ? 'Cập Nhật Bàn Ăn' : 'Thêm Bàn Ăn Mới' }}
            </h6>
            <button @click="showTableModal = false" type="button" class="btn-close btn-close-sm"></button>
          </div>
          <div class="modal-body py-1" style="font-size: 0.78rem">
            <div class="mb-2">
              <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Số bàn / Mã bàn <span class="text-danger">*</span></label>
              <input v-model="tableForm.tableNumber" type="text" class="form-control form-control-sm text-uppercase" placeholder="VD: B09, VIP04" required style="font-size: 0.75rem" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Sức chứa (số khách) <span class="text-danger">*</span></label>
              <input v-model.number="tableForm.capacity" type="number" min="1" max="20" class="form-control form-control-sm" placeholder="VD: 4" required style="font-size: 0.75rem" />
              <div class="text-muted" style="font-size: 0.62rem">Quy định từ 1 đến 20 chỗ</div>
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Khu vực <span class="text-danger">*</span></label>
              <select v-model="tableForm.area" class="form-select form-select-sm" style="font-size: 0.75rem" required>
                <option value="" disabled>-- Chọn khu vực --</option>
                <option v-for="area in areas" :key="area._id" :value="area._id">
                  {{ area.name }}
                </option>
              </select>
            </div>
            <div v-if="isEditingTable" class="mb-2">
              <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Trạng thái bàn</label>
              <select v-model="tableForm.status" class="form-select form-select-sm" style="font-size: 0.75rem">
                <option value="AVAILABLE">Trống (Sẵn sàng)</option>
                <option value="RESERVED">Đã đặt trước</option>
                <option value="OCCUPIED">Đang dùng bữa</option>
                <option value="MAINTENANCE">Bảo trì / Tạm ngưng</option>
              </select>
            </div>
            <div v-if="tableModalError" class="alert alert-danger small rounded-3 py-1 px-2 mb-0" style="font-size: 0.7rem">
              {{ tableModalError }}
            </div>
          </div>
          <div class="modal-footer border-0 pt-1">
            <button @click="showTableModal = false" class="btn btn-light btn-sm rounded-pill px-3" style="font-size: 0.72rem">Hủy</button>
            <button @click="handleSubmitTable" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold" style="font-size: 0.72rem">
              <i class="fa-solid fa-check me-1"></i>{{ isEditingTable ? 'Lưu Thay Đổi' : 'Tạo Bàn' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 8. CONNECT MODAL (Manual) ═══ -->
    <div v-if="showConnectModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 p-2 shadow">
          <div class="modal-header border-0 pb-1">
            <h6 class="modal-title fw-bold brand-font text-danger" style="font-size: 0.9rem">Tạo Liên Kết Bàn</h6>
            <button @click="showConnectModal = false" type="button" class="btn-close btn-close-sm"></button>
          </div>
          <div class="modal-body py-1" style="font-size: 0.78rem">
            <div class="mb-2">
              <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Bàn thứ nhất</label>
              <input v-model="connForm.tableA" type="text" class="form-control form-control-sm text-uppercase" placeholder="VD: B01" style="font-size: 0.75rem" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Bàn thứ hai (kề bàn 1)</label>
              <input v-model="connForm.tableB" type="text" class="form-control form-control-sm text-uppercase" placeholder="VD: B02" style="font-size: 0.75rem" />
            </div>
            <div class="mb-2">
              <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Ghi chú vị trí</label>
              <input v-model="connForm.note" type="text" class="form-control form-control-sm" placeholder="VD: 2 bàn sát nhau dãy cửa sổ" style="font-size: 0.75rem" />
            </div>
            <div v-if="connModalError" class="alert alert-danger small rounded-3 py-1 px-2 mb-0" style="font-size: 0.7rem">{{ connModalError }}</div>
          </div>
          <div class="modal-footer border-0 pt-1">
            <button @click="showConnectModal = false" class="btn btn-light btn-sm rounded-pill px-3" style="font-size: 0.72rem">Hủy</button>
            <button @click="handleCreateConnection" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold" style="font-size: 0.72rem">
              <i class="fa-solid fa-link me-1"></i>Tạo Liên Kết
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 9. AREA MODAL ═══ -->
    <div v-if="showAreaModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content rounded-4 p-2 shadow">
          <div class="modal-header border-0 pb-1">
            <h6 class="modal-title fw-bold brand-font text-danger" style="font-size: 0.9rem">Quản Lý Khu Vực</h6>
            <button @click="showAreaModal = false" type="button" class="btn-close btn-close-sm"></button>
          </div>
          <div class="modal-body py-1" style="font-size: 0.78rem">
            <div class="row g-2 mb-2">
              <div class="col-8">
                <input v-model="newArea.name" type="text" class="form-control form-control-sm" placeholder="Tên khu vực mới..." style="font-size: 0.75rem" />
              </div>
              <div class="col-4">
                <button @click="submitArea" class="btn btn-danger btn-sm rounded-pill w-100 fw-bold" style="font-size: 0.72rem">Thêm</button>
              </div>
            </div>
            <div v-if="areas.length > 0">
              <div v-for="area in areas" :key="area._id" class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size: 0.75rem">
                <strong class="text-dark">{{ area.name }}</strong>
                <button @click="deleteArea(area)" class="btn btn-outline-danger rounded-pill px-2 py-0" style="font-size: 0.6rem" title="Xóa khu vực">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
            <p v-else class="text-muted small text-center py-2 mb-0" style="font-size: 0.7rem">Chưa có khu vực nào</p>
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
import TableCard from "../../components/admin/TableCard.vue";
import TableNetworkGraph from "../../components/admin/TableNetworkGraph.vue";

const tableStore = useTableStore();

// Modals State
const showConnectModal = ref(false);
const showAreaModal = ref(false);
const showTableModal = ref(false);
const isEditingTable = ref(false);
const editingTableId = ref(null);

const connModalError = ref("");
const tableModalError = ref("");

// Drag & Drop State
const dragTableId = ref(null);
const dropTargetId = ref(null);

// Forms
const newArea = reactive({ name: "" });
const connForm = reactive({ tableA: "", tableB: "", note: "" });
const tableForm = reactive({
  tableNumber: "",
  capacity: 4,
  area: "",
  status: "AVAILABLE",
});

// Computed Properties
const areas = computed(() => tableStore.areas);

const dragSourceTable = computed(() =>
  tableStore.tables.find((t) => t._id === dragTableId.value)
);

const tablesByArea = computed(() => {
  const grouped = {};
  for (const t of tableStore.tables) {
    const name = t.area?.name || "Chưa xếp khu vực";
    (grouped[name] ||= []).push(t);
  }
  return grouped;
});

const connectionMap = computed(() => {
  const map = new Map();
  tableStore.connections.forEach((c) => {
    const a = c.tableA?._id || c.tableA;
    const b = c.tableB?._id || c.tableB;
    (map.has(a) ? map.get(a) : map.set(a, []).get(a)).push(c.tableB?.tableNumber || b);
    (map.has(b) ? map.get(b) : map.set(b, []).get(b)).push(c.tableA?.tableNumber || a);
  });
  return map;
});
const connectedNumbers = (id) => connectionMap.value.get(id) || [];

// ── Drag & Drop Handlers ──
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
  if (dropTargetId.value === table._id) {
    dropTargetId.value = null;
  }
};

const onDrop = async (target) => {
  const source = tableStore.tables.find((t) => t._id === dragTableId.value);
  dragTableId.value = null;
  dropTargetId.value = null;

  if (!source || source._id === target._id) return;

  try {
    await tableStore.createConnection(source.tableNumber, target.tableNumber, "Kéo thả ghép bàn");
    toast.success(`Đã ghép bàn ${source.tableNumber} + ${target.tableNumber}`);
  } catch (err) {
    toast.error(err.message);
  }
};

// ── Table CRUD Handlers ──
const openCreateTableModal = () => {
  isEditingTable.value = false;
  editingTableId.value = null;
  tableModalError.value = "";
  Object.assign(tableForm, {
    tableNumber: "",
    capacity: 4,
    area: areas.value.length > 0 ? areas.value[0]._id : "",
    status: "AVAILABLE",
  });
  showTableModal.value = true;
};

const openEditTableModal = (table) => {
  isEditingTable.value = true;
  editingTableId.value = table._id;
  tableModalError.value = "";
  Object.assign(tableForm, {
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    area: table.area?._id || table.area || (areas.value.length > 0 ? areas.value[0]._id : ""),
    status: table.status || "AVAILABLE",
  });
  showTableModal.value = true;
};

const handleSubmitTable = async () => {
  tableModalError.value = "";
  if (!tableForm.tableNumber.trim()) {
    tableModalError.value = "Vui lòng nhập số bàn / mã bàn";
    return;
  }
  if (!tableForm.capacity || tableForm.capacity < 1 || tableForm.capacity > 20) {
    tableModalError.value = "Sức chứa phải từ 1 đến 20 khách";
    return;
  }
  if (!tableForm.area) {
    tableModalError.value = "Vui lòng chọn khu vực";
    return;
  }

  try {
    if (isEditingTable.value) {
      await tableStore.updateTable(editingTableId.value, {
        tableNumber: tableForm.tableNumber.trim().toUpperCase(),
        capacity: Number(tableForm.capacity),
        area: tableForm.area,
        status: tableForm.status,
      });
      toast.success("Cập nhật bàn ăn thành công");
    } else {
      await tableStore.createTable({
        tableNumber: tableForm.tableNumber.trim().toUpperCase(),
        capacity: Number(tableForm.capacity),
        area: tableForm.area,
      });
      toast.success("Tạo bàn ăn mới thành công");
    }
    showTableModal.value = false;
  } catch (err) {
    tableModalError.value = err.message;
  }
};

const handleDeleteTable = async (table) => {
  if (!confirm(`Bạn có chắc muốn xóa bàn ${table.tableNumber} (${table.capacity} chỗ)?`)) return;
  try {
    await tableStore.deleteTable(table._id);
    toast.success(`Đã xóa bàn ${table.tableNumber}`);
  } catch (err) {
    toast.error(err.message);
  }
};

// ── Connection Handlers ──
const handleCreateConnection = async () => {
  connModalError.value = "";
  try {
    await tableStore.createConnection(connForm.tableA, connForm.tableB, connForm.note);
    toast.success("Tạo liên kết thành công");
    showConnectModal.value = false;
    Object.assign(connForm, { tableA: "", tableB: "", note: "" });
  } catch (err) {
    connModalError.value = err.message;
  }
};

const handleDeleteConnection = async (conn) => {
  if (!confirm(`Gỡ liên kết Bàn ${conn.tableA?.tableNumber} ↔ ${conn.tableB?.tableNumber}?`)) return;
  try {
    await tableStore.deleteConnection(conn._id);
    toast.success("Đã gỡ liên kết");
  } catch (err) {
    toast.error(err.message);
  }
};

// ── Area Handlers ──
const openAreaModal = () => {
  showAreaModal.value = true;
  tableStore.fetchAreas();
};

const submitArea = async () => {
  if (!newArea.name.trim()) { toast.error("Vui lòng nhập tên khu vực"); return; }
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

// ── Lifecycle ──
const refreshAll = () => {
  tableStore.fetchTables();
  tableStore.fetchConnections();
  tableStore.fetchAreas();
};

onMounted(refreshAll);
</script>

<style scoped>
.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.conn-badge {
  display: inline-block;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.65rem;
  font-weight: 600;
}
</style>
