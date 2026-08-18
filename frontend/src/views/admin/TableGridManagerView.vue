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
      <span class="d-flex align-items-center gap-1"><span class="legend-dot" style="background:#f59e0b"></span>Sắp đón khách (Đặt trước)</span>
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

    <!-- ═══ 7. MODALS ═══ -->
    <TableFormModal
      v-if="showTableModal"
      :initialData="tableFormData"
      :areas="areas"
      :isEditing="isEditingTable"
      :error="tableModalError"
      @close="showTableModal = false"
      @submit="handleSubmitTable"
    />

    <AreaManageModal
      v-if="showAreaModal"
      :areas="areas"
      @close="showAreaModal = false"
      @add="submitArea"
      @delete="deleteArea"
    />

    <ManualConnectModal
      v-if="showConnectModal"
      :error="connModalError"
      @close="showConnectModal = false"
      @submit="handleCreateConnection"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useTableStore } from "../../stores/tableStore";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import TableCard from "../../components/admin/TableCard.vue";
import TableNetworkGraph from "../../components/admin/TableNetworkGraph.vue";
import TableFormModal from "../../components/admin/table/TableFormModal.vue";
import AreaManageModal from "../../components/admin/table/AreaManageModal.vue";
import ManualConnectModal from "../../components/admin/table/ManualConnectModal.vue";

const tableStore = useTableStore();

const showConnectModal = ref(false);
const showAreaModal = ref(false);
const showTableModal = ref(false);
const isEditingTable = ref(false);
const editingTableId = ref(null);

const connModalError = ref("");
const tableModalError = ref("");

const dragTableId = ref(null);
const dropTargetId = ref(null);

const tableFormData = reactive({
  tableNumber: "",
  capacity: 4,
  area: "",
  status: "AVAILABLE",
});

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

// Drag & Drop
const onDragStart = (table) => { dragTableId.value = table._id; };
const onDragEnd = () => { dragTableId.value = null; dropTargetId.value = null; };
const onDragOver = (table) => {
  if (dragTableId.value && dragTableId.value !== table._id) dropTargetId.value = table._id;
};
const onDragLeave = (table) => {
  if (dropTargetId.value === table._id) dropTargetId.value = null;
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

// Table Modal
const openCreateTableModal = () => {
  isEditingTable.value = false;
  editingTableId.value = null;
  tableModalError.value = "";
  Object.assign(tableFormData, {
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
  Object.assign(tableFormData, {
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    area: table.area?._id || table.area || (areas.value.length > 0 ? areas.value[0]._id : ""),
    status: table.status || "AVAILABLE",
  });
  showTableModal.value = true;
};

const handleSubmitTable = async (form) => {
  tableModalError.value = "";
  if (!form.tableNumber.trim()) { tableModalError.value = "Vui lòng nhập số bàn / mã bàn"; return; }
  if (!form.capacity || form.capacity < 1 || form.capacity > 20) { tableModalError.value = "Sức chứa phải từ 1 đến 20 khách"; return; }
  if (!form.area) { tableModalError.value = "Vui lòng chọn khu vực"; return; }

  try {
    if (isEditingTable.value) {
      await tableStore.updateTable(editingTableId.value, {
        tableNumber: form.tableNumber.trim().toUpperCase(),
        capacity: Number(form.capacity),
        area: form.area,
        status: form.status,
      });
      toast.success("Cập nhật bàn ăn thành công");
    } else {
      await tableStore.createTable({
        tableNumber: form.tableNumber.trim().toUpperCase(),
        capacity: Number(form.capacity),
        area: form.area,
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

// Connection
const handleCreateConnection = async (form) => {
  connModalError.value = "";
  try {
    await tableStore.createConnection(form.tableA, form.tableB, form.note);
    toast.success("Tạo liên kết thành công");
    showConnectModal.value = false;
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

// Area
const openAreaModal = () => {
  showAreaModal.value = true;
  tableStore.fetchAreas();
};

const submitArea = async (name) => {
  try {
    await api.post("/areas", { name });
    toast.success("Thêm khu vực thành công!");
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
