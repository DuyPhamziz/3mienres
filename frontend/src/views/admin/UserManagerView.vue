<template>
  <div class="user-manager-view">
    <!-- ═══ 1. HEADER ═══ -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-users text-danger me-2"></i>Quản Lý Khách Hàng & Hội Viên
        </h4>
        <p class="text-secondary small mb-0">
          Theo dõi thông tin thực khách, tích lũy điểm hạng thành viên và kiểm soát quyền truy cập/khóa tài khoản.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button @click="fetchCustomerList" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- ═══ 2. KPI SUMMARY STRIP ═══ -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-danger">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Tổng Số Thực Khách</span>
              <h3 class="fw-bold text-dark mb-0">{{ customerStats.totalCustomers || meta.total }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-danger bg-opacity-15 text-danger">
              <i class="fa-solid fa-user-group fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Tài khoản khách hàng đăng ký</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Đang Hoạt Động</span>
              <h3 class="fw-bold text-success mb-0">{{ customerStats.activeCustomers || 0 }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-success bg-opacity-15 text-success">
              <i class="fa-solid fa-user-check fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Có thể đặt bàn & tích điểm</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-secondary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Tài Khoản Đã Khóa</span>
              <h3 class="fw-bold text-danger mb-0">{{ customerStats.lockedCustomers || 0 }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-danger bg-opacity-15 text-danger">
              <i class="fa-solid fa-user-lock fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Bị chặn đăng nhập vào hệ thống</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Tổng Chi Tiêu Tích Lũy</span>
              <h3 class="fw-bold text-danger mb-0">{{ (customerStats.totalCustomerSpent || 0).toLocaleString('vi-VN') }}đ</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-warning bg-opacity-20 text-warning">
              <i class="fa-solid fa-coins fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Doanh thu từ khách hội viên</small>
        </div>
      </div>
    </div>

    <!-- ═══ 3. FILTER BAR ═══ -->
    <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white mb-3">
      <div class="row g-2 align-items-center">
        <div class="col-md-5">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light border-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
            <input
              v-model="filters.search"
              @keyup.enter="fetchCustomerList"
              type="text"
              class="form-control bg-light border-0"
              placeholder="Tìm theo tên khách hàng, email, số điện thoại..."
            />
          </div>
        </div>

        <div class="col-md-3">
          <select v-model="filters.isActive" @change="fetchCustomerList" class="form-select form-select-sm rounded-3">
            <option value="">-- Tất cả trạng thái --</option>
            <option value="true">✅ Đang hoạt động</option>
            <option value="false">🔒 Đã bị khóa</option>
          </select>
        </div>

        <div class="col-md-4 text-md-end">
          <span class="text-muted small">
            Hiển thị <strong>{{ customers.length }}</strong> / <strong>{{ meta.total }}</strong> khách hàng
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ 4. CUSTOMER TABLE ═══ -->
    <div class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden mb-3">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
      </div>

      <div v-else-if="customers.length === 0" class="text-center py-5 text-muted">
        <i class="fa-solid fa-user-slash fs-1 opacity-40 mb-2 d-block"></i>
        Không tìm thấy khách hàng nào phù hợp với bộ lọc.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 240px;">Khách Hàng</th>
              <th style="width: 160px;">Hạng Hội Viên</th>
              <th style="width: 150px;">Tổng Chi Tiêu</th>
              <th style="width: 140px;">Ngày Đăng Ký</th>
              <th style="width: 130px;" class="text-center">Trạng Thái</th>
              <th style="width: 140px;" class="text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c._id" :class="{ 'table-danger-subtle': c.isActive === false }">
              <td>
                <div class="d-flex align-items-center gap-2.5">
                  <div class="p-2 rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0" style="width: 38px; height: 38px;">
                    <i class="fa-solid fa-user fs-7"></i>
                  </div>
                  <div class="min-w-0">
                    <strong class="text-dark d-block text-truncate">{{ c.name }}</strong>
                    <a :href="'tel:' + c.phone" class="text-danger text-decoration-none fw-semibold fs-9 d-block">
                      <i class="fa-solid fa-phone me-1"></i>{{ c.phone }}
                    </a>
                    <small class="text-muted fs-9 d-block text-truncate">{{ c.email }}</small>
                  </div>
                </div>
              </td>

              <td>
                <span v-if="c.rank" class="badge rounded-pill px-2.5 py-1 fs-9 fw-bold bg-warning bg-opacity-20 text-dark">
                  <i class="fa-solid fa-crown text-warning me-1"></i>{{ c.rank?.name || 'Hội Viên' }}
                </span>
                <span v-else class="badge bg-light text-muted border rounded-pill px-2.5 py-1 fs-9">
                  Thành viên mới
                </span>
              </td>

              <td>
                <strong class="text-danger fs-8 d-block">{{ (c.totalSpent || 0).toLocaleString('vi-VN') }}đ</strong>
                <small class="text-muted fs-9">Tích lũy thanh toán</small>
              </td>

              <td>
                <span class="text-secondary fs-8 d-block">{{ new Date(c.createdAt).toLocaleDateString('vi-VN') }}</span>
                <small class="text-muted fs-9">{{ new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</small>
              </td>

              <td class="text-center">
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold shadow-2xs', c.isActive !== false ? 'bg-success bg-opacity-15 text-success' : 'bg-danger text-white']">
                  {{ c.isActive !== false ? '✅ Đang hoạt động' : '🔒 ĐÃ BỊ KHÓA' }}
                </span>
              </td>

              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <!-- Nút Khóa / Mở Khóa Tài Khoản -->
                  <button
                    @click="confirmToggleLock(c)"
                    :class="['btn btn-sm rounded-pill px-2.5 py-1 me-1 fw-bold', c.isActive !== false ? 'btn-outline-danger' : 'btn-success']"
                    :title="c.isActive !== false ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'"
                  >
                    <i :class="c.isActive !== false ? 'fa-solid fa-lock me-1' : 'fa-solid fa-lock-open me-1'"></i>
                    {{ c.isActive !== false ? 'Khóa' : 'Mở Khóa' }}
                  </button>

                  <button
                    @click="openEditCustomerModal(c)"
                    class="btn btn-outline-secondary btn-sm rounded-circle me-1"
                    title="Chỉnh sửa thông tin / Chi tiêu"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>

                  <button
                    @click="confirmDeleteCustomer(c)"
                    class="btn btn-light btn-sm rounded-circle text-danger"
                    title="Xóa tài khoản"
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

    <!-- ═══ MODAL CHỈNH SỬA THÔNG TIN & CHI TIÊU KHÁCH HÀNG ═══ -->
    <div v-if="showEditModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-1">
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-user-pen text-warning me-2"></i>Chỉnh Sửa Khách Hàng
            </h5>
            <button @click="showEditModal = false" type="button" class="btn-close" :disabled="modalSaving"></button>
          </div>

          <div class="modal-body py-3">
            <form @submit.prevent="submitEditCustomer">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark mb-1">Họ và tên *</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="form-control form-control-sm rounded-3"
                  required
                />
              </div>

              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Số điện thoại *</label>
                  <input
                    v-model="editForm.phone"
                    type="tel"
                    class="form-control form-control-sm rounded-3"
                    required
                  />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Tổng chi tiêu (đ)</label>
                  <input
                    v-model.number="editForm.totalSpent"
                    type="number"
                    min="0"
                    step="10000"
                    class="form-control form-control-sm rounded-3"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark mb-1">Ghi chú chăm sóc khách hàng</label>
                <textarea
                  v-model="editForm.notes"
                  class="form-control form-control-sm rounded-3"
                  rows="2"
                  placeholder="Ghi chú sở thích, khẩu vị hoặc lưu ý đặc biệt..."
                ></textarea>
              </div>

              <div v-if="modalError" class="alert alert-danger small py-2 rounded-3 mb-3">
                <i class="fa-solid fa-circle-exclamation me-1"></i>{{ modalError }}
              </div>

              <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button @click="showEditModal = false" type="button" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="modalSaving">
                  Hủy
                </button>
                <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold btn-sm shadow-sm" :disabled="modalSaving">
                  <span v-if="modalSaving" class="spinner-border spinner-border-sm me-1.5"></span>
                  <i v-else class="fa-solid fa-floppy-disk me-1.5"></i>
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM DIALOG MODAL ═══ -->
    <ConfirmModal
      :show="showConfirmDialog"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="Xác nhận"
      cancel-text="Hủy"
      :confirm-variant="confirmVariant"
      :loading="modalSaving"
      @cancel="showConfirmDialog = false"
      @confirm="executeConfirmedAction"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import ConfirmModal from "../../components/common/ConfirmModal.vue";

const customers = ref([]);
const loading = ref(false);
const meta = ref({ page: 1, limit: 15, total: 0, totalPages: 0 });
const customerStats = ref({ totalCustomers: 0, activeCustomers: 0, lockedCustomers: 0, totalCustomerSpent: 0 });

const filters = reactive({
  search: "",
  isActive: "",
});

// Edit Modal State
const showEditModal = ref(false);
const modalSaving = ref(false);
const modalError = ref("");
const editingCustomer = ref(null);

const editForm = reactive({
  name: "",
  phone: "",
  totalSpent: 0,
  notes: "",
});

// Confirm Dialog State
const showConfirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmVariant = ref("danger");
const pendingAction = ref(null);

const fetchCustomerStats = async () => {
  try {
    const res = await api.get("/users/customer-stats");
    customerStats.value = res.data.data;
  } catch (err) {
    console.warn("Lỗi lấy thống kê khách hàng:", err);
  }
};

const fetchCustomerList = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page, limit: 15, role: "customer" };
    if (filters.search) params.search = filters.search.trim();
    if (filters.isActive !== "") params.isActive = filters.isActive;

    const res = await api.get("/users", { params });
    customers.value = res.data.data.users || [];
    meta.value = {
      page: res.data.page || 1,
      limit: res.data.limit || 15,
      total: res.data.total || 0,
      totalPages: res.data.totalPages || 0,
    };
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi tải danh sách khách hàng");
  } finally {
    loading.value = false;
  }
};

const goPage = (p) => {
  if (p < 1 || p > meta.value.totalPages) return;
  fetchCustomerList(p);
};

// ═══ KHÓA / MỞ KHÓA TÀI KHOẢN KHÁCH HÀNG ═══
const confirmToggleLock = (c) => {
  const isLocking = c.isActive !== false;
  confirmTitle.value = isLocking ? "Xác nhận KHÓA tài khoản khách hàng" : "Xác nhận MỞ KHÓA tài khoản khách hàng";
  confirmMessage.value = isLocking
    ? `Bạn có chắc muốn KHÓA tài khoản của thực khách '${c.name}' (${c.phone})? Khách hàng sẽ bị chặn đăng nhập và không thể thực hiện đặt bàn.`
    : `Mở khóa lại tài khoản cho '${c.name}' (${c.phone}) để thực khách tiếp tục đặt bàn và tích điểm?`;
  confirmVariant.value = isLocking ? "danger" : "success";

  pendingAction.value = async () => {
    try {
      await api.patch(`/users/${c._id}`, { isActive: !isLocking });
      c.isActive = !isLocking;
      toast.success(`Đã ${isLocking ? "KHÓA" : "MỞ KHÓA"} tài khoản '${c.name}' thành công!`);
      await fetchCustomerStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };
  showConfirmDialog.value = true;
};

// ═══ CHỈNH SỬA THÔNG TIN & CHI TIÊU ═══
const openEditCustomerModal = (c) => {
  editingCustomer.value = c;
  modalError.value = "";
  Object.assign(editForm, {
    name: c.name || "",
    phone: c.phone || "",
    totalSpent: c.totalSpent || 0,
    notes: c.notes || "",
  });
  showEditModal.value = true;
};

const submitEditCustomer = async () => {
  if (!editingCustomer.value) return;
  modalError.value = "";
  modalSaving.value = true;
  try {
    await api.patch(`/users/${editingCustomer.value._id}`, {
      name: editForm.name,
      phone: editForm.phone,
      totalSpent: editForm.totalSpent,
      notes: editForm.notes,
    });
    toast.success("Cập nhật thông tin khách hàng thành công!");
    showEditModal.value = false;
    await Promise.all([fetchCustomerStats(), fetchCustomerList(meta.value.page)]);
  } catch (err) {
    modalError.value = err.response?.data?.message || "Lỗi lưu thông tin khách hàng";
  } finally {
    modalSaving.value = false;
  }
};

// ═══ XÓA KHÁCH HÀNG ═══
const confirmDeleteCustomer = (c) => {
  confirmTitle.value = "Xác nhận xóa tài khoản";
  confirmMessage.value = `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của khách hàng '${c.name}' (${c.phone})?`;
  confirmVariant.value = "danger";

  pendingAction.value = async () => {
    try {
      await api.delete(`/users/${c._id}`);
      toast.success("Đã xóa tài khoản khách hàng");
      await Promise.all([fetchCustomerStats(), fetchCustomerList(meta.value.page)]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi xóa tài khoản");
    }
  };
  showConfirmDialog.value = true;
};

const executeConfirmedAction = async () => {
  if (pendingAction.value) {
    modalSaving.value = true;
    try {
      await pendingAction.value();
    } finally {
      modalSaving.value = false;
      pendingAction.value = null;
      showConfirmDialog.value = false;
    }
  }
};

onMounted(async () => {
  await Promise.all([fetchCustomerStats(), fetchCustomerList(1)]);
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.table-danger-subtle {
  background-color: #fff5f5 !important;
}
</style>
