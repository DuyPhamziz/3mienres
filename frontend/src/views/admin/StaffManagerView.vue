<template>
  <div class="staff-manager-view">
    <!-- ═══ 1. HEADER ═══ -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-users-gear text-danger me-2"></i>Quản Lý Nhân Sự & Phân Quyền
        </h4>
        <p class="text-secondary small mb-0">
          Quản lý danh sách nhân viên, phân công bộ phận, ca làm việc và cấp quyền truy cập hệ thống.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button @click="openAddStaffModal" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm">
          <i class="fa-solid fa-user-plus me-1"></i> Thêm Nhân Sự Mới
        </button>
        <button @click="fetchStaffList" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
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
              <span class="text-muted fs-8 d-block mb-1">Tổng Nhân Sự</span>
              <h3 class="fw-bold text-dark mb-0">{{ staffStats.totalStaff || users.length }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-danger bg-opacity-15 text-danger">
              <i class="fa-solid fa-users fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">{{ staffStats.activeStaff || 0 }} nhân sự đang hoạt động</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-primary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Ban Quản Lý</span>
              <h3 class="fw-bold text-primary mb-0">{{ staffStats.managers || countRole('manager') }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-primary bg-opacity-15 text-primary">
              <i class="fa-solid fa-user-tie fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Giám sát & Quản lý ca</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Bộ Phận Bếp (KDS)</span>
              <h3 class="fw-bold text-warning mb-0">{{ staffStats.kitchenStaff || countDept('KITCHEN') }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-warning bg-opacity-15 text-warning">
              <i class="fa-solid fa-fire-burner fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Đầu bếp & Phụ bếp 3 Miền</small>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white h-100 border-start border-4 border-success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted fs-8 d-block mb-1">Bộ Phận Phục Vụ / POS</span>
              <h3 class="fw-bold text-success mb-0">{{ staffStats.serviceStaff || countDept('SERVICE') }}</h3>
            </div>
            <div class="p-2.5 rounded-circle bg-success bg-opacity-15 text-success">
              <i class="fa-solid fa-bell-concierge fs-5"></i>
            </div>
          </div>
          <small class="text-muted fs-9 mt-2 d-block">Tiếp tân, Order & Thu ngân</small>
        </div>
      </div>
    </div>

    <!-- ═══ 3. FILTER BAR ═══ -->
    <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white mb-3">
      <div class="row g-2 align-items-center">
        <div class="col-md-3">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light border-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
            <input
              v-model="filters.search"
              @keyup.enter="fetchStaffList"
              type="text"
              class="form-control bg-light border-0"
              placeholder="Tìm theo tên, email, sđt..."
            />
          </div>
        </div>

        <div class="col-md-2">
          <select v-model="filters.role" @change="fetchStaffList" class="form-select form-select-sm rounded-3">
            <option value="">-- Tất cả vai trò --</option>
            <option value="staff">Nhân viên (Staff)</option>
            <option value="manager">Quản lý (Manager)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>

        <div class="col-md-2">
          <select v-model="filters.department" @change="fetchStaffList" class="form-select form-select-sm rounded-3">
            <option value="">-- Tất cả bộ phận --</option>
            <option value="MANAGEMENT">Ban Quản Lý</option>
            <option value="SERVICE">Tiếp Tân & Phục Vụ</option>
            <option value="KITCHEN">Nhà Bếp (Kitchen)</option>
            <option value="CASHIER">Thu Ngân</option>
            <option value="WAREHOUSE">Thủ Kho Nguyên Liệu</option>
            <option value="GENERAL">Chung / Toàn diện</option>
          </select>
        </div>

        <div class="col-md-2">
          <select v-model="filters.shift" @change="fetchStaffList" class="form-select form-select-sm rounded-3">
            <option value="">-- Tất cả ca làm --</option>
            <option value="MORNING">Ca Sáng (06h - 14h)</option>
            <option value="AFTERNOON">Ca Chiều (14h - 22h)</option>
            <option value="EVENING">Ca Tối (18h - 23h)</option>
            <option value="FULLTIME">Toàn thời gian (Full-time)</option>
          </select>
        </div>

        <div class="col-md-3 text-md-end">
          <span class="text-muted small">
            Hiển thị <strong>{{ users.length }}</strong> / <strong>{{ meta.total }}</strong> nhân sự
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ 4. STAFF TABLE ═══ -->
    <div class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden mb-3">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
      </div>

      <div v-else-if="users.length === 0" class="text-center py-5 text-muted">
        <i class="fa-solid fa-users-slash fs-1 opacity-40 mb-2 d-block"></i>
        Không tìm thấy nhân sự nào phù hợp với bộ lọc.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 220px;">Nhân Sự</th>
              <th style="width: 150px;">Bộ Phận</th>
              <th style="width: 140px;">Ca Làm Việc</th>
              <th style="width: 130px;">Vai Trò Phân Quyền</th>
              <th style="width: 120px;">Lương & Ngày Vào</th>
              <th style="width: 100px;" class="text-center">Trạng Thái</th>
              <th style="width: 140px;" class="text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u._id">
              <td>
                <div class="d-flex align-items-center gap-2.5">
                  <div class="p-2 rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0" style="width: 38px; height: 38px;">
                    <i class="fa-solid fa-user fs-7"></i>
                  </div>
                  <div class="min-w-0">
                    <strong class="text-dark d-block text-truncate">{{ u.name }}</strong>
                    <small class="text-muted fs-9 d-block">{{ u.phone }} · {{ u.email }}</small>
                    <span v-if="u.employeeCode" class="badge bg-light text-dark border fs-9 px-1.5 py-0.5">
                      {{ u.employeeCode }}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', departmentBadgeClass(u.department)]">
                  {{ departmentLabel(u.department) }}
                </span>
              </td>

              <td>
                <span class="badge bg-light text-dark border rounded-pill px-2.5 py-1 fs-9">
                  <i class="fa-solid fa-clock text-warning me-1"></i>{{ shiftLabel(u.shift) }}
                </span>
              </td>

              <td>
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', roleBadgeClass(u.role)]">
                  {{ roleLabel(u.role) }}
                </span>
              </td>

              <td>
                <strong class="text-danger d-block fs-8">{{ u.salary ? u.salary.toLocaleString('vi-VN') + 'đ' : 'Thỏa thuận' }}</strong>
                <small class="text-muted fs-9">
                  {{ u.hireDate ? new Date(u.hireDate).toLocaleDateString('vi-VN') : '—' }}
                </small>
              </td>

              <td class="text-center">
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', u.isActive !== false ? 'bg-success bg-opacity-15 text-success' : 'bg-danger bg-opacity-15 text-danger']">
                  {{ u.isActive !== false ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>

              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button
                    @click="openEditModal(u)"
                    class="btn btn-outline-secondary btn-sm rounded-circle me-1"
                    title="Sửa thông tin nhân sự"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    @click="openResetPasswordModal(u)"
                    class="btn btn-outline-warning text-dark btn-sm rounded-circle me-1"
                    title="Đặt lại mật khẩu"
                  >
                    <i class="fa-solid fa-key"></i>
                  </button>
                  <button
                    @click="handleToggleActive(u)"
                    class="btn btn-light btn-sm rounded-circle me-1"
                    :title="u.isActive !== false ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'"
                  >
                    <i :class="u.isActive !== false ? 'fa-solid fa-lock text-secondary' : 'fa-solid fa-lock-open text-success'"></i>
                  </button>
                  <button
                    @click="confirmDeleteUser(u)"
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

    <!-- ═══ MODAL THÊM / SỬA NHÂN SỰ ═══ -->
    <div v-if="showStaffModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 600px;">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-1">
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-user-gear text-warning me-2"></i>
              {{ isEditing ? 'Chỉnh Sửa Thông Tin Nhân Sự' : 'Thêm Nhân Sự Mới' }}
            </h5>
            <button @click="showStaffModal = false" type="button" class="btn-close" :disabled="modalSaving"></button>
          </div>

          <div class="modal-body py-3">
            <form @submit.prevent="submitStaffForm">
              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Mã nhân viên</label>
                  <input
                    v-model="staffForm.employeeCode"
                    type="text"
                    class="form-control form-control-sm rounded-3 text-uppercase"
                    placeholder="VD: NV-001"
                  />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Họ và tên *</label>
                  <input
                    v-model="staffForm.name"
                    type="text"
                    class="form-control form-control-sm rounded-3"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Số điện thoại *</label>
                  <input
                    v-model="staffForm.phone"
                    type="tel"
                    class="form-control form-control-sm rounded-3"
                    placeholder="0901234567"
                    required
                  />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Email đăng nhập *</label>
                  <input
                    v-model="staffForm.email"
                    type="email"
                    class="form-control form-control-sm rounded-3"
                    placeholder="nhanvien@3miencua.vn"
                    :disabled="isEditing"
                    required
                  />
                </div>
              </div>

              <!-- Passwords (Chỉ khi tạo mới) -->
              <div v-if="!isEditing" class="mb-3">
                <label class="form-label small fw-semibold text-dark mb-1">Mật khẩu khởi tạo *</label>
                <input
                  v-model="staffForm.password"
                  type="text"
                  class="form-control form-control-sm rounded-3"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
              </div>

              <!-- Bộ phận & Ca làm & Vai trò -->
              <div class="row g-2 mb-3">
                <div class="col-sm-4">
                  <label class="form-label small fw-semibold text-dark mb-1">Bộ phận</label>
                  <select v-model="staffForm.department" class="form-select form-select-sm rounded-3">
                    <option value="SERVICE">Tiếp Tân & Phục Vụ</option>
                    <option value="KITCHEN">Nhà Bếp (Kitchen)</option>
                    <option value="CASHIER">Thu Ngân</option>
                    <option value="WAREHOUSE">Thủ Kho</option>
                    <option value="MANAGEMENT">Ban Quản Lý</option>
                    <option value="GENERAL">Chung</option>
                  </select>
                </div>
                <div class="col-sm-4">
                  <label class="form-label small fw-semibold text-dark mb-1">Ca làm việc</label>
                  <select v-model="staffForm.shift" class="form-select form-select-sm rounded-3">
                    <option value="MORNING">Ca Sáng (06h - 14h)</option>
                    <option value="AFTERNOON">Ca Chiều (14h - 22h)</option>
                    <option value="EVENING">Ca Tối (18h - 23h)</option>
                    <option value="FULLTIME">Full-time</option>
                  </select>
                </div>
                <div class="col-sm-4">
                  <label class="form-label small fw-semibold text-dark mb-1">Vai trò hệ thống</label>
                  <select v-model="staffForm.role" class="form-select form-select-sm rounded-3">
                    <option value="staff">Nhân viên (Staff)</option>
                    <option value="manager">Quản lý (Manager)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <!-- Lương & Ngày vào làm -->
              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Lương cơ bản (đ)</label>
                  <input
                    v-model.number="staffForm.salary"
                    type="number"
                    min="0"
                    step="100000"
                    class="form-control form-control-sm rounded-3"
                    placeholder="VD: 8000000"
                  />
                </div>
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Ngày nhận việc</label>
                  <input
                    v-model="staffForm.hireDate"
                    type="date"
                    class="form-control form-control-sm rounded-3"
                  />
                </div>
              </div>

              <div v-if="staffModalError" class="alert alert-danger small py-2 rounded-3 mb-3">
                <i class="fa-solid fa-circle-exclamation me-1"></i>{{ staffModalError }}
              </div>

              <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button @click="showStaffModal = false" type="button" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="modalSaving">
                  Hủy
                </button>
                <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold btn-sm shadow-sm" :disabled="modalSaving">
                  <span v-if="modalSaving" class="spinner-border spinner-border-sm me-1.5"></span>
                  <i v-else class="fa-solid fa-floppy-disk me-1.5"></i>
                  {{ isEditing ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL ĐẶT LẠI MẬT KHẨU ═══ -->
    <div v-if="showResetModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-1">
            <div>
              <h5 class="modal-title fw-bold brand-font text-danger mb-0">
                <i class="fa-solid fa-key text-warning me-2"></i>Cấp Lại Mật Khẩu
              </h5>
              <small class="text-muted fs-8">Nhân sự: <strong>{{ targetResetUser?.name }}</strong> ({{ targetResetUser?.email }})</small>
            </div>
            <button @click="showResetModal = false" type="button" class="btn-close" :disabled="modalSaving"></button>
          </div>

          <div class="modal-body py-3">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark mb-1">Mật khẩu mới *</label>
              <input
                v-model="newPasswordInput"
                type="text"
                class="form-control form-control-sm rounded-3"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                required
              />
            </div>
          </div>

          <div class="modal-footer border-0 pt-1">
            <button @click="showResetModal = false" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="modalSaving">Hủy</button>
            <button
              @click="submitResetPassword"
              class="btn btn-warning rounded-pill px-4 fw-bold btn-sm text-dark shadow-sm"
              :disabled="modalSaving || !newPasswordInput || newPasswordInput.length < 6"
            >
              <span v-if="modalSaving" class="spinner-border spinner-border-sm me-1.5"></span>
              <i v-else class="fa-solid fa-check me-1.5"></i>
              Xác Nhận Đổi Mật Khẩu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM MODAL ═══ -->
    <ConfirmModal
      :show="showConfirmDialog"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="Xác nhận"
      cancel-text="Hủy"
      confirm-variant="danger"
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

const users = ref([]);
const loading = ref(false);
const meta = ref({ page: 1, limit: 15, total: 0, totalPages: 0 });
const staffStats = ref({ totalStaff: 0, activeStaff: 0, managers: 0, kitchenStaff: 0, serviceStaff: 0 });

const filters = reactive({
  search: "",
  role: "",
  department: "",
  shift: "",
});

// Modal State
const showStaffModal = ref(false);
const isEditing = ref(false);
const modalSaving = ref(false);
const staffModalError = ref("");
const editingUserId = ref(null);

const staffForm = reactive({
  employeeCode: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "staff",
  department: "SERVICE",
  shift: "MORNING",
  salary: 0,
  hireDate: new Date().toISOString().split("T")[0],
});

// Reset Password State
const showResetModal = ref(false);
const targetResetUser = ref(null);
const newPasswordInput = ref("");

// Confirm Dialog State
const showConfirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const pendingAction = ref(null);

const fetchStaffStats = async () => {
  try {
    const res = await api.get("/users/staff-stats");
    staffStats.value = res.data.data;
  } catch (err) {
    console.warn("Lỗi lấy thống kê nhân sự:", err);
  }
};

const fetchStaffList = async (page = 1) => {
  loading.value = true;
  try {
    const params = { page, limit: 15 };
    if (filters.search) params.search = filters.search.trim();
    if (filters.role) params.role = filters.role;
    if (filters.department) params.department = filters.department;
    if (filters.shift) params.shift = filters.shift;

    const res = await api.get("/users", { params });
    users.value = res.data.data.users || [];
    meta.value = {
      page: res.data.page || 1,
      limit: res.data.limit || 15,
      total: res.data.total || 0,
      totalPages: res.data.totalPages || 0,
    };
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi tải danh sách nhân viên");
  } finally {
    loading.value = false;
  }
};

const goPage = (p) => {
  if (p < 1 || p > meta.value.totalPages) return;
  fetchStaffList(p);
};

// ═══ THÊM / SỬA NHÂN SỰ ═══
const openAddStaffModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  staffModalError.value = "";
  Object.assign(staffForm, {
    employeeCode: `NV-${String(users.value.length + 1).padStart(3, "0")}`,
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
    department: "SERVICE",
    shift: "MORNING",
    salary: 7000000,
    hireDate: new Date().toISOString().split("T")[0],
  });
  showStaffModal.value = true;
};

const openEditModal = (u) => {
  isEditing.value = true;
  editingUserId.value = u._id;
  staffModalError.value = "";
  Object.assign(staffForm, {
    employeeCode: u.employeeCode || "",
    name: u.name || "",
    email: u.email || "",
    phone: u.phone || "",
    password: "",
    role: u.role || "staff",
    department: u.department || "SERVICE",
    shift: u.shift || "FULLTIME",
    salary: u.salary || 0,
    hireDate: u.hireDate ? new Date(u.hireDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  });
  showStaffModal.value = true;
};

const submitStaffForm = async () => {
  staffModalError.value = "";
  modalSaving.value = true;
  try {
    if (isEditing.value) {
      await api.patch(`/users/${editingUserId.value}`, {
        employeeCode: staffForm.employeeCode,
        name: staffForm.name,
        phone: staffForm.phone,
        role: staffForm.role,
        department: staffForm.department,
        shift: staffForm.shift,
        salary: staffForm.salary,
        hireDate: staffForm.hireDate,
      });
      toast.success("Cập nhật thông tin nhân sự thành công!");
    } else {
      await api.post("/users", {
        employeeCode: staffForm.employeeCode,
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        password: staffForm.password,
        role: staffForm.role,
        department: staffForm.department,
        shift: staffForm.shift,
        salary: staffForm.salary,
        hireDate: staffForm.hireDate,
      });
      toast.success("Tạo tài khoản nhân sự mới thành công!");
    }
    showStaffModal.value = false;
    await Promise.all([fetchStaffStats(), fetchStaffList(meta.value.page)]);
  } catch (err) {
    staffModalError.value = err.response?.data?.message || "Lỗi lưu thông tin nhân sự";
  } finally {
    modalSaving.value = false;
  }
};

// ═══ RESET PASSWORD ═══
const openResetPasswordModal = (u) => {
  targetResetUser.value = u;
  newPasswordInput.value = "";
  showResetModal.value = true;
};

const submitResetPassword = async () => {
  if (!targetResetUser.value || !newPasswordInput.value) return;
  modalSaving.value = true;
  try {
    const res = await api.patch(`/users/${targetResetUser.value._id}/reset-password`, {
      newPassword: newPasswordInput.value.trim(),
    });
    toast.success(res.data.message || "Đặt lại mật khẩu thành công!");
    showResetModal.value = false;
    targetResetUser.value = null;
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi đặt lại mật khẩu");
  } finally {
    modalSaving.value = false;
  }
};

// ═══ KHÓA / MỞ KHÓA & XÓA ═══
const handleToggleActive = async (u) => {
  const newActive = u.isActive === false;
  try {
    await api.patch(`/users/${u._id}`, { isActive: newActive });
    u.isActive = newActive;
    toast.success(`Đã ${newActive ? "MỞ KHÓA" : "KHÓA"} tài khoản của ${u.name}`);
    await fetchStaffStats();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
  }
};

const confirmDeleteUser = (u) => {
  confirmTitle.value = "Xác nhận xóa nhân sự";
  confirmMessage.value = `Bạn có chắc chắn muốn xóa tài khoản nhân sự '${u.name}' (${u.email})?`;
  pendingAction.value = async () => {
    try {
      await api.delete(`/users/${u._id}`);
      toast.success("Đã xóa tài khoản nhân sự thành công");
      await Promise.all([fetchStaffStats(), fetchStaffList(meta.value.page)]);
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

// ═══ HELPERS ═══
const countRole = (role) => users.value.filter((u) => u.role === role).length;
const countDept = (dept) => users.value.filter((u) => u.department === dept).length;

const departmentLabel = (dept) => {
  const map = {
    MANAGEMENT: "Ban Quản Lý",
    SERVICE: "Tiếp Tân & Phục Vụ",
    KITCHEN: "Nhà Bếp (Kitchen)",
    CASHIER: "Thu Ngân",
    WAREHOUSE: "Thủ Kho",
    GENERAL: "Chung",
  };
  return map[dept] || dept || "Chung";
};

const departmentBadgeClass = (dept) => {
  switch (dept) {
    case "MANAGEMENT": return "bg-primary bg-opacity-15 text-primary";
    case "KITCHEN": return "bg-warning bg-opacity-20 text-dark";
    case "SERVICE": return "bg-success bg-opacity-15 text-success";
    case "CASHIER": return "bg-info bg-opacity-15 text-info";
    case "WAREHOUSE": return "bg-secondary bg-opacity-15 text-secondary";
    default: return "bg-light text-dark border";
  }
};

const shiftLabel = (s) => {
  const map = {
    MORNING: "Ca Sáng (06h - 14h)",
    AFTERNOON: "Ca Chiều (14h - 22h)",
    EVENING: "Ca Tối (18h - 23h)",
    FULLTIME: "Full-time",
  };
  return map[s] || s || "Full-time";
};

const roleLabel = (r) => {
  switch (r) {
    case "admin": return "Quản Trị Viên (Admin)";
    case "manager": return "Quản Lý (Manager)";
    case "staff": return "Nhân Viên (Staff)";
    default: return "Khách Hàng";
  }
};

const roleBadgeClass = (r) => {
  switch (r) {
    case "admin": return "bg-danger text-white";
    case "manager": return "bg-primary text-white";
    case "staff": return "bg-secondary text-white";
    default: return "bg-light text-dark";
  }
};

onMounted(async () => {
  await Promise.all([fetchStaffStats(), fetchStaffList(1)]);
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
