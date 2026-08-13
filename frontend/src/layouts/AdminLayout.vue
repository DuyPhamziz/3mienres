<template>
  <div class="d-flex min-vh-100 bg-light">
    <!-- Sidebar Left -->
    <aside class="bg-dark text-white p-3 d-flex flex-column" style="width: 260px; min-height: 100vh;">
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
      </nav>

      <div class="pt-3 border-top border-secondary border-opacity-50 mt-auto">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-user-shield text-warning fs-5"></i>
            <span class="small fw-medium">{{ authStore.user?.name }}</span>
          </div>
          <router-link to="/" class="btn btn-outline-light btn-sm rounded-circle" title="Về trang chủ Web">
            <i class="fa-solid fa-house"></i>
          </router-link>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow-1 p-4 overflow-auto">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/authStore";
const authStore = useAuthStore();
</script>
