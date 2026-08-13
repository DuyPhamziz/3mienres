<template>
  <div class="d-flex min-vh-100 bg-light">
    <!-- Thanh điều hướng mobile -->
    <header class="admin-mobile-top d-lg-none d-flex align-items-center justify-content-between px-3 py-2 bg-dark text-white">
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-light btn-sm" type="button" @click="sidebarOpen = !sidebarOpen">
          <i class="fa-solid fa-bars"></i>
        </button>
        <span class="fw-bold brand-font text-danger">POS MANAGER</span>
      </div>
      <span class="small text-secondary">3 Miền Cua</span>
    </header>

    <!-- Sidebar -->
    <aside
      :class="['admin-sidebar bg-dark text-white p-3 d-flex flex-column', { 'is-open': sidebarOpen }]"
    >
      <div class="d-flex align-items-center gap-3 mb-4 px-2 pt-2">
        <div class="p-2 bg-danger bg-opacity-20 rounded-3 text-danger d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
          <i class="fa-solid fa-utensils fs-3"></i>
        </div>
        <div>
          <span class="fw-bold fs-5 brand-font text-danger d-block leading-tight">POS MANAGER</span>
          <small class="text-secondary fs-8 d-block">Nhà hàng 3 Miền Cua</small>
        </div>
      </div>

      <nav class="nav flex-column gap-2 flex-grow-1">
        <router-link to="/admin" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-chart-pie me-3 fs-5"></i>
          <span>Báo Cáo Dashboard</span>
        </router-link>
        <router-link to="/admin/pos" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-cash-register me-3 fs-5"></i>
          <span>Quản Lý POS Bàn Ăn</span>
        </router-link>
        <router-link to="/admin/kitchen" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-fire-burner me-3 fs-5"></i>
          <span>Màn Hình Bếp (KDS)</span>
        </router-link>
        <router-link to="/admin/tables" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-border-all me-3 fs-5"></i>
          <span>Sơ Đồ Bàn & Ghép Bàn</span>
        </router-link>
        <router-link to="/admin/reservations" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-calendar-check me-3 fs-5"></i>
          <span>Đơn Đặt Bàn (Check-in)</span>
        </router-link>
        <router-link to="/admin/menu" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-utensils me-3 fs-5"></i>
          <span>Thực Đơn 3 Miền</span>
        </router-link>
        <router-link to="/admin/inventory" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-boxes-stacked me-3 fs-5"></i>
          <span>Kho & Công Thức Món</span>
        </router-link>
        <router-link to="/admin/suppliers" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-truck-field me-3 fs-5"></i>
          <span>Nhà Cung Cấp</span>
        </router-link>
        <router-link to="/admin/vouchers" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-tags me-3 fs-5"></i>
          <span>Mã Giảm Giá</span>
        </router-link>
        <router-link to="/admin/staff" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-users-gear me-3 fs-5"></i>
          <span>Nhân Viên & Phân Quyền</span>
        </router-link>
        <router-link to="/admin/audit-logs" class="nav-link text-white rounded-3 px-3 py-2.5 d-flex align-items-center" active-class="bg-danger fw-bold shadow-sm">
          <i class="fa-solid fa-clock-rotate-left me-3 fs-5"></i>
          <span>Nhật Ký Thao Tác</span>
        </router-link>
      </nav>

      <div class="pt-3 border-top border-secondary border-opacity-50 mt-auto">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <i class="fa-solid fa-user-shield text-warning fs-5"></i>
            <span class="small fw-medium text-truncate">{{ authStore.user?.name }}</span>
          </div>
          <div class="d-flex gap-1 flex-shrink-0">
            <router-link to="/" class="btn btn-outline-light btn-sm rounded-circle" title="Về trang chủ Web">
              <i class="fa-solid fa-house"></i>
            </router-link>
            <button @click="handleLogout" class="btn btn-outline-danger btn-sm rounded-circle" title="Đăng xuất">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Lớp phủ khi mở sidebar trên mobile -->
    <div v-if="sidebarOpen" class="admin-sidebar-overlay d-lg-none" @click="sidebarOpen = false"></div>

    <!-- Main Content Area -->
    <main class="flex-grow-1 p-4 overflow-auto" style="min-width: 0;">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useRealtime } from "../composables/useRealtime";
import { toast } from "../composables/useToast";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(false);

// Tự động đóng sidebar khi chuyển trang (trên mobile)
watch(() => route.fullPath, () => {
  sidebarOpen.value = false;
});

const handleLogout = () => {
  authStore.logout();
  toast.info("Đã đăng xuất khỏi hệ thống");
  router.push("/");
};

// Bật đồng bộ realtime cho toàn bộ phân vùng quản trị
useRealtime();
</script>

<style scoped>
.admin-sidebar {
  width: 260px;
  min-height: 100vh;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
@media (max-width: 991.98px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1050;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }
  .admin-sidebar.is-open {
    transform: translateX(0);
  }
  .admin-sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 1040;
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
