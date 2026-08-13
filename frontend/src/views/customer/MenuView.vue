<template>
  <div class="py-5">
    <div class="container">
      <div class="text-center mb-5">
        <span class="text-danger fw-bold text-uppercase tracking-wider">Thực đơn đặc sản</span>
        <h1 class="display-5 fw-bold brand-font">Ẩm Thực 3 Miền Bắc – Trung – Nam</h1>
        <p class="text-muted">Chọn bộ lọc theo Vùng Miền hoặc Tìm kiếm tên món để khám phá món ăn yêu thích</p>
      </div>

      <!-- Filters Row -->
      <div class="glass-card p-3 mb-5 rounded-4 shadow-sm">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
              <input
                v-model="searchQuery"
                @input="applyFilters"
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Tìm kiếm tên món ăn..."
              />
            </div>
          </div>

          <div class="col-md-8 d-flex flex-wrap gap-2 justify-content-md-end">
            <!-- Filter by Region -->
            <div class="btn-group" role="group">
              <button
                @click="setRegion('')"
                :class="['btn btn-sm rounded-pill px-3', selectedRegion === '' ? 'btn-danger' : 'btn-outline-secondary']"
              >Tất cả miền</button>
              <button
                @click="setRegion('Bắc')"
                :class="['btn btn-sm rounded-pill px-3', selectedRegion === 'Bắc' ? 'btn-primary' : 'btn-outline-primary']"
              >Miền Bắc</button>
              <button
                @click="setRegion('Trung')"
                :class="['btn btn-sm rounded-pill px-3', selectedRegion === 'Trung' ? 'btn-warning text-dark' : 'btn-outline-warning']"
              >Miền Trung</button>
              <button
                @click="setRegion('Nam')"
                :class="['btn btn-sm rounded-pill px-3', selectedRegion === 'Nam' ? 'btn-success' : 'btn-outline-success']"
              >Miền Nam</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="menuStore.loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải thực đơn 3 miền...</p>
      </div>

      <!-- Dishes Grid -->
      <div v-else-if="menuStore.dishes.length > 0" class="row g-4">
        <div v-for="dish in menuStore.dishes" :key="dish._id" class="col-lg-3 col-md-6">
          <div class="glass-card h-100 d-flex flex-column hover-lift overflow-hidden">
            <!-- Real Uploaded Image or FontAwesome Dish Icon Box -->
            <div class="position-relative text-center py-4 bg-light bg-gradient" style="min-height: 180px;">
              <img
                v-if="dish.image && dish.image.startsWith('http')"
                :src="dish.image"
                :alt="dish.name"
                class="w-100 position-absolute top-0 start-0 h-100"
                style="object-fit: cover;"
              />
              <div v-else class="my-3">
                <i
                  :class="[
                    'display-2 d-block',
                    dish.region === 'Bắc' ? 'fa-solid fa-bowl-food text-primary' : dish.region === 'Trung' ? 'fa-solid fa-pepper-hot text-warning' : 'fa-solid fa-utensils text-danger'
                  ]"
                ></i>
              </div>

              <span
                :class="[
                  'position-absolute top-0 end-0 m-2 badge rounded-pill px-2 py-1 fs-8 shadow-sm',
                  dish.region === 'Bắc' ? 'badge-region-bac' : dish.region === 'Trung' ? 'badge-region-trung' : 'badge-region-nam'
                ]"
              >
                Miền {{ dish.region }}
              </span>
            </div>

            <div class="p-4 d-flex flex-column flex-grow-1">
              <h5 class="fw-bold brand-font mb-2">{{ dish.name }}</h5>
              <p class="text-muted small leading-snug mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                {{ dish.description }}
              </p>

              <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                <span class="fw-bold text-danger fs-5">{{ dish.price.toLocaleString('vi-VN') }}đ</span>
                <router-link :to="`/mon-an/${dish.slug}`" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                  Chi Tiết <i class="fa-solid fa-chevron-right fs-8 ms-1"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 glass-card rounded-4">
        <i class="fa-solid fa-utensils display-1 text-secondary mb-3 d-block"></i>
        <h4 class="fw-bold">Chưa tìm thấy món ăn phù hợp</h4>
        <p class="text-muted small">Thử chọn miền khác hoặc tìm kiếm với từ khóa khác xem sao nhé!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMenuStore } from "../../stores/menuStore";
import { useRoute } from "vue-router";

const menuStore = useMenuStore();
const route = useRoute();

const searchQuery = ref("");
const selectedRegion = ref(route.query.region || "");

const setRegion = (region) => {
  selectedRegion.value = region;
  applyFilters();
};

const applyFilters = () => {
  const params = {};
  if (selectedRegion.value) params.region = selectedRegion.value;
  if (searchQuery.value) params.search = searchQuery.value;
  menuStore.fetchDishes(params);
};

onMounted(() => {
  menuStore.fetchCategories();
  applyFilters();
});
</script>
