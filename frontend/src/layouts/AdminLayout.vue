<template>
  <div class="d-flex min-vh-100 bg-light">
    <!-- Sidebar Left -->
    <aside class="admin-sidebar bg-dark text-white p-3 d-flex flex-column justify-content-between" style="width: 260px; min-height: 100vh; flex-shrink: 0;">
      <div>
        <!-- Brand Header -->
        <div class="d-flex align-items-center gap-2 mb-4 p-2 rounded-3 bg-white bg-opacity-10">
          <div class="p-2 bg-danger text-white rounded-3">
            <i class="fa-solid fa-utensils fs-4"></i>
          </div>
          <div>
            <strong class="d-block text-white brand-font leading-none fs-6">{{ langStore.t('admin.sidebar.systemTitle') }}</strong>
            <small class="text-warning fs-8">{{ langStore.isEnglish ? 'Specialty Restaurant' : 'Nhà Hàng 3 Miền Cua' }}</small>
          </div>
        </div>

        <!-- Navigation Links -->
        <ul class="nav nav-pills flex-column gap-1 fs-7">
          <li class="nav-item">
            <router-link to="/admin" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-chart-pie"></i> {{ langStore.t('admin.sidebar.dashboard') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/tables" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-chair"></i> {{ langStore.t('admin.sidebar.tableGrid') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/reservations" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-calendar-check"></i> {{ langStore.t('admin.sidebar.reservations') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/pos" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-cash-register"></i> {{ langStore.t('admin.sidebar.posSession') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/kitchen" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-fire-burner"></i> {{ langStore.t('admin.sidebar.kitchen') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/menu" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-book-open"></i> {{ langStore.t('admin.sidebar.menuManager') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/inventory" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-boxes-stacked"></i> {{ langStore.t('admin.sidebar.inventory') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/suppliers" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-truck-field"></i> {{ langStore.t('admin.sidebar.suppliers') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/vouchers" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-tags"></i> {{ langStore.t('admin.sidebar.vouchers') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/staff" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-users-gear"></i> {{ langStore.t('admin.sidebar.staff') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/audit-logs" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-clock-rotate-left"></i> {{ langStore.t('admin.sidebar.audit') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/settings" class="nav-link text-white-50 d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3" active-class="active bg-danger text-white fw-bold">
              <i class="fa-solid fa-gear"></i> {{ langStore.t('admin.sidebar.settings') }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Footer User Info & Language Toggle -->
      <div class="border-top border-white border-opacity-10 pt-3">
        <!-- Language Switcher in Admin Sidebar -->
        <div class="d-flex align-items-center justify-content-between mb-3 bg-white bg-opacity-10 p-2 rounded-3">
          <small class="text-white-50 fs-8"><i class="fa-solid fa-globe me-1"></i>Language:</small>
          <button
            @click="langStore.toggleLang()"
            class="btn btn-warning btn-sm py-0.5 px-2.5 fw-bold fs-8 rounded-pill"
          >
            {{ langStore.currentLang }}
          </button>
        </div>

        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2 overflow-hidden">
            <i class="fa-solid fa-user-circle fs-3 text-danger"></i>
            <div class="text-truncate">
              <strong class="d-block text-white fs-7 text-truncate">{{ authStore.user?.name }}</strong>
              <small class="text-warning fs-8 text-uppercase">{{ authStore.user?.role }}</small>
            </div>
          </div>
          <button @click="handleLogout" class="btn btn-outline-light btn-sm rounded-circle p-1.5" title="Đăng xuất">
            <i class="fa-solid fa-power-off"></i>
          </button>
        </div>

        <router-link to="/" class="btn btn-outline-warning btn-sm w-100 mt-3 rounded-3 fs-8 fw-semibold">
          <i class="fa-solid fa-store me-1"></i> {{ langStore.t('admin.sidebar.backToStore') }}
        </router-link>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow-1 p-4 overflow-y-auto">
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
