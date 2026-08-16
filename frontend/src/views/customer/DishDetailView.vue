<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container max-w-6xl">
      <!-- Back button -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <router-link to="/thuc-don" class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold">
          <i class="fa-solid fa-arrow-left me-1"></i> {{ langStore.isEnglish ? 'Back to Menu' : 'Quay Lại Thực Đơn' }}
        </router-link>
        <span class="text-muted small">
          {{ langStore.isEnglish ? 'Menu' : 'Thực Đơn' }} / <strong class="text-dark">{{ dish?.category?.name || 'Đặc Sản' }}</strong> / {{ dish?.name }}
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
        <p class="text-muted small mt-2">{{ langStore.isEnglish ? 'Loading dish details...' : 'Đang tải thông tin món ăn...' }}</p>
      </div>

      <!-- Dish Not Found -->
      <div v-else-if="!dish" class="glass-card p-5 rounded-5 text-center bg-white border">
        <i class="fa-solid fa-utensils display-4 text-muted mb-3 d-block"></i>
        <h4 class="fw-bold text-dark">{{ langStore.isEnglish ? 'Dish not found' : 'Không tìm thấy món ăn này' }}</h4>
        <router-link to="/thuc-don" class="btn btn-danger rounded-pill px-4 mt-3 fw-bold">
          {{ langStore.isEnglish ? 'Explore Full Menu' : 'Khám Phá Toàn Bộ Thực Đơn' }}
        </router-link>
      </div>

      <!-- Main Dish Details -->
      <div v-else>
        <div class="glass-card p-4 p-md-5 rounded-5 shadow-sm bg-white border mb-4">
          <div class="row g-4 g-lg-5 align-items-center">
            <!-- Cột trái: Ảnh món ăn + Badge Vùng Miền -->
            <div class="col-lg-6">
              <div class="position-relative rounded-4 overflow-hidden shadow-sm bg-light" style="height: 380px;">
                <img
                  :src="getImageUrl(dish.image)"
                  :alt="dish.name"
                  class="w-100 h-100 object-fit-cover"
                  onerror="this.src='/images/dishes/default-dish.jpg'"
                />
                <span
                  :class="[
                    'badge position-absolute top-0 end-0 m-3 px-3 py-1.5 rounded-pill fs-8 shadow-sm fw-bold',
                    dish.region === 'Bắc' ? 'bg-primary' : dish.region === 'Trung' ? 'bg-warning text-dark' : 'bg-success'
                  ]"
                >
                  <i class="fa-solid fa-location-dot me-1"></i>
                  {{ langStore.isEnglish ? 'Specialty Region ' : 'Đặc Sản Miền ' }}{{ dish.region }}
                </span>

                <!-- Rating Floating Badge -->
                <div class="position-absolute bottom-0 start-0 m-3 px-3 py-1.5 bg-dark bg-opacity-75 text-white rounded-pill fs-8 fw-bold backdrop-blur d-flex align-items-center gap-1.5">
                  <i class="fa-solid fa-star text-warning"></i>
                  <span>{{ dish.ratingAverage ? dish.ratingAverage.toFixed(1) : '5.0' }}</span>
                  <span class="text-white-50 fs-9">({{ dish.ratingCount || 0 }} {{ langStore.isEnglish ? 'reviews' : 'đánh giá' }})</span>
                </div>
              </div>
            </div>

            <!-- Cột phải: Thông tin món ăn chi tiết -->
            <div class="col-lg-6">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-1.5 rounded-pill fw-bold fs-8 text-uppercase">
                  <i class="fa-solid fa-fire me-1"></i> {{ dish.category?.name || (langStore.isEnglish ? 'Seafood Specialty' : 'Ẩm Thực Đặc Sản') }}
                </span>
                <span v-if="dish.isAvailable !== false" class="badge bg-success bg-opacity-10 text-success px-2.5 py-1 rounded-pill fs-8 fw-semibold">
                  <i class="fa-solid fa-circle-check me-1"></i> {{ langStore.isEnglish ? 'Available Today' : 'Sẵn Sàng Phục Vụ' }}
                </span>
              </div>

              <h1 class="display-6 fw-bold brand-font text-dark mb-2">{{ dish.name }}</h1>

              <div class="d-flex align-items-baseline gap-2 mb-3">
                <span class="display-6 fw-bold text-danger brand-font">{{ dish.price.toLocaleString('vi-VN') }}đ</span>
                <span class="text-muted fs-7">/ {{ langStore.isEnglish ? 'serving' : 'phần dùng' }}</span>
              </div>

              <p class="text-secondary leading-relaxed mb-4 fs-7" style="line-height: 1.6;">
                {{ dish.description }}
              </p>

              <!-- Feature Highlights Grid -->
              <div class="row g-2.5 mb-4">
                <div class="col-6">
                  <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2">
                    <i class="fa-solid fa-shrimp text-danger fs-6"></i>
                    <div>
                      <small class="text-muted d-block fs-9">{{ langStore.isEnglish ? 'Ingredients' : 'Nguyên liệu' }}</small>
                      <strong class="text-dark fs-8">{{ langStore.isEnglish ? '100% Fresh Daily' : 'Tươi sống trong ngày' }}</strong>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2">
                    <i class="fa-solid fa-clock text-danger fs-6"></i>
                    <div>
                      <small class="text-muted d-block fs-9">{{ langStore.isEnglish ? 'Cook Time' : 'Chế biến' }}</small>
                      <strong class="text-dark fs-8">15 - 20 {{ langStore.isEnglish ? 'mins' : 'phút' }}</strong>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2">
                    <i class="fa-solid fa-pepper-hot text-danger fs-6"></i>
                    <div>
                      <small class="text-muted d-block fs-9">{{ langStore.isEnglish ? 'Flavor' : 'Hương vị' }}</small>
                      <strong class="text-dark fs-8">{{ langStore.isEnglish ? 'Authentic 3-Region' : 'Chuẩn vị truyền thống' }}</strong>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2">
                    <i class="fa-solid fa-kitchen-set text-danger fs-6"></i>
                    <div>
                      <small class="text-muted d-block fs-9">{{ langStore.isEnglish ? 'Chef' : 'Bếp trưởng' }}</small>
                      <strong class="text-dark fs-8">{{ langStore.isEnglish ? 'Expert 3-Region' : 'Nghệ nhân 3 Miền' }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="d-flex gap-3 flex-wrap">
                <router-link to="/dat-ban" class="btn btn-primary-crab px-4 py-2.5 fw-bold flex-grow-1 shadow-sm">
                  <i class="fa-solid fa-calendar-check me-2"></i> {{ langStore.isEnglish ? 'Pre-order & Book Table' : 'Đặt Bàn & Gọi Món Này' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ KHU VỰC ĐÁNH GIÁ & NHẬN XÉT CỦA THỰC KHÁCH ═══ -->
        <DishReviewSection
          :dish-id="dish._id"
          :is-authenticated="authStore.isAuthenticated"
          :is-english="langStore.isEnglish"
          @review-added="fetchDish"
        />

        <!-- ═══ GỢI Ý MÓN CÙNG MIỀN / ĐẶC SẢN ═══ -->
        <div v-if="relatedDishes.length > 0" class="mt-5">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="fw-bold brand-font text-dark mb-0">
              <i class="fa-solid fa-utensils text-danger me-2"></i>
              {{ langStore.isEnglish ? `Other Specialties from Region ${dish.region}` : `Đặc Sản Cùng Miền ${dish.region}` }}
            </h4>
            <router-link to="/thuc-don" class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold">
              {{ langStore.isEnglish ? 'View All' : 'Xem Tất Cả' }}
            </router-link>
          </div>

          <div class="row g-3">
            <div v-for="rel in relatedDishes" :key="rel._id" class="col-md-4 col-sm-6">
              <router-link :to="`/mon-an/${rel.slug}`" class="text-decoration-none">
                <div class="glass-card p-3 rounded-4 bg-white border hover-lift h-100 d-flex flex-column justify-content-between">
                  <div class="d-flex gap-3 align-items-center mb-2">
                    <img
                      :src="getImageUrl(rel.image)"
                      :alt="rel.name"
                      class="rounded-3 object-fit-cover flex-shrink-0"
                      style="width: 64px; height: 64px;"
                      onerror="this.src='/images/dishes/default-dish.jpg'"
                    />
                    <div class="min-w-0">
                      <h6 class="fw-bold text-dark text-truncate mb-1 brand-font">{{ rel.name }}</h6>
                      <strong class="text-danger fs-7">{{ rel.price.toLocaleString('vi-VN') }}đ</strong>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center small text-muted pt-2 border-top">
                    <span class="fs-9"><i class="fa-solid fa-star text-warning me-1"></i>{{ rel.ratingAverage ? rel.ratingAverage.toFixed(1) : '5.0' }}</span>
                    <span class="text-danger fw-semibold fs-9">{{ langStore.isEnglish ? 'Details' : 'Xem Món' }} <i class="fa-solid fa-arrow-right"></i></span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useLangStore } from "../../stores/langStore";
import { getImageUrl } from "../../utils/imageHelper";
import DishReviewSection from "../../components/customer/DishReviewSection.vue";

const route = useRoute();
const authStore = useAuthStore();
const langStore = useLangStore();

const dish = ref(null);
const loading = ref(false);
const relatedDishes = ref([]);

const fetchDish = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/dishes/slug/${route.params.slug}`);
    dish.value = res.data.data.dish;

    if (dish.value && dish.value.region) {
      fetchRelatedDishes(dish.value.region, dish.value._id);
    }
  } catch (err) {
    console.error("Lỗi lấy chi tiết món ăn:", err);
  } finally {
    loading.value = false;
  }
};

const fetchRelatedDishes = async (region, currentDishId) => {
  try {
    const res = await api.get(`/dishes?region=${encodeURIComponent(region)}&limit=4`);
    const list = res.data.data.dishes || [];
    relatedDishes.value = list.filter((d) => d._id !== currentDishId).slice(0, 3);
  } catch (err) {
    console.error("Lỗi lấy món liên quan:", err);
  }
};

watch(
  () => route.params.slug,
  () => {
    fetchDish();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
);

onMounted(() => {
  fetchDish();
});
</script>

<style scoped>
.backdrop-blur {
  backdrop-filter: blur(6px);
}
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}
</style>
