<template>
  <div class="supplier-manager-view">
    <!-- ═══ 1. HEADER ═══ -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-truck-field text-danger me-2"></i>Quản Lý Doanh Nghiệp & Nhà Cung Cấp
        </h4>
        <p class="text-secondary small mb-0">
          Quản lý mạng lưới đối tác cung ứng hải sản tươi sống Cà Mau, thịt sạch và nông sản chuẩn 3 miền.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button @click="openAddModal" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm">
          <i class="fa-solid fa-plus me-1"></i> Thêm Nhà Cung Cấp
        </button>
        <button @click="fetchSuppliers" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- ═══ 2. KPI SUMMARY CARDS ═══ -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-danger">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Tổng Số Nhà Cung Cấp</span>
              <h3 class="fw-bold text-dark mb-0">{{ supplierStats.totalSuppliers || suppliers.length }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-danger bg-opacity-15 text-danger">
              <i class="fa-solid fa-building-flag fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">{{ supplierStats.activeSuppliers || 0 }} đối tác đang hợp tác</small>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Đang Hợp Tác Tích Cực</span>
              <h3 class="fw-bold text-success mb-0">{{ supplierStats.activeSuppliers || countActive() }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-success bg-opacity-15 text-success">
              <i class="fa-solid fa-handshake-simple fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Sẵn sàng giao hàng theo ngày</small>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Tổng Giá Trị Nhập Hàng</span>
              <h3 class="fw-bold text-danger mb-0">{{ (supplierStats.totalImportValue || 0).toLocaleString('vi-VN') }}đ</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-warning bg-opacity-20 text-warning">
              <i class="fa-solid fa-receipt fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Từ các phiếu nhập kho đã thực hiện</small>
        </div>
      </div>
    </div>

    <!-- ═══ 3. FILTER BAR ═══ -->
    <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white mb-3">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light border-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
            <input
              v-model="filters.search"
              @keyup.enter="fetchSuppliers"
              type="text"
              class="form-control bg-light border-0"
              placeholder="Tìm theo tên nhà cung cấp, mã, SĐT..."
            />
          </div>
        </div>

        <div class="col-md-3">
          <select v-model="filters.category" @change="fetchSuppliers" class="form-select form-select-sm rounded-3">
            <option value="">-- Tất cả nhóm hàng --</option>
            <option value="SEAFOOD">Hải sản tươi sống (Cua, Tôm, Cá...)</option>
            <option value="MEAT">Thịt tươi sạch (Bò, Heo, Gà...)</option>
            <option value="VEGETABLE">Rau củ quả tươi</option>
            <option value="SPICE">Gia vị & Hương liệu gia truyền</option>
            <option value="BEVERAGE">Nước giải khát & Rượu bia</option>
            <option value="PACKAGING">Bao bì & Vật tư</option>
            <option value="OTHER">Nhóm khác</option>
          </select>
        </div>

        <div class="col-md-2">
          <select v-model="filters.status" @change="fetchSuppliers" class="form-select form-select-sm rounded-3">
            <option value="">-- Trạng thái --</option>
            <option value="active">Đang hợp tác</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </div>

        <div class="col-md-3 text-md-end">
          <span class="text-muted small">
            Hiển thị <strong>{{ suppliers.length }}</strong> / <strong>{{ meta.total }}</strong> nhà cung cấp
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ 4. SUPPLIER TABLE ═══ -->
    <div class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden mb-3">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
      </div>

      <div v-else-if="suppliers.length === 0" class="text-center py-5 text-muted">
        <i class="fa-solid fa-truck-ramp-box fs-1 opacity-40 mb-2 d-block"></i>
        Chưa có nhà cung cấp nào phù hợp với bộ lọc.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 220px;">Nhà Cung Cấp</th>
              <th style="width: 150px;">Nhóm Cung Ứng</th>
              <th style="width: 160px;">Liên Hệ</th>
              <th>Thông Tin Tài Khoản / Thanh Toán</th>
              <th style="width: 100px;" class="text-center">Đánh Giá</th>
              <th style="width: 120px;" class="text-center">Trạng Thái</th>
              <th style="width: 120px;" class="text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sup in suppliers" :key="sup._id">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="p-2 rounded-circle bg-danger bg-opacity-10 text-danger flex-shrink-0" style="width: 38px; height: 38px; text-align: center;">
                    <i class="fa-solid fa-truck-moving fs-7"></i>
                  </div>
                  <div class="min-w-0">
                    <strong class="text-dark d-block text-truncate">{{ sup.name }}</strong>
                    <span class="badge bg-light text-dark border fs-9 px-1.5 py-0.5">
                      {{ sup.supplierCode || 'NCC-00' }}
                    </span>
                    <small class="text-muted fs-9 d-block mt-0.5">{{ sup.address }}</small>
                  </div>
                </div>
              </td>

              <td>
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', categoryBadgeClass(sup.category)]">
                  {{ categoryLabel(sup.category) }}
                </span>
              </td>

              <td>
                <strong class="d-block text-dark">{{ sup.contactPerson || 'Đại diện NCC' }}</strong>
                <a :href="'tel:' + sup.phone" class="text-danger text-decoration-none fw-semibold fs-9 d-block">
                  <i class="fa-solid fa-phone me-1"></i>{{ sup.phone }}
                </a>
                <small class="text-muted fs-9" v-if="sup.email">{{ sup.email }}</small>
              </td>

              <td>
                <div v-if="sup.bankAccountNumber">
                  <strong class="text-dark fs-8">{{ sup.bankName || 'Ngân hàng' }}: {{ sup.bankAccountNumber }}</strong>
                  <small class="text-muted d-block fs-9">{{ sup.bankAccountName || sup.name }}</small>
                </div>
                <span v-else class="text-muted fs-9 fst-italic">Chưa có thông tin chuyển khoản</span>
              </td>

              <td class="text-center">
                <span class="badge bg-warning bg-opacity-20 text-dark rounded-pill px-2 py-1 fw-bold">
                  {{ sup.rating || 5 }} <i class="fa-solid fa-star text-warning fs-9"></i>
                </span>
              </td>

              <td class="text-center">
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', sup.status === 'active' ? 'bg-success bg-opacity-15 text-success' : 'bg-secondary bg-opacity-15 text-secondary']">
                  {{ sup.status === 'active' ? 'Đang hợp tác' : 'Tạm ngưng' }}
                </span>
              </td>

              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button
                    @click="openEditModal(sup)"
                    class="btn btn-outline-secondary btn-sm rounded-circle me-1"
                    title="Chỉnh sửa đối tác"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    @click="handleToggleStatus(sup)"
                    class="btn btn-light btn-sm rounded-circle me-1"
                    :title="sup.status === 'active' ? 'Tạm ngưng hợp tác' : 'Kích hoạt lại'"
                  >
                    <i :class="sup.status === 'active' ? 'fa-solid fa-toggle-on text-success' : 'fa-solid fa-toggle-off text-secondary'"></i>
                  </button>
                  <button
                    @click="confirmDeleteSupplier(sup)"
                    class="btn btn-light btn-sm rounded-circle text-danger"
                    title="Xóa nhà cung cấp"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta.totalPages > 1" class="d-flex justify-content-between align-items-center p-3 border-top">
        <small class="text-muted">Trang {{ meta.page }} / {{ meta.totalPages }}</small>
        <div class="d-flex gap-1">
          <button
            @click="goPage(meta.page - 1)"
            :disabled="meta.page <= 1"
            class="btn btn-sm btn-light rounded-pill px-3"
          >
            Trước
          </button>
          <button
            @click="goPage(meta.page + 1)"
            :disabled="meta.page >= meta.totalPages"
            class="btn btn-sm btn-light rounded-pill px-3"
          >
            Sau
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL THÊM / SỬA NHÀ CUNG CẤP ═══ -->
    <div v-if="showModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 600px;">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-1">
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-truck-field text-warning me-2"></i>
              {{ isEditing ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới' }}
            </h5>
            <button @click="showModal = false" type="button" class="btn-close" :disabled="modalSaving"></button>
          </div>

          <div class="modal-body py-3">
            <form @submit.prevent="submitSupplierForm">
              <div class="row g-2 mb-3">
                <div class="col-sm-4">
                  <label class="form-label small fw-semibold text-dark mb-1">Mã đối tác</label>
                  <input
                    v-model="form.supplierCode"
                    type="text"
                    class="form-control form-control-sm rounded-3 text-uppercase"
                    placeholder="VD: NCC-001"
                  />
                </div>
                <div class="col-sm-8">
                  <label class="form-label small fw-semibold text-dark mb-1">Tên công ty / Doanh nghiệp *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control form-control-sm rounded-3"
                    placeholder="Ví dụ: Vựa Cua Cà Mau Tươi Sống Sáu Đạt"
                    required
                  />
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Người đại diện liên hệ</label>
                  <input
                    v-model="form.contactPerson"
                    type="text"
                    class="form-control form-control-sm rounded-3"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Số điện thoại giao dịch *</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="form-control form-control-sm rounded-3"
                    placeholder="0901234567"
                    required
                  />
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-control form-control-sm rounded-3"
                    placeholder="doitac@gmail.com"
                  />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Nhóm hàng cung ứng</label>
                  <select v-model="form.category" class="form-select form-select-sm rounded-3">
                    <option value="SEAFOOD">Hải sản tươi sống (Cua, Tôm, Cá...)</option>
                    <option value="MEAT">Thịt tươi sạch (Bò, Heo, Gà...)</option>
                    <option value="VEGETABLE">Rau củ quả tươi</option>
                    <option value="SPICE">Gia vị & Hương liệu</option>
                    <option value="BEVERAGE">Nước giải khát & Rượu bia</option>
                    <option value="PACKAGING">Bao bì & Vật tư</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark mb-1">Địa chỉ trụ sở / Vựa hàng *</label>
                <input
                  v-model="form.address"
                  type="text"
                  class="form-control form-control-sm rounded-3"
                  placeholder="Ví dụ: Ấp Cái Nước, Huyện Cái Nước, Tỉnh Cà Mau"
                  required
                />
              </div>

              <!-- Thông tin ngân hàng -->
              <div class="p-3 bg-light rounded-4 border mb-3">
                <h6 class="fw-bold fs-8 text-dark mb-2"><i class="fa-solid fa-building-columns text-danger me-1"></i>Tài Khoản Ngân Hàng Thanh Toán</h6>
                <div class="row g-2">
                  <div class="col-sm-4">
                    <input v-model="form.bankName" type="text" class="form-control form-control-sm rounded-3" placeholder="Tên Ngân Hàng (VD: Vietcombank)" />
                  </div>
                  <div class="col-sm-4">
                    <input v-model="form.bankAccountNumber" type="text" class="form-control form-control-sm rounded-3" placeholder="Số tài khoản" />
                  </div>
                  <div class="col-sm-4">
                    <input v-model="form.bankAccountName" type="text" class="form-control form-control-sm rounded-3" placeholder="Chủ tài khoản" />
                  </div>
                </div>
              </div>

              <div v-if="modalError" class="alert alert-danger small py-2 rounded-3 mb-3">
                <i class="fa-solid fa-circle-exclamation me-1"></i>{{ modalError }}
              </div>

              <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button @click="showModal = false" type="button" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="modalSaving">
                  Hủy
                </button>
                <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold btn-sm shadow-sm" :disabled="modalSaving">
                  <span v-if="modalSaving" class="spinner-border spinner-border-sm me-1.5"></span>
                  <i v-else class="fa-solid fa-floppy-disk me-1.5"></i>
                  {{ isEditing ? 'Lưu Thay Đổi' : 'Thêm Nhà Cung Cấp' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM DELETE MODAL ═══ -->
    <ConfirmModal
      :show="showConfirmDelete"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="Xóa nhà cung cấp"
      cancel-text="Hủy"
      confirm-variant="danger"
      :loading="modalSaving"
      @cancel="showConfirmDelete = false"
      @confirm="executeConfirmedDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import ConfirmModal from "../../components/common/ConfirmModal.vue";

const suppliers = ref([]);
const loading = ref(false);
const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });
const supplierStats = ref({ totalSuppliers: 0, activeSuppliers: 0, totalImportValue: 0 });

const filters = reactive({
  search: "",
  category: "",
  status: "",
});

// Modal State
const showModal = ref(false);
const isEditing = ref(false);
const modalSaving = ref(false);
const modalError = ref("");
const editingId = ref(null);

const form = reactive({
  supplierCode: "",
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  category: "SEAFOOD",
  rating: 5,
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
  status: "active",
  note: "",
});

// Confirm State
const showConfirmDelete = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const pendingDeleteAction = ref(null);

const fetchSupplierStats = async () => {
  try {
    const res = await api.get("/suppliers/stats");
    supplierStats.value = res.data.data;
  } catch (err) {
    console.warn("Lỗi lấy thống kê NCC:", err);
  }
};

const fetchSuppliers = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page, limit: 10 };
    if (filters.search) params.search = filters.search.trim();
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;

    const res = await api.get("/suppliers", { params });
    suppliers.value = res.data.data.suppliers || [];
    meta.value = {
      page: res.data.page || 1,
      limit: res.data.limit || 10,
      total: res.data.total || 0,
      totalPages: res.data.totalPages || 0,
    };
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi tải danh sách nhà cung cấp");
  } finally {
    loading.value = false;
  }
};

const goPage = (p) => {
  if (p < 1 || p > meta.value.totalPages) return;
  fetchSuppliers(p);
};

const countActive = () => suppliers.value.filter((s) => s.status === "active").length;

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  modalError.value = "";
  Object.assign(form, {
    supplierCode: `NCC-${String(suppliers.value.length + 1).padStart(3, "0")}`,
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    category: "SEAFOOD",
    rating: 5,
    bankName: "Vietcombank",
    bankAccountNumber: "",
    bankAccountName: "",
    status: "active",
    note: "",
  });
  showModal.value = true;
};

const openEditModal = (sup) => {
  isEditing.value = true;
  editingId.value = sup._id;
  modalError.value = "";
  Object.assign(form, {
    supplierCode: sup.supplierCode || "",
    name: sup.name || "",
    contactPerson: sup.contactPerson || "",
    phone: sup.phone || "",
    email: sup.email || "",
    address: sup.address || "",
    category: sup.category || "SEAFOOD",
    rating: sup.rating || 5,
    bankName: sup.bankName || "",
    bankAccountNumber: sup.bankAccountNumber || "",
    bankAccountName: sup.bankAccountName || "",
    status: sup.status || "active",
    note: sup.note || "",
  });
  showModal.value = true;
};

const submitSupplierForm = async () => {
  modalError.value = "";
  modalSaving.value = true;
  try {
    if (isEditing.value) {
      await api.patch(`/suppliers/${editingId.value}`, form);
      toast.success("Cập nhật thông tin nhà cung cấp thành công!");
    } else {
      await api.post("/suppliers", form);
      toast.success("Thêm nhà cung cấp mới thành công!");
    }
    showModal.value = false;
    await Promise.all([fetchSupplierStats(), fetchSuppliers(meta.value.page)]);
  } catch (err) {
    modalError.value = err.response?.data?.message || "Lỗi lưu nhà cung cấp";
  } finally {
    modalSaving.value = false;
  }
};

const handleToggleStatus = async (sup) => {
  const newStatus = sup.status === "active" ? "inactive" : "active";
  try {
    await api.patch(`/suppliers/${sup._id}`, { status: newStatus });
    sup.status = newStatus;
    toast.success(`Đã chuyển trạng thái đối tác sang ${newStatus === "active" ? "ĐANG HỢP TÁC" : "TẠM NGƯNG"}`);
    await fetchSupplierStats();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
  }
};

const confirmDeleteSupplier = (sup) => {
  confirmTitle.value = "Xác nhận xóa nhà cung cấp";
  confirmMessage.value = `Bạn có chắc chắn muốn xóa đối tác '${sup.name}' (${sup.phone})?`;
  pendingDeleteAction.value = async () => {
    try {
      await api.delete(`/suppliers/${sup._id}`);
      toast.success("Đã xóa nhà cung cấp thành công");
      await Promise.all([fetchSupplierStats(), fetchSuppliers(meta.value.page)]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi xóa nhà cung cấp");
    }
  };
  showConfirmDelete.value = true;
};

const executeConfirmedDelete = async () => {
  if (pendingDeleteAction.value) {
    modalSaving.value = true;
    try {
      await pendingDeleteAction.value();
    } finally {
      modalSaving.value = false;
      pendingDeleteAction.value = null;
      showConfirmDelete.value = false;
    }
  }
};

// ═══ HELPERS ═══
const categoryLabel = (cat) => {
  const map = {
    SEAFOOD: "Hải Sản Tươi Sống",
    MEAT: "Thịt Tươi Sạch",
    VEGETABLE: "Rau Củ Quả Tươi",
    SPICE: "Gia Vị & Nước Chấm",
    BEVERAGE: "Nước Giải Khát & Rượu",
    PACKAGING: "Bao Bì & Vật Tư",
    OTHER: "Nhóm Khác",
  };
  return map[cat] || cat || "Hải Sản";
};

const categoryBadgeClass = (cat) => {
  switch (cat) {
    case "SEAFOOD": return "bg-danger bg-opacity-15 text-danger";
    case "MEAT": return "bg-primary bg-opacity-15 text-primary";
    case "VEGETABLE": return "bg-success bg-opacity-15 text-success";
    case "SPICE": return "bg-warning bg-opacity-20 text-dark";
    default: return "bg-secondary bg-opacity-15 text-secondary";
  }
};

onMounted(async () => {
  await Promise.all([fetchSupplierStats(), fetchSuppliers(1)]);
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
