<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-user-gear me-1"></i> TÀI KHOẢN CÁ NHÂN
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">Hồ Sơ Thành Viên</h1>
        <p class="text-muted small">Quản lý thông tin, địa chỉ, mật khẩu và lịch sử đặt bàn của bạn</p>
      </div>

      <!-- Thẻ thông tin nhanh -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="glass-card p-4 rounded-4 text-center h-100 bg-white">
            <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-block mb-2">
              <i class="fa-solid fa-user fs-3"></i>
            </div>
            <h5 class="fw-bold mb-1">{{ profile.name }}</h5>
            <p class="text-muted small mb-2">{{ profile.email }}</p>
            <span class="badge bg-danger rounded-pill px-3 py-1">Thành viên</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="glass-card p-4 rounded-4 text-center h-100 bg-white">
            <i class="fa-solid fa-coins fs-3 text-warning mb-2 d-block"></i>
            <h5 class="fw-bold mb-1">{{ (profile.totalSpent || 0).toLocaleString('vi-VN') }}đ</h5>
            <p class="text-muted small mb-0">Tổng chi tiêu tích lũy</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="glass-card p-4 rounded-4 text-center h-100 bg-white">
            <i class="fa-solid fa-calendar-check fs-3 text-danger mb-2 d-block"></i>
            <h5 class="fw-bold mb-1">{{ reservations.length }}</h5>
            <p class="text-muted small mb-0">Lượt đặt bàn</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="glass-card p-4 rounded-5 bg-white">
        <ul class="nav nav-pills mb-4 gap-2">
          <li class="nav-item" v-for="tab in tabs" :key="tab.key">
            <button
              @click="activeTab = tab.key"
              :class="['btn rounded-pill px-3', activeTab === tab.key ? 'btn-danger' : 'btn-outline-secondary']"
            >
              <i :class="tab.icon" class="me-1"></i>{{ tab.label }}
            </button>
          </li>
        </ul>

        <!-- Thông tin -->
        <div v-if="activeTab === 'info'">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Họ và tên</label>
              <input v-model="profile.name" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Số điện thoại</label>
              <input v-model="profile.phone" type="tel" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Email</label>
              <input :value="profile.email" type="email" class="form-control" disabled />
            </div>
          </div>
          <button @click="saveInfo" :disabled="saving" class="btn btn-primary-crab mt-3 px-4 fw-bold">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fa-solid fa-floppy-disk me-1"></i> Lưu Thông Tin
          </button>
        </div>

        <!-- Địa chỉ -->
        <div v-else-if="activeTab === 'address'">
          <div v-for="(addr, idx) in profile.addresses" :key="idx" class="border rounded-4 p-3 mb-3">
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Tên gợi nhớ</label>
                <input v-model="addr.title" type="text" class="form-control form-control-sm" placeholder="Nhà riêng, Cơ quan..." />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Địa chỉ chi tiết</label>
                <input v-model="addr.addressDetail" type="text" class="form-control form-control-sm" placeholder="Số nhà, đường..." />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Phường/Xã</label>
                <input v-model="addr.ward" type="text" class="form-control form-control-sm" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Quận/Huyện</label>
                <input v-model="addr.district" type="text" class="form-control form-control-sm" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">Tỉnh/Thành</label>
                <input v-model="addr.city" type="text" class="form-control form-control-sm" />
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="form-check">
                <input v-model="addr.isDefault" type="checkbox" class="form-check-input" :id="`def-${idx}`" />
                <label class="form-check-label small" :for="`def-${idx}`">Mặc định</label>
              </div>
              <button @click="removeAddress(idx)" class="btn btn-outline-danger btn-sm rounded-pill">
                <i class="fa-solid fa-trash-can me-1"></i>Xóa
              </button>
            </div>
          </div>
          <button @click="addAddress" class="btn btn-outline-danger rounded-pill mb-3">
            <i class="fa-solid fa-plus me-1"></i> Thêm Địa Chỉ
          </button>
          <div>
            <button @click="saveInfo" :disabled="saving" class="btn btn-primary-crab px-4 fw-bold">
              <i class="fa-solid fa-floppy-disk me-1"></i> Lưu Địa Chỉ
            </button>
          </div>
        </div>

        <!-- Đổi mật khẩu -->
        <div v-else-if="activeTab === 'password'">
          <div class="row g-3" style="max-width: 480px;">
            <div class="col-12">
              <label class="form-label fw-semibold">Mật khẩu hiện tại</label>
              <input v-model="passwordForm.currentPassword" type="password" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold">Mật khẩu mới</label>
              <input v-model="passwordForm.newPassword" type="password" class="form-control" />
            </div>
          </div>
          <button @click="changePassword" :disabled="saving" class="btn btn-primary-crab mt-3 px-4 fw-bold">
            <i class="fa-solid fa-key me-1"></i> Đổi Mật Khẩu
          </button>
        </div>

        <!-- Lịch sử đặt bàn -->
        <div v-else-if="activeTab === 'history'">
          <div v-if="reservations.length === 0" class="text-center text-muted py-4">
            <i class="fa-solid fa-receipt fs-2 d-block mb-2 opacity-50"></i>
            Chưa có lượt đặt bàn nào
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr class="text-muted small">
                  <th>Mã đơn</th>
                  <th>Thời gian</th>
                  <th>Số khách</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reservations" :key="r._id">
                  <td><strong class="text-danger">{{ r.reservationCode }}</strong></td>
                  <td><small>{{ new Date(r.startAt).toLocaleString('vi-VN') }}</small></td>
                  <td>{{ r.guestsCount }} người</td>
                  <td>
                    <span :class="['badge rounded-pill px-2 py-1 fs-8', statusClass(r.status)]">{{ r.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useReservationStore } from "../../stores/reservationStore";
import { toast } from "../../composables/useToast";

const authStore = useAuthStore();
const reservationStore = useReservationStore();

const activeTab = ref("info");
const saving = ref(false);
const reservations = ref([]);

const tabs = [
  { key: "info", label: "Thông Tin", icon: "fa-solid fa-id-card" },
  { key: "address", label: "Địa Chỉ", icon: "fa-solid fa-location-dot" },
  { key: "password", label: "Đổi Mật Khẩu", icon: "fa-solid fa-key" },
  { key: "history", label: "Lịch Sử Đặt Bàn", icon: "fa-solid fa-clock-rotate-left" },
];

const profile = reactive({
  name: "",
  email: "",
  phone: "",
  totalSpent: 0,
  addresses: [],
});

const passwordForm = reactive({ currentPassword: "", newPassword: "" });

const statusClass = (s) => ({
  CONFIRMED: "bg-success",
  ARRIVED: "bg-primary",
  CANCELLED: "bg-danger",
  COMPLETED: "bg-secondary",
})[s] || "bg-secondary";

const loadProfile = async () => {
  try {
    const res = await api.get("/auth/me");
    const u = res.data.data.user;
    profile.name = u.name || "";
    profile.email = u.email || "";
    profile.phone = u.phone || "";
    profile.totalSpent = u.totalSpent || 0;
    profile.addresses = u.addresses || [];
    authStore.user = u;
    localStorage.setItem("user", JSON.stringify(u));
  } catch (err) {
    toast.error("Không tải được hồ sơ: " + err.message);
  }
};

const saveInfo = async () => {
  saving.value = true;
  try {
    await api.patch("/users/me", {
      name: profile.name,
      phone: profile.phone,
      addresses: profile.addresses,
    });
    toast.success("Cập nhật hồ sơ thành công!");
    await loadProfile();
  } catch (err) {
    toast.error(err.response?.data?.message || "Cập nhật thất bại!");
  } finally {
    saving.value = false;
  }
};

const addAddress = () => {
  profile.addresses.push({ title: "", addressDetail: "", ward: "", district: "", city: "", isDefault: false });
};

const removeAddress = (idx) => {
  profile.addresses.splice(idx, 1);
};

const changePassword = async () => {
  saving.value = true;
  try {
    await api.patch("/users/me/password", passwordForm);
    toast.success("Đổi mật khẩu thành công!");
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
  } catch (err) {
    toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await loadProfile();
  await reservationStore.fetchMyReservations();
  reservations.value = reservationStore.myReservations;
});
</script>
