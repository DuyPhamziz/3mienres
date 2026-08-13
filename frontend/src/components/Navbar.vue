<template>
  <nav class="navbar navbar-expand-lg glass-nav sticky-top py-3">
    <div class="container">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
        <span class="fs-2">🦀</span>
        <div>
          <span class="fw-bold fs-4 brand-font text-danger d-block leading-none">3 MIỀN CUA</span>
          <small class="text-muted fs-7 d-block leading-none fw-normal" style="font-size: 0.75rem;">Ẩm thực đặc sản Bắc - Trung - Nam</small>
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
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3 fw-medium">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active text-danger fw-bold">Trang Chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/thuc-don" class="nav-link" active-class="active text-danger fw-bold">Thực Đơn 3 Miền</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/dat-ban" class="nav-link" active-class="active text-danger fw-bold">
              <i class="fa-solid fa-calendar-check me-1 text-danger"></i> Đặt Bàn Online
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tra-cuu" class="nav-link" active-class="active text-danger fw-bold">Tra Cứu Đơn</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/hang-thanh-vien" class="nav-link" active-class="active text-danger fw-bold">
              <i class="fa-solid fa-crown me-1 text-warning"></i> Hạng Thành Viên
            </router-link>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-2">
          <!-- Nếu đã đăng nhập -->
          <div v-if="authStore.isAuthenticated" class="dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i class="fa-solid fa-circle-user fs-5 text-danger"></i>
              <span class="fw-semibold fs-7">{{ authStore.user?.name }}</span>
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
            <router-link to="/login" class="btn btn-link text-decoration-none text-dark fw-semibold px-3">
              Đăng Nhập
            </router-link>
            <router-link to="/dat-ban" class="btn btn-primary-crab">
              Đặt Bàn Ngay
            </router-link>
          </template>
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
