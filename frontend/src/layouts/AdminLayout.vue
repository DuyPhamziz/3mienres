<template>
  <div class="d-flex min-vh-100 bg-light">
    <!-- Sidebar Left -->
    <aside class="bg-dark text-white p-3 d-flex flex-column" style="width: 260px; min-height: 100vh;">
      <div class="d-flex align-items-center gap-2 mb-4 px-2">
        <span class="fs-2">🦀</span>
        <div>
          <span class="fw-bold fs-5 brand-font text-danger d-block">POS MANAGER</span>
          <small class="text-secondary fs-8">Nhà hàng 3 Miền Cua</small>
        </div>
      </div>

      <nav class="nav flex-column gap-1 flex-grow-1">
        <router-link to="/admin" class="nav-link text-white rounded-3 px-3 py-2" active-class="bg-danger fw-bold">
          <i class="fa-solid fa-chart-pie me-2"></i> Báo Cáo Dashboard
        </router-link>
        <router-link to="/admin/pos" class="nav-link text-white rounded-3 px-3 py-2" active-class="bg-danger fw-bold">
          <i class="fa-solid fa-cash-register me-2"></i> Quản Lý POS Bàn Ăn
        </router-link>
        <router-link to="/admin/tables" class="nav-link text-white rounded-3 px-3 py-2" active-class="bg-danger fw-bold">
          <i class="fa-solid fa-border-all me-2"></i> Sơ Đồ Bàn & Ghép Bàn
        </router-link>
        <router-link to="/admin/reservations" class="nav-link text-white rounded-3 px-3 py-2" active-class="bg-danger fw-bold">
          <i class="fa-solid fa-calendar-check me-2"></i> Đơn Đặt Bàn (Check-in)
        </router-link>
        <router-link to="/admin/menu" class="nav-link text-white rounded-3 px-3 py-2" active-class="bg-danger fw-bold">
          <i class="fa-solid fa-utensils me-2"></i> Thực Đơn 3 Miền
        </router-link>
        <router-link to="/admin/inventory" class="nav-link text-white rounded-3 px-3 py-2" active-class="bg-danger fw-bold">
          <i class="fa-solid fa-boxes-stacked me-2"></i> Kho & Công Thức Món
        </router-link>
        <router-link to="/admin/suppliers" class="nav-link text-white rounded-3 px-3 py-2" active-class="bg-danger fw-bold">
          <i class="fa-solid fa-truck-field me-2"></i> Nhà Cung Cấp
        </router-link>
      </nav>

      <div class="pt-3 border-top border-secondary mt-auto">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-user-shield text-warning"></i>
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
