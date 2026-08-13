<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1"><i class="fa-solid fa-boxes-stacked text-danger me-2"></i>Quản Lý Kho & Công Thức Món</h2>
        <p class="text-muted small mb-0">Theo dõi tồn kho, cấu hình định lượng món và tạo phiếu nhập kho</p>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-pills mb-4 gap-2">
      <li class="nav-item">
        <button @click="activeTab = 'ingredients'" :class="['btn rounded-pill px-3', activeTab === 'ingredients' ? 'btn-danger' : 'btn-outline-secondary']">
          <i class="fa-solid fa-box me-1"></i> Nguyên Liệu
        </button>
      </li>
      <li class="nav-item">
        <button @click="activeTab = 'recipes'" :class="['btn rounded-pill px-3', activeTab === 'recipes' ? 'btn-danger' : 'btn-outline-secondary']">
          <i class="fa-solid fa-utensils me-1"></i> Công Thức Món
        </button>
      </li>
      <li class="nav-item">
        <button @click="activeTab = 'receipts'" :class="['btn rounded-pill px-3', activeTab === 'receipts' ? 'btn-danger' : 'btn-outline-secondary']">
          <i class="fa-solid fa-truck-field me-1"></i> Phiếu Nhập Kho
        </button>
      </li>
    </ul>

    <div class="glass-card p-4 rounded-4 bg-white">
      <IngredientTab v-if="activeTab === 'ingredients'" />
      <RecipeTab v-else-if="activeTab === 'recipes'" />
      <ImportReceiptTab v-else-if="activeTab === 'receipts'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import IngredientTab from "../../components/admin/IngredientTab.vue";
import RecipeTab from "../../components/admin/RecipeTab.vue";
import ImportReceiptTab from "../../components/admin/ImportReceiptTab.vue";

const activeTab = ref("ingredients");
</script>
