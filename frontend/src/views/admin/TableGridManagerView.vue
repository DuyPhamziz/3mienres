<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Sơ Đồ Bàn Ăn & Ma Trận Ghép Bàn</h2>
        <p class="text-muted small mb-0">Theo dõi trạng thái từng bàn và thiết lập liên kết kề nhau để ghép bàn tự động</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="showConnectModal = true" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-puzzle-piece me-1"></i> Liên Kết Ghép Bàn Kề Nhau
        </button>
        <button @click="tableStore.fetchTables()" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
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

    <!-- Tables Grid by Area -->
    <div v-if="tableStore.loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="row g-4">
      <div v-for="table in tableStore.tables" :key="table._id" class="col-md-3 col-sm-6">
        <div
          :class="[
            'glass-card p-4 rounded-4 hover-lift text-center position-relative border-2',
            table.status === 'AVAILABLE' ? 'border-success' : table.status === 'RESERVED' ? 'border-warning' : table.status === 'OCCUPIED' ? 'border-danger' : 'border-secondary'
          ]"
        >
          <span
            :class="[
              'position-absolute top-0 end-0 m-3 badge rounded-pill fs-8',
              table.status === 'AVAILABLE' ? 'bg-success' : table.status === 'RESERVED' ? 'bg-warning text-dark' : table.status === 'OCCUPIED' ? 'bg-danger' : 'bg-secondary'
            ]"
          >
            {{ table.status }}
          </span>

          <div class="my-3">
            <i class="fa-solid fa-chair display-4 text-danger d-block"></i>
          </div>
          <h3 class="fw-bold brand-font mb-1">Bàn {{ table.tableNumber }}</h3>
          <p class="text-muted small mb-2">Sức chứa: {{ table.capacity }} người</p>
          <small class="badge bg-light text-dark border">{{ table.area?.name || 'Chưa xếp khu vực' }}</small>
        </div>
      </div>
    </div>

    <!-- Table Connections List Table -->
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="conn in tableStore.connections" :key="conn._id">
              <td><span class="badge bg-danger px-3 py-2 fs-7">Bàn {{ conn.tableA?.tableNumber }} ({{ conn.tableA?.capacity }} chỗ)</span></td>
              <td class="text-center text-muted fs-5"><i class="fa-solid fa-link"></i></td>
              <td><span class="badge bg-danger px-3 py-2 fs-7">Bàn {{ conn.tableB?.tableNumber }} ({{ conn.tableB?.capacity }} chỗ)</span></td>
              <td class="small text-muted">{{ conn.note || 'Kề sát nhau' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small mb-0">Chưa có liên kết ghép bàn nào được tạo</p>
    </div>

    <!-- Connect Tables Modal -->
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useTableStore } from "../../stores/tableStore";

const tableStore = useTableStore();
const showConnectModal = ref(false);
const modalError = ref("");

const connForm = reactive({
  tableA: "",
  tableB: "",
  note: "",
});

const handleCreateConnection = async () => {
  modalError.value = "";
  try {
    await tableStore.createConnection(connForm.tableA, connForm.tableB, connForm.note);
    showConnectModal.value = false;
    connForm.tableA = "";
    connForm.tableB = "";
    connForm.note = "";
  } catch (err) {
    modalError.value = err.message;
  }
};

onMounted(() => {
  tableStore.fetchTables();
  tableStore.fetchConnections();
  tableStore.fetchAreas();
});
</script>
