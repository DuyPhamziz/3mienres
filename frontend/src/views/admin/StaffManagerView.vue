<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1"><i class="fa-solid fa-users-gear text-danger me-2"></i>Quản Lý Tài Khoản & Phân Quyền</h2>
        <p class="text-muted small mb-0">Tạo tài khoản nhân viên, cập nhật vai trò và trạng thái hoạt động</p>
      </div>
      <button @click="showForm = !showForm" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
        <i class="fa-solid fa-user-plus me-1"></i> Thêm Nhân Viên
      </button>
    </div>

    <!-- Form tạo tài khoản -->
    <div v-if="showForm" class="glass-card p-4 rounded-4 bg-white mb-4">
      <h5 class="fw-bold brand-font mb-3">Tạo Tài Khoản Nhân Viên</h5>
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label small fw-semibold">Họ tên</label>
          <input v-model="form.name" type="text" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold">Email</label>
          <input v-model="form.email" type="email" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold">Số điện thoại</label>
          <input v-model="form.phone" type="tel" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold">Mật khẩu</label>
          <input v-model="form.password" type="text" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold">Vai trò</label>
          <select v-model="form.role" class="form-select">
            <option value="staff">Nhân viên</option>
            <option value="manager">Quản lý</option>
          </select>
        </div>
      </div>
      <button @click="submitStaff" :disabled="saving" class="btn btn-primary-crab mt-3 px-4 fw-bold">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="fa-solid fa-floppy-disk me-1"></i> Tạo Tài Khoản
      </button>
    </div>

    <!-- Danh sách tài khoản -->
    <div class="glass-card p-4 rounded-4 bg-white">
      <div v-if="users.length === 0" class="text-center text-muted py-4">Chưa có tài khoản nào</div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Người dùng</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th class="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u._id">
              <td><strong class="text-dark">{{ u.name }}</strong></td>
              <td><small>{{ u.email }}</small></td>
              <td><small>{{ u.phone }}</small></td>
              <td>
                <select :value="u.role" @change="changeRole(u, $event.target.value)" class="form-select form-select-sm" style="max-width: 140px;">
                  <option value="customer">Khách hàng</option>
                  <option value="staff">Nhân viên</option>
                  <option value="manager">Quản lý</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <span :class="['badge rounded-pill', u.isActive !== false ? 'bg-success' : 'bg-danger']">
                  {{ u.isActive !== false ? 'Hoạt động' : 'Đã khóa' }}
                </span>
              </td>
              <td class="text-end">
                <button @click="toggleActive(u)" class="btn btn-sm rounded-pill" :class="u.isActive !== false ? 'btn-outline-danger' : 'btn-outline-success'">
                  {{ u.isActive !== false ? 'Khóa' : 'Mở khóa' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const users = ref([]);
const showForm = ref(false);
const saving = ref(false);

const form = reactive({ name: "", email: "", phone: "", password: "", role: "staff" });

const fetchUsers = async () => {
  try {
    const res = await api.get("/users");
    users.value = res.data.data.users;
  } catch (err) {
    toast.error("Lỗi lấy danh sách tài khoản");
  }
};

const submitStaff = async () => {
  saving.value = true;
  try {
    await api.post("/users", form);
    toast.success("Tạo tài khoản nhân viên thành công!");
    showForm.value = false;
    Object.assign(form, { name: "", email: "", phone: "", password: "", role: "staff" });
    await fetchUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || "Tạo tài khoản thất bại!");
  } finally {
    saving.value = false;
  }
};

const changeRole = async (user, role) => {
  try {
    await api.patch(`/users/${user._id}`, { role });
    toast.success(`Đã đổi vai trò ${user.name} thành ${role}`);
    await fetchUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || "Đổi vai trò thất bại!");
  }
};

const toggleActive = async (user) => {
  try {
    await api.patch(`/users/${user._id}`, { isActive: user.isActive === false });
    toast.success(user.isActive === false ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
    await fetchUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || "Thao tác thất bại!");
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
