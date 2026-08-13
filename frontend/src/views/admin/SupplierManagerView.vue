<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Nhà Cung Cấp Thực Phẩm</h2>
        <p class="text-muted small mb-0">Quản lý danh sách nhà cung cấp hải sản Cà Mau và nguyên liệu tươi thô</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="showAddModal = true" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-plus me-1"></i> Thêm Nhà Cung Cấp Mới
        </button>
        <button @click="fetchSuppliers" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="glass-card p-4 rounded-4">
      <div v-if="suppliers.length > 0" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>#</th>
              <th>Tên Nhà Cung Cấp</th>
              <th>Số Điện Thoại</th>
              <th>Email</th>
              <th>Địa Chỉ Thường Trú</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sup, idx) in suppliers" :key="sup._id">
              <td class="fw-bold">{{ idx + 1 }}</td>
              <td>
                <strong class="d-block text-dark">{{ sup.name }}</strong>
                <small class="text-muted">{{ sup.code || 'SUP-00' + (idx + 1) }}</small>
              </td>
              <td><span class="badge bg-light text-dark border"><i class="fa-solid fa-phone text-danger me-1"></i> {{ sup.phone }}</span></td>
              <td><small class="text-secondary">{{ sup.email || 'Chưa cập nhật' }}</small></td>
              <td><small class="text-muted">{{ sup.address || 'Độ Phủ Sóng Miền Tây' }}</small></td>
              <td>
                <span class="badge bg-success rounded-pill px-3 py-1 fs-8">ĐANG HỢP TÁC</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small py-4 text-center mb-0">Chưa có nhà cung cấp nào trong hệ thống</p>
    </div>

    <!-- Modal Thêm Nhà Cung Cấp Mới -->
    <div v-if="showAddModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">Thêm Nhà Cung Cấp Mới</h5>
            <button @click="showAddModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Tên Nhà Cung Cấp <span class="text-danger">*</span></label>
              <input v-model="form.name" type="text" class="form-control" placeholder="Ví dụ: Công ty Cua Cà Mau Tươi" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Số điện thoại liên hệ <span class="text-danger">*</span></label>
              <input v-model="form.phone" type="tel" class="form-control" placeholder="Ví dụ: 0909123456" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Địa chỉ Email</label>
              <input v-model="form.email" type="email" class="form-control" placeholder="supplier@gmail.com" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Địa chỉ kho bãi / trụ sở</label>
              <input v-model="form.address" type="text" class="form-control" placeholder="Ví dụ: 45 Năm Căn, Cà Mau" />
            </div>
            <div v-if="addError" class="alert alert-danger small rounded-3">{{ addError }}</div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showAddModal = false" class="btn btn-light rounded-pill px-4">Hủy</button>
            <button @click="submitCreateSupplier" class="btn btn-danger rounded-pill px-4 fw-bold">Thêm Nhà Cung Cấp</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";

const suppliers = ref([]);
const loading = ref(false);
const showAddModal = ref(false);
const addError = ref("");

const form = reactive({
  name: "",
  phone: "",
  email: "",
  address: "",
});

const fetchSuppliers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/suppliers");
    suppliers.value = res.data.data.suppliers;
  } catch (err) {
    console.error("Lỗi lấy danh sách nhà cung cấp:", err);
  } finally {
    loading.value = false;
  }
};

const submitCreateSupplier = async () => {
  addError.value = "";
  try {
    await api.post("/suppliers", form);
    showAddModal.value = false;
    form.name = "";
    form.phone = "";
    form.email = "";
    form.address = "";
    await fetchSuppliers();
  } catch (err) {
    addError.value = err.response?.data?.message || "Không thể tạo nhà cung cấp!";
  }
};

onMounted(() => {
  fetchSuppliers();
});
</script>
