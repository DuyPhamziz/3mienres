<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <!-- Title Header -->
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8 text-uppercase">
          <i class="fa-solid fa-utensils me-1"></i> {{ langStore.t('home.badge') }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">
          {{ langStore.t('menu.title') }}
        </h1>
        <p class="text-muted small">
          {{ langStore.t('menu.subtitle') }}
        </p>
      </div>

      <!-- DUAL FILTER TOOLBAR (3 MIỀN + CATEGORIES TỪ DB) -->
      <div class="glass-card p-4 mb-4 rounded-5 shadow-sm bg-white border-0">
        <!-- Row 1: Search & 3 Miền Region Filter -->
        <div class="row g-3 align-items-center mb-3">
          <div class="col-lg-5">
            <div class="form-control-icon">
              <input
                v-model="searchQuery"
                @input="handleFilterChange"
                type="text"
                class="form-control py-2.5"
                :placeholder="langStore.isEnglish ? 'Search dish name...' : 'Tìm kiếm tên món ăn...'"
              />
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>

          <!-- 3 Miền Filter (Đặc trưng nhà hàng) -->
          <div class="col-lg-7 d-flex flex-wrap gap-2 justify-content-lg-end align-items-center">
            <span class="fw-bold fs-7 text-muted me-1 d-none d-sm-inline">
              <i class="fa-solid fa-map-location-dot text-danger me-1"></i>{{ langStore.isEnglish ? 'Region:' : 'Vùng miền:' }}
            </span>
            <button
              @click="setRegion('')"
              :class="['btn btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap', selectedRegion === '' ? 'btn-danger shadow-sm' : 'btn-outline-secondary']"
            >
              {{ langStore.isEnglish ? 'All Regions' : 'Tất cả miền' }}
            </button>
            <button
              @click="setRegion('Bắc')"
              :class="['btn btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap', selectedRegion === 'Bắc' ? 'btn-primary shadow-sm' : 'btn-outline-primary']"
            >
              <i class="fa-solid fa-bowl-food me-1"></i> {{ langStore.isEnglish ? 'North Region' : 'Miền Bắc' }}
            </button>
            <button
              @click="setRegion('Trung')"
              :class="['btn btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap', selectedRegion === 'Trung' ? 'btn-warning text-dark shadow-sm' : 'btn-outline-warning']"
            >
              <i class="fa-solid fa-pepper-hot me-1"></i> {{ langStore.isEnglish ? 'Central Region' : 'Miền Trung' }}
            </button>
            <button
              @click="setRegion('Nam')"
              :class="['btn btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap', selectedRegion === 'Nam' ? 'btn-success shadow-sm' : 'btn-outline-success']"
            >
              <i class="fa-solid fa-utensils me-1"></i> {{ langStore.isEnglish ? 'South Region' : 'Miền Nam' }}
            </button>
          </div>
        </div>

        <!-- Row 2: Categories Filter (Đổ động từ DB Collection Categories) -->
        <div class="pt-3 border-top d-flex align-items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span class="fw-bold fs-7 text-muted me-1 text-nowrap">
            <i class="fa-solid fa-layer-group text-warning me-1"></i>{{ langStore.isEnglish ? 'Categories:' : 'Danh mục DB:' }}
          </span>
          <button
            @click="setCategory('')"
            :class="['btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold fs-7', selectedCategory === '' ? 'btn-dark' : 'btn-light border']"
          >
            {{ langStore.isEnglish ? 'All Categories' : 'Tất cả danh mục' }}
          </button>
          <button
            v-for="cat in menuStore.categories"
            :key="cat._id"
            @click="setCategory(cat._id)"
            :class="['btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold fs-7', selectedCategory === cat._id ? 'btn-danger shadow-sm' : 'btn-light border']"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="menuStore.loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
        <p class="mt-2 text-muted small">{{ langStore.isEnglish ? 'Loading 3-Region menu...' : 'Đang tải danh sách thực đơn 3 miền...' }}</p>
      </div>

      <!-- Dishes Grid -->
      <div v-else-if="paginatedDishes.length > 0">
        <div class="row g-4 mb-4">
          <div v-for="dish in paginatedDishes" :key="dish._id" class="col-xl-3 col-lg-4 col-md-6">
            <div class="card border-0 rounded-4 shadow-sm overflow-hidden h-100 glass-card hover-lift bg-white">
              <div class="position-relative bg-light" style="height: 190px;">
                <img
                  :src="getImageUrl(dish.image)"
                  :alt="dish.name"
                  class="w-100 h-100 object-fit-cover"
                />
                <span
                  :class="[
                    'badge position-absolute top-0 end-0 m-3 px-2.5 py-1.5 rounded-pill fs-8 shadow-sm',
                    dish.region === 'Bắc' ? 'bg-primary' : dish.region === 'Trung' ? 'bg-warning text-dark' : 'bg-success'
                  ]"
                >
                  {{ langStore.isEnglish ? 'Region ' : 'Miền ' }}{{ dish.region }}
                </span>
                <span v-if="dish.category" class="badge bg-dark bg-opacity-75 position-absolute bottom-0 start-0 m-3 px-2 py-1 fs-8 rounded-2">
                  {{ dish.category.name || 'Seafood' }}
                </span>
              </div>

              <div class="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <h6 class="fw-bold text-dark mb-2 brand-font fs-6">{{ dish.name }}</h6>
                  <p class="text-muted small line-clamp-2 mb-3 leading-snug">{{ dish.description }}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                  <span class="fw-bold text-danger fs-5">{{ dish.price.toLocaleString('vi-VN') }}đ</span>
                  <router-link :to="`/mon-an/${dish.slug}`" class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">
                    {{ langStore.isEnglish ? 'Detail' : 'Chi Tiết' }} <i class="fa-solid fa-chevron-right fs-8 ms-1"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PAGINATION BAR (12 món / trang) -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center pt-3 border-top gap-3">
          <div class="text-muted small">
            {{ langStore.isEnglish ? 'Showing dishes' : 'Hiển thị món' }} <strong>{{ startIndex + 1 }} - {{ Math.min(endIndex, filteredDishes.length) }}</strong> {{ langStore.isEnglish ? 'of' : 'trong tổng số' }} <strong>{{ filteredDishes.length }}</strong> {{ langStore.isEnglish ? 'dishes' : 'món ăn' }}
          </div>

          <nav v-if="totalPages > 1" aria-label="Phân trang món ăn">
            <ul class="pagination pagination-sm mb-0 gap-1">
              <li :class="['page-item', currentPage === 1 ? 'disabled' : '']">
                <button @click="currentPage--" class="page-item-btn rounded-circle">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
              </li>

              <li v-for="page in totalPages" :key="page" :class="['page-item', currentPage === page ? 'active' : '']">
                <button @click="currentPage = page" :class="['page-item-btn rounded-circle fw-bold', currentPage === page ? 'btn-danger text-white' : '']">
                  {{ page }}
                </button>
              </li>

              <li :class="['page-item', currentPage === totalPages ? 'disabled' : '']">
                <button @click="currentPage++" class="page-item-btn rounded-circle">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 glass-card rounded-5 bg-white shadow-sm">
        <i class="fa-solid fa-utensils display-2 text-muted mb-3 d-block"></i>
        <h4 class="fw-bold text-dark">{{ langStore.isEnglish ? 'No Dishes Found' : 'Không Tìm Thấy Món Ăn Nào' }}</h4>
        <p class="text-muted small">{{ langStore.isEnglish ? 'Please try selecting another region or category' : 'Vui lòng thử chọn lại vùng miền hoặc danh mục khác' }}</p>
        <button @click="resetFilters" class="btn btn-outline-danger rounded-pill px-4 btn-sm">
          {{ langStore.isEnglish ? 'Reset Filters' : 'Thiết Lập Lại Bộ Lọc' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useMenuStore } from "../../stores/menuStore";
import { useLangStore } from "../../stores/langStore";
import { useRoute } from "vue-router";
import { getImageUrl } from "../../utils/imageHelper";

const menuStore = useMenuStore();
const langStore = useLangStore();
const route = useRoute();

const searchQuery = ref("");
const selectedRegion = ref(route.query.region || "");
const selectedCategory = ref("");
const currentPage = ref(1);
const itemsPerPage = 12;

const handleFilterChange = () => {
  currentPage.value = 1;
};

const setRegion = (region) => {
  selectedRegion.value = region;
  handleFilterChange();
};

const setCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  handleFilterChange();
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedRegion.value = "";
  selectedCategory.value = "";
  currentPage.value = 1;
};

const filteredDishes = computed(() => {
  return menuStore.dishes.filter((dish) => {
    if (selectedRegion.value && dish.region !== selectedRegion.value) {
      return false;
    }
    if (selectedCategory.value) {
      const catId = typeof dish.category === "object" ? dish.category?._id : dish.category;
      if (catId !== selectedCategory.value) return false;
    }
    if (searchQuery.value) {
      const query = searchQuery.value.trim().toLowerCase();
      const matchName = dish.name.toLowerCase().includes(query);
      const matchDesc = dish.description ? dish.description.toLowerCase().includes(query) : false;
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });
});

const totalPages = computed(() => Math.ceil(filteredDishes.value.length / itemsPerPage) || 1);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => startIndex.value + itemsPerPage);

const paginatedDishes = computed(() => {
  return filteredDishes.value.slice(startIndex.value, endIndex.value);
});

onMounted(() => {
  menuStore.fetchCategories();
  menuStore.fetchDishes();
});
</script>

<style scoped>
.page-item-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #dee2e6;
  background: white;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}
.page-item-btn:hover {
  background: #f8f9fa;
  border-color: #dc3545;
  color: #dc3545;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
