<template>
  <div class="inventory-manager-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-boxes-stacked text-danger me-2"></i>Quản Lý Kho Nguyên Liệu & Tiêu Thụ
        </h4>
        <p class="text-secondary small mb-0">
          Theo dõi tồn kho, cấu hình định lượng món, lập phiếu nhập kho sỉ và kiểm kê tổng kết tiêu thụ định kỳ.
        </p>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <ul class="nav nav-pills mb-4 gap-2 bg-light p-1.5 rounded-pill border d-inline-flex">
      <li class="nav-item">
        <button
          @click="activeTab = 'ingredients'"
          :class="['btn rounded-pill px-3.5 py-1.5 fw-semibold fs-8', activeTab === 'ingredients' ? 'btn-danger shadow-2xs' : 'btn-light border-0 text-secondary']"
        >
          <i class="fa-solid fa-boxes-stacked me-1.5"></i> Nguyên Liệu & Tồn Kho
        </button>
      </li>
      <li class="nav-item">
        <button
          @click="activeTab = 'recipes'"
          :class="['btn rounded-pill px-3.5 py-1.5 fw-semibold fs-8', activeTab === 'recipes' ? 'btn-danger shadow-2xs' : 'btn-light border-0 text-secondary']"
        >
          <i class="fa-solid fa-utensils me-1.5"></i> Công Thức Món Ăn
        </button>
      </li>
      <li class="nav-item">
        <button
          @click="activeTab = 'receipts'"
          :class="['btn rounded-pill px-3.5 py-1.5 fw-semibold fs-8', activeTab === 'receipts' ? 'btn-danger shadow-2xs' : 'btn-light border-0 text-secondary']"
        >
          <i class="fa-solid fa-truck-ramp-box me-1.5"></i> Nhập Kho Sỉ
        </button>
      </li>
      <li class="nav-item">
        <button
          @click="activeTab = 'audit'"
          :class="['btn rounded-pill px-3.5 py-1.5 fw-semibold fs-8', activeTab === 'audit' ? 'btn-danger shadow-2xs' : 'btn-light border-0 text-secondary']"
        >
          <i class="fa-solid fa-scale-balanced me-1.5"></i> Kiểm Kê & Tổng Kết Tiêu Thụ
        </button>
      </li>
    </ul>

    <!-- Tabs Content -->
    <div class="glass-card p-4 rounded-4 bg-white shadow-2xs">
      <IngredientTab v-if="activeTab === 'ingredients'" />
      <RecipeTab v-else-if="activeTab === 'recipes'" />
      <ImportReceiptTab v-else-if="activeTab === 'receipts'" />
      <StockAuditTab v-else-if="activeTab === 'audit'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import IngredientTab from "../../components/admin/IngredientTab.vue";
import RecipeTab from "../../components/admin/RecipeTab.vue";
import ImportReceiptTab from "../../components/admin/ImportReceiptTab.vue";
import StockAuditTab from "../../components/admin/StockAuditTab.vue";

const activeTab = ref("ingredients");
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
