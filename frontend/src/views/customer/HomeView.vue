<template>
  <div>
    <!-- Hero Section with Swiper Slider & Glass Banner -->
    <section class="py-5 position-relative overflow-hidden" style="background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);">
      <div class="container py-4">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-3 fs-8">
              <i class="fa-solid fa-utensils me-1"></i> {{ langStore.t('home.badge') }}
            </span>
            <h1 class="display-4 fw-bold brand-font text-dark leading-tight mb-3">
              {{ langStore.t('home.title') }}
            </h1>
            <p class="text-muted leading-relaxed mb-4 fs-6">
              {{ langStore.t('home.desc') }}
            </p>
            <div class="d-flex flex-wrap gap-3">
              <router-link to="/dat-ban" class="btn btn-primary-crab btn-lg px-4 py-3 fw-bold shadow">
                <i class="fa-solid fa-calendar-check me-2"></i> {{ langStore.t('home.bookBtn') }}
              </router-link>
              <router-link to="/thuc-don" class="btn btn-outline-danger btn-lg px-4 py-3 fw-bold rounded-pill">
                {{ langStore.t('home.menuBtn') }}
              </router-link>
            </div>
          </div>
          <div class="col-lg-6">
            <HeroSwiper />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Highlight -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="p-4 rounded-4 glass-card h-100 border-0 shadow-sm">
              <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-4 d-inline-block mb-3">
                <i class="fa-solid fa-chair fs-3"></i>
              </div>
              <h5 class="fw-bold text-dark mb-2">{{ langStore.t('home.feature1Title') }}</h5>
              <p class="text-muted small mb-0">{{ langStore.t('home.feature1Desc') }}</p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-4 rounded-4 glass-card h-100 border-0 shadow-sm">
              <div class="p-3 bg-warning bg-opacity-15 text-warning rounded-4 d-inline-block mb-3">
                <i class="fa-solid fa-gem fs-3"></i>
              </div>
              <h5 class="fw-bold text-dark mb-2">{{ langStore.t('home.feature2Title') }}</h5>
              <p class="text-muted small mb-0">{{ langStore.t('home.feature2Desc') }}</p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-4 rounded-4 glass-card h-100 border-0 shadow-sm">
              <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-4 d-inline-block mb-3">
                <i class="fa-solid fa-crown fs-3"></i>
              </div>
              <h5 class="fw-bold text-dark mb-2">{{ langStore.t('home.feature3Title') }}</h5>
              <p class="text-muted small mb-0">{{ langStore.t('home.feature3Desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Menu Preview -->
    <section class="py-5 bg-light">
      <div class="container py-3">
        <div class="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-1.5 rounded-pill fw-bold mb-2 fs-8">THỰC ĐƠN ĐẮC SẮC</span>
            <h2 class="fw-bold brand-font text-dark mb-0">{{ langStore.t('home.featuredTitle') }}</h2>
          </div>
          <router-link to="/thuc-don" class="btn btn-link text-danger fw-bold text-decoration-none">
            {{ langStore.t('home.viewAll') }} <i class="fa-solid fa-arrow-right fs-8"></i>
          </router-link>
        </div>

        <div v-if="menuStore.loading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status"></div>
        </div>

        <div v-else class="row g-4">
          <div v-for="dish in featuredDishes" :key="dish._id" class="col-md-6 col-lg-3">
            <div class="card border-0 rounded-4 shadow-sm overflow-hidden h-100 hover-lift">
              <div class="position-relative bg-light" style="height: 180px;">
                <img
                  :src="dish.image && dish.image !== 'default-dish.jpg' ? `http://localhost:3000/uploads/${dish.image}` : 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=500&q=80'"
                  :alt="dish.name"
                  class="w-100 h-100 object-fit-cover"
                />
                <span class="badge bg-danger position-absolute top-0 start-0 m-3 px-2.5 py-1.5 rounded-pill fs-8">
                  {{ dish.region || 'Đặc sản' }}
                </span>
              </div>
              <div class="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <h6 class="fw-bold text-dark mb-2">{{ dish.name }}</h6>
                  <p class="text-muted small line-clamp-2 mb-3">{{ dish.description }}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center border-top pt-3">
                  <span class="fw-bold text-danger fs-6">{{ dish.price.toLocaleString('vi-VN') }}đ</span>
                  <router-link to="/dat-ban" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                    {{ langStore.t('home.bookBtn') }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import HeroSwiper from "../../components/HeroSwiper.vue";
import { useMenuStore } from "../../stores/menuStore";
import { useLangStore } from "../../stores/langStore";

const menuStore = useMenuStore();
const langStore = useLangStore();

onMounted(() => {
  menuStore.fetchDishes();
});

const featuredDishes = computed(() => {
  return menuStore.dishes.slice(0, 4);
});
</script>
