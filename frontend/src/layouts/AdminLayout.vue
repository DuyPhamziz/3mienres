<template>
  <div class="admin-layout d-flex bg-light" style="min-height: 100vh;">
    <!-- Sidebar Left: Fixed, không cuộn theo nội dung -->
    <aside
      class="admin-sidebar bg-dark text-white d-flex flex-column justify-content-between"
      style="width: 260px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto;"
    >
      <div class="p-3">
        <!-- Brand Header -->
        <div class="d-flex align-items-center gap-2 mb-4 p-2 rounded-3 bg-white bg-opacity-10">
          <div class="p-2 bg-danger text-white rounded-3 flex-shrink-0" style="width: 40px; height: 40px; display:flex; align-items:center; justify-content:center;">
            <i class="fa-solid fa-utensils fs-5"></i>
          </div>
          <div class="overflow-hidden">
            <strong class="d-block text-white brand-font fs-7 text-truncate">
              {{ langStore.isEnglish ? '3 MIEN POS SYSTEM' : 'HỆ THỐNG POS 3 MIỀN' }}
            </strong>
            <small class="text-warning" style="font-size: 0.7rem;">
              {{ langStore.isEnglish ? 'Specialty Restaurant' : 'Nhà Hàng 3 Miền Cua' }}
            </small>
          </div>
        </div>

        <!-- Navigation Links -->
        <ul class="nav flex-column gap-1" style="font-size: 0.85rem;">
          <li class="nav-item">
            <router-link to="/admin" exact class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-chart-pie" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Overview Dashboard' : 'Báo Cáo Tổng Quan' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/tables" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-chair" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'POS Table Map' : 'Sơ Đồ POS Bàn Ăn' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/reservations" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-calendar-check" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Reservations & Check-in' : 'Đơn Đặt Bàn & Check-in' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/calendar" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-calendar-days" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Reservation Calendar' : 'Cuốn Lịch Đặt Bàn' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/pos" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-cash-register" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Table Order & POS' : 'Gọi Món Tại Bàn' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/kitchen" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-fire-burner" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Kitchen Display (KDS)' : 'Màn Hình Bếp (KDS)' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/menu" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-book-open" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Menu Management' : 'Quản Lý Thực Đơn' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/inventory" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-boxes-stacked" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Inventory Stock' : 'Quản Lý Kho Nguyên Liệu' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/suppliers" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-truck-field" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Supplier Management' : 'Quản Lý Nhà Cung Cấp' }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/vouchers" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-tags" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Vouchers & Discounts' : 'Mã Giảm Giá & Voucher' }}</span>
            </router-link>
          </li>
          <li v-if="authStore.user?.role === 'admin'" class="nav-item">
            <router-link to="/admin/staff" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-users-gear" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Staff & Roles' : 'Nhân Viên & Phân Quyền' }}</span>
            </router-link>
          </li>
          <li v-if="authStore.user?.role === 'admin'" class="nav-item">
            <router-link to="/admin/audit-logs" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-clock-rotate-left" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Audit Logs' : 'Nhật Ký Thao Tác' }}</span>
            </router-link>
          </li>
          <li v-if="authStore.user?.role === 'admin'" class="nav-item">
            <router-link to="/admin/settings" class="sidebar-link d-flex align-items-center gap-2 py-2 px-3 rounded-3" active-class="sidebar-link-active">
              <i class="fa-solid fa-gear" style="width: 16px; text-align:center;"></i>
              <span>{{ langStore.isEnglish ? 'Restaurant Settings' : 'Cài Đặt Nhà Hàng' }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Footer: User Info + Language Toggle -->
      <div class="p-3 border-top border-white border-opacity-10">
        <!-- Language Switcher -->
        <div class="d-flex align-items-center justify-content-between mb-3 bg-white bg-opacity-10 p-2 rounded-3">
          <small class="text-white-50" style="font-size: 0.75rem;">
            <i class="fa-solid fa-globe me-1"></i>
            {{ langStore.isEnglish ? 'Language' : 'Ngôn ngữ' }}:
          </small>
          <button
            @click="langStore.toggleLang()"
            class="btn btn-warning btn-sm fw-bold rounded-pill"
            style="font-size: 0.75rem; padding: 2px 10px;"
          >
            {{ langStore.currentLang }}
          </button>
        </div>

        <!-- User Info -->
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2 overflow-hidden flex-grow-1">
            <i class="fa-solid fa-circle-user fs-4 text-danger flex-shrink-0"></i>
            <div class="overflow-hidden">
              <strong class="d-block text-white text-truncate" style="font-size: 0.85rem;">{{ authStore.user?.name }}</strong>
              <small class="text-warning text-uppercase" style="font-size: 0.7rem;">
                {{
                  authStore.user?.role === 'admin' ? (langStore.isEnglish ? 'Admin' : 'Quản Trị Viên') :
                  authStore.user?.role === 'manager' ? (langStore.isEnglish ? 'Manager' : 'Quản Lý') :
                  authStore.user?.role === 'staff' ? (langStore.isEnglish ? 'Staff' : 'Nhân Viên') :
                  authStore.user?.role
                }}
              </small>
            </div>
          </div>
          <button @click="handleLogout" class="btn btn-outline-light btn-sm rounded-circle flex-shrink-0" style="width: 32px; height: 32px; padding: 0;" title="Đăng xuất">
            <i class="fa-solid fa-power-off" style="font-size: 0.8rem;"></i>
          </button>
        </div>

        <router-link to="/" class="btn btn-outline-warning btn-sm w-100 mt-3 rounded-3 fw-semibold" style="font-size: 0.78rem;">
          <i class="fa-solid fa-store me-1"></i>
          {{ langStore.isEnglish ? 'Back to Customer Store' : 'Trở Về Trang Khách' }}
        </router-link>
      </div>
    </aside>

    <!-- Main Content Area: cuộn độc lập, sidebar cố định -->
    <main class="flex-grow-1 p-4 overflow-y-auto" style="min-height: 100vh; max-height: 100vh; overflow-y: auto;">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/authStore";
import { useLangStore } from "../stores/langStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const langStore = useLangStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}
.admin-sidebar::-webkit-scrollbar {
  width: 4px;
}
.admin-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
}

/* Nav link mặc định: trắng 70% */
.sidebar-link {
  color: rgba(255, 255, 255, 0.72) !important;
  text-decoration: none;
  transition: all 0.18s ease;
  font-weight: 500;
}
.sidebar-link:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}
/* Active state: nền đỏ, chữ trắng đậm */
.sidebar-link-active,
.sidebar-link.router-link-active {
  background: #dc3545 !important;
  color: #fff !important;
  font-weight: 700 !important;
}
/* Dashboard: dùng exact để tránh match mọi /admin/* */
</style>
