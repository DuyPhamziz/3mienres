<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-4">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-user-gear me-1"></i> {{ langStore.t('profile.badge') }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">{{ langStore.t('profile.title') }}</h1>
        <p class="text-muted small mb-0">{{ langStore.t('profile.subtitle') }}</p>
      </div>

      <!-- Quick Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="glass-card p-3 p-md-4 rounded-4 text-center h-100 bg-white border">
            <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-block mb-2">
              <i class="fa-solid fa-circle-user fs-2"></i>
            </div>
            <h5 class="fw-bold mb-1 text-dark">{{ profile.name || '---' }}</h5>
            <p class="text-muted small mb-2">{{ profile.email || '---' }}</p>
            <span class="badge bg-danger rounded-pill px-3 py-1 fs-8">{{ langStore.t('profile.member') }}</span>
          </div>
        </div>

        <div class="col-md-4">
          <div class="glass-card p-3 p-md-4 rounded-4 text-center h-100 bg-white border">
            <i class="fa-solid fa-coins fs-2 text-warning mb-2 d-block"></i>
            <h5 class="fw-bold mb-1 text-dark">{{ (profile.totalSpent || 0).toLocaleString('vi-VN') }}đ</h5>
            <p class="text-muted small mb-0">{{ langStore.t('profile.totalSpent') }}</p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="glass-card p-3 p-md-4 rounded-4 text-center h-100 bg-white border">
            <i class="fa-solid fa-calendar-check fs-2 text-danger mb-2 d-block"></i>
            <h5 class="fw-bold mb-1 text-dark">{{ reservations.length }}</h5>
            <p class="text-muted small mb-0">{{ langStore.t('profile.bookings') }}</p>
          </div>
        </div>
      </div>

      <!-- Main Tabs Container -->
      <div class="glass-card p-3 p-md-4 rounded-5 bg-white border shadow-sm">
        <!-- Navigation Tabs -->
        <ul class="nav nav-pills mb-4 gap-2 overflow-x-auto pb-2 flex-nowrap scrollbar-none">
          <li class="nav-item flex-shrink-0" v-for="tab in tabs" :key="tab.key">
            <button
              @click="activeTab = tab.key"
              :class="['btn rounded-pill px-3 py-2 fs-7 fw-semibold text-nowrap', activeTab === tab.key ? 'btn-danger' : 'btn-light']"
            >
              <i :class="tab.icon" class="me-1.5"></i>{{ langStore.t('profile.' + tab.key) }}
            </button>
          </li>
        </ul>

        <!-- TAB 1: Thông tin cá nhân -->
        <div v-if="activeTab === 'info'" class="p-2">
          <div class="row g-3 max-w-2xl">
            <div class="col-md-6">
              <label class="form-label fw-semibold fs-7 text-dark">
                {{ langStore.isEnglish ? 'Full Name' : 'Họ và tên' }} <span class="text-danger">*</span>
              </label>
              <input v-model="profile.name" type="text" class="form-control fs-7 py-2.5" placeholder="Nhập họ và tên" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold fs-7 text-dark">
                {{ langStore.isEnglish ? 'Phone Number' : 'Số điện thoại' }} <span class="text-danger">*</span>
              </label>
              <input v-model="profile.phone" type="tel" class="form-control fs-7 py-2.5" placeholder="Ví dụ: 0988776655" />
            </div>

            <div class="col-md-12">
              <label class="form-label fw-semibold fs-7 text-dark">
                {{ langStore.isEnglish ? 'Email Address' : 'Địa chỉ Email' }}
              </label>
              <input :value="profile.email" type="email" class="form-control fs-7 py-2.5 bg-light" disabled />
              <small class="text-muted fs-8">{{ langStore.isEnglish ? 'Email is linked to your login account.' : 'Email gắn liền với tài khoản đăng nhập và không thể thay đổi.' }}</small>
            </div>
          </div>

          <button @click="saveInfo" :disabled="saving" class="btn btn-danger rounded-pill mt-4 px-4 py-2.5 fw-bold shadow-sm">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fa-solid fa-floppy-disk me-1.5"></i>
            {{ langStore.isEnglish ? 'Save Profile' : 'Lưu Thay Đổi Thông Tin' }}
          </button>
        </div>

        <!-- TAB 2: Sổ địa chỉ -->
        <div v-else-if="activeTab === 'address'" class="p-2">
          <div v-for="(addr, idx) in profile.addresses" :key="idx" class="border rounded-4 p-3 mb-3 bg-light bg-opacity-50">
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">{{ langStore.isEnglish ? 'Address Title' : 'Tên gợi nhớ' }}</label>
                <input v-model="addr.title" type="text" class="form-control form-control-sm" placeholder="Nhà riêng, Cơ quan..." />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold">{{ langStore.isEnglish ? 'Detail Address' : 'Địa chỉ chi tiết' }}</label>
                <input v-model="addr.addressDetail" type="text" class="form-control form-control-sm" placeholder="Số nhà, tên đường..." />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ langStore.isEnglish ? 'Ward' : 'Phường/Xã' }}</label>
                <input v-model="addr.ward" type="text" class="form-control form-control-sm" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ langStore.isEnglish ? 'District' : 'Quận/Huyện' }}</label>
                <input v-model="addr.district" type="text" class="form-control form-control-sm" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold">{{ langStore.isEnglish ? 'Province / City' : 'Tỉnh/Thành phố' }}</label>
                <input v-model="addr.city" type="text" class="form-control form-control-sm" />
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <div class="form-check">
                <input v-model="addr.isDefault" type="checkbox" class="form-check-input" :id="`def-${idx}`" />
                <label class="form-check-label small fw-medium" :for="`def-${idx}`">{{ langStore.isEnglish ? 'Default Address' : 'Địa chỉ mặc định' }}</label>
              </div>
              <button @click="removeAddress(idx)" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                <i class="fa-solid fa-trash-can me-1"></i>{{ langStore.isEnglish ? 'Delete' : 'Xóa' }}
              </button>
            </div>
          </div>

          <button @click="addAddress" class="btn btn-outline-danger rounded-pill mb-3 fw-semibold">
            <i class="fa-solid fa-plus me-1"></i> {{ langStore.isEnglish ? 'Add New Address' : 'Thêm Địa Chỉ Mới' }}
          </button>

          <div v-if="profile.addresses.length > 0">
            <button @click="saveInfo" :disabled="saving" class="btn btn-danger rounded-pill px-4 py-2.5 fw-bold shadow-sm">
              <i class="fa-solid fa-floppy-disk me-1.5"></i> {{ langStore.isEnglish ? 'Save Addresses' : 'Lưu Danh Sách Địa Chỉ' }}
            </button>
          </div>
        </div>

        <!-- TAB 3: Đổi mật khẩu -->
        <div v-else-if="activeTab === 'password'" class="p-2">
          <div class="row g-3 max-w-lg" style="max-width: 480px;">
            <div class="col-12">
              <label class="form-label fw-semibold fs-7 text-dark">{{ langStore.isEnglish ? 'Current Password' : 'Mật khẩu hiện tại' }} <span class="text-danger">*</span></label>
              <input v-model="passwordForm.currentPassword" type="password" class="form-control fs-7 py-2.5" placeholder="••••••" />
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold fs-7 text-dark">{{ langStore.isEnglish ? 'New Password (min 6 chars)' : 'Mật khẩu mới (tối thiểu 6 ký tự)' }} <span class="text-danger">*</span></label>
              <input v-model="passwordForm.newPassword" type="password" class="form-control fs-7 py-2.5" placeholder="••••••" />
            </div>
          </div>

          <button @click="changePassword" :disabled="saving" class="btn btn-danger rounded-pill mt-4 px-4 py-2.5 fw-bold shadow-sm">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fa-solid fa-key me-1.5"></i>
            {{ langStore.isEnglish ? 'Change Password' : 'Đổi Mật Khẩu' }}
          </button>
        </div>

        <!-- TAB 4: Lịch sử đặt bàn -->
        <div v-else-if="activeTab === 'history'" class="p-2">
          <div v-if="reservations.length === 0" class="text-center text-muted py-5">
            <i class="fa-solid fa-calendar-xmark fs-2 d-block mb-2 opacity-50"></i>
            {{ langStore.isEnglish ? 'No reservations yet' : 'Chưa có lượt đặt bàn nào' }}
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr class="text-muted small">
                  <th>{{ langStore.isEnglish ? 'Code' : 'Mã Đơn' }}</th>
                  <th>{{ langStore.isEnglish ? 'Date & Time' : 'Thời Gian' }}</th>
                  <th>{{ langStore.isEnglish ? 'Guests' : 'Số Khách' }}</th>
                  <th>{{ langStore.isEnglish ? 'Status' : 'Trạng Thái' }}</th>
                  <th class="text-end">{{ langStore.isEnglish ? 'Action' : 'Thao Tác' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reservations" :key="r._id">
                  <td><strong class="text-danger brand-font">{{ r.reservationCode }}</strong></td>
                  <td><small class="text-muted">{{ new Date(r.startAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) }}</small></td>
                  <td>{{ r.guestsCount }} {{ langStore.isEnglish ? 'pax' : 'người' }}</td>
                  <td>
                    <span :class="['badge rounded-pill px-2.5 py-1 fs-8', statusClass(r.status)]">{{ r.status }}</span>
                  </td>
                  <td class="text-end">
                    <router-link :to="`/tra-cuu?code=${r.reservationCode}`" class="btn btn-outline-danger btn-sm rounded-pill px-3 fs-8">
                      {{ langStore.isEnglish ? 'Details' : 'Chi Tiết' }}
                    </router-link>
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
import { useLangStore } from "../../stores/langStore";
import { toast } from "../../composables/useToast";

const authStore = useAuthStore();
const langStore = useLangStore();
const reservationStore = useReservationStore();

const activeTab = ref("info");
const saving = ref(false);
const reservations = ref([]);

const tabs = [
  { key: "info", icon: "fa-solid fa-id-card" },
  { key: "address", icon: "fa-solid fa-location-dot" },
  { key: "password", icon: "fa-solid fa-key" },
  { key: "history", icon: "fa-solid fa-clock-rotate-left" },
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
  CONFIRMED: "bg-success text-white",
  ARRIVED: "bg-primary text-white",
  CANCELLED: "bg-danger text-white",
  COMPLETED: "bg-secondary text-white",
  PENDING: "bg-warning text-dark",
})[s] || "bg-secondary text-white";

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
    const res = await api.patch("/users/me", {
      name: profile.name.trim(),
      phone: profile.phone ? profile.phone.trim() : undefined,
      addresses: profile.addresses,
    });
    toast.success(langStore.isEnglish ? "Profile updated successfully!" : "Cập nhật thông tin thành công!");
    if (res.data?.data?.user) {
      authStore.user = res.data.data.user;
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }
    await loadProfile();
  } catch (err) {
    toast.error(err.response?.data?.message || (langStore.isEnglish ? "Update failed!" : "Cập nhật thất bại!"));
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
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    toast.error(langStore.isEnglish ? "Please enter current and new password" : "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới");
    return;
  }
  saving.value = true;
  try {
    await api.patch("/users/me/password", passwordForm);
    toast.success(langStore.isEnglish ? "Password changed successfully!" : "Đổi mật khẩu thành công!");
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
  } catch (err) {
    toast.error(err.response?.data?.message || (langStore.isEnglish ? "Password change failed!" : "Đổi mật khẩu thất bại!"));
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
