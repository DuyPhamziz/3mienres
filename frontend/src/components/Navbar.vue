<template>
  <nav class="navbar navbar-expand-xl glass-nav sticky-top py-2">
    <div class="container-fluid container-xl">
      <!-- Logo Brand -->
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 me-3">
        <div class="p-2 bg-danger bg-opacity-10 rounded-3 text-danger d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
          <i class="fa-solid fa-utensils fs-4"></i>
        </div>
        <div class="leading-none">
          <span class="fw-bold fs-5 brand-font text-danger d-block text-nowrap">3 MIỀN CUA</span>
          <small class="text-muted fs-8 d-block text-nowrap fw-normal" style="font-size: 0.7rem;">Ẩm thực đặc sản Bắc - Trung - Nam</small>
        </div>
      </router-link>

      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarMain"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarMain">
        <!-- Main Navigation Links (Single Line, Text-Nowrap) -->
        <ul class="navbar-nav mx-auto mb-2 mb-xl-0 gap-xl-2 align-items-center fw-semibold fs-7">
          <li class="nav-item">
            <router-link to="/" class="nav-link px-3 text-nowrap" active-class="active text-danger fw-bold">Trang Chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/thuc-don" class="nav-link px-3 text-nowrap" active-class="active text-danger fw-bold">Thực Đơn 3 Miền</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/dat-ban" class="nav-link px-3 text-nowrap" active-class="active text-danger fw-bold">
              <i class="fa-solid fa-calendar-check me-1 text-danger"></i> Đặt Bàn Online
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tra-cuu" class="nav-link px-3 text-nowrap" active-class="active text-danger fw-bold">Tra Cứu Đơn</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/hang-thanh-vien" class="nav-link px-3 text-nowrap" active-class="active text-danger fw-bold">
              <i class="fa-solid fa-crown me-1 text-warning"></i> Hạng Thành Viên
            </router-link>
          </li>
        </ul>

        <!-- Right Side Action Buttons -->
        <div class="d-flex align-items-center gap-2 ms-xl-2 mt-2 mt-xl-0">
          <!-- Nút Ngôn ngữ VI -->
          <div class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1.5 fs-7 d-flex align-items-center gap-1.5 text-nowrap">
            <i class="fa-solid fa-globe text-danger"></i>
            <span class="fw-semibold">VI</span>
          </div>

          <!-- Nếu đã đăng nhập -->
          <div v-if="authStore.isAuthenticated" class="dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle rounded-pill px-3 py-1.5 fs-7 d-flex align-items-center gap-2 text-nowrap"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i class="fa-solid fa-circle-user fs-6 text-danger"></i>
              <span class="fw-semibold">{{ authStore.user?.name }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-2 mt-2">
              <li v-if="authStore.isStaff">
                <router-link to="/admin" class="dropdown-item rounded-3 py-2 fw-medium text-danger">
                  <i class="fa-solid fa-chart-line me-2"></i> Trang Quản Lý POS
                </router-link>
              </li>
              <li>
                <router-link to="/hang-thanh-vien" class="dropdown-item rounded-3 py-2 fw-medium">
                  <i class="fa-solid fa-gem me-2 text-warning"></i> Điểm Tích Lũy: {{ (authStore.user?.totalSpent || 0).toLocaleString('vi-VN') }}đ
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button @click="handleLogout" class="dropdown-item rounded-3 py-2 fw-medium text-muted">
                  <i class="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng Xuất
                </button>
              </li>
            </ul>
          </div>

          <!-- Nếu chưa đăng nhập -->
          <template v-else>
            <router-link to="/login" class="btn btn-link text-decoration-none text-dark fw-semibold px-3 text-nowrap fs-7">
              Đăng Nhập
            </router-link>
          </template>

          <router-link to="/dat-ban" class="btn btn-primary-crab px-4 py-2 text-nowrap fs-7 fw-bold shadow-sm">
            Đặt Bàn Ngay
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};
</script>

<style scoped>
.navbar-nav .nav-link {
  white-space: nowrap !important;
  display: inline-flex;
  align-items: center;
}
</style>
