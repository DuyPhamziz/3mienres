<template>
  <div class="home-page-container">
    <!-- 1. FULL-WIDTH HERO SWIPER SECTION (Phủ tràn toàn màn hình) -->
    <section class="hero-full-section position-relative p-0 m-0">
      <HeroSwiper />
    </section>

    <!-- 2. FLOATING FEATURES HIGHLIGHT BAR (Thanh cam kết nổi tạo chiều sâu 3D) -->
    <section class="position-relative z-3 floating-feature-section">
      <div class="container">
        <div class="row g-3 g-md-4">
          <div class="col-md-4">
            <div class="p-4 rounded-4 bg-white shadow-md border-0 h-100 feature-hover-card transition-all d-flex align-items-start gap-3">
              <div class="feature-icon-wrapper bg-danger bg-opacity-10 text-danger rounded-4 p-3 flex-shrink-0">
                <i class="fa-solid fa-water-lower fs-3"></i>
              </div>
              <div>
                <h5 class="fw-bold text-dark mb-1 fs-6">{{ langStore.t('home.feature1Title') || 'Hải Sản Tươi Sống Tại Bể' }}</h5>
                <p class="text-muted small mb-0 leading-relaxed">{{ langStore.t('home.feature1Desc') || 'Cua Cà Mau và hải sản được chọn lọc tươi rói, chế biến trực tiếp theo yêu cầu.' }}</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-4 rounded-4 bg-white shadow-md border-0 h-100 feature-hover-card transition-all d-flex align-items-start gap-3">
              <div class="feature-icon-wrapper bg-warning bg-opacity-15 text-warning rounded-4 p-3 flex-shrink-0">
                <i class="fa-solid fa-fire-burner fs-3"></i>
              </div>
              <div>
                <h5 class="fw-bold text-dark mb-1 fs-6">{{ langStore.t('home.feature2Title') || 'Bếp Trưởng Chuẩn Vị 3 Miền' }}</h5>
                <p class="text-muted small mb-0 leading-relaxed">{{ langStore.t('home.feature2Desc') || 'Gia vị truyền thống Bắc - Trung - Nam, giữ trọn vẹn hương vị tinh túy của từng vùng.' }}</p>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="p-4 rounded-4 bg-white shadow-md border-0 h-100 feature-hover-card transition-all d-flex align-items-start gap-3">
              <div class="feature-icon-wrapper bg-danger bg-opacity-10 text-danger rounded-4 p-3 flex-shrink-0">
                <i class="fa-solid fa-crown fs-3"></i>
              </div>
              <div>
                <h5 class="fw-bold text-dark mb-1 fs-6">{{ langStore.t('home.feature3Title') || 'Không Gian Sang Trọng & Ấm Cúng' }}</h5>
                <p class="text-muted small mb-0 leading-relaxed">{{ langStore.t('home.feature3Desc') || 'Phù hợp cho tiệc sum họp gia đình, tiếp khách, sinh nhật với dịch vụ tận tâm.' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. FEATURED MENU PREVIEW -->
    <section class="py-5 bg-light-subtle">
      <div class="container py-4">
        <div class="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-1.5 rounded-pill fw-bold mb-2 fs-8">
              <i class="fa-solid fa-sparkles me-1"></i>ĐẶC SẢN NỔI BẬT
            </span>
            <h2 class="fw-bold brand-font text-dark mb-0 fs-3">
              {{ langStore.t('home.featuredTitle') || 'Thực Đơn Đắc Sắc 3 Miền' }}
            </h2>
          </div>
          <router-link to="/thuc-don" class="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold text-decoration-none fs-7">
            {{ langStore.t('home.viewAll') || 'Xem Toàn Bộ Thực Đơn' }} <i class="fa-solid fa-arrow-right ms-1"></i>
          </router-link>
        </div>

        <div v-if="menuStore.loading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status"></div>
          <p class="text-muted small mt-2">Đang tải các món đặc sản...</p>
        </div>

        <div v-else class="row g-4">
          <div v-for="dish in featuredDishes" :key="dish._id" class="col-md-6 col-lg-3">
            <div class="card border-0 rounded-4 shadow-sm overflow-hidden h-100 hover-lift bg-white">
              <div class="position-relative bg-light overflow-hidden" style="height: 190px;">
                <img
                  :src="getImageUrl(dish.image)"
                  :alt="dish.name"
                  class="w-100 h-100 object-fit-cover dish-zoom-img transition-all"
                />
                <span class="badge bg-danger position-absolute top-0 start-0 m-3 px-2.5 py-1.5 rounded-pill fs-8 shadow-sm">
                  {{ dish.region || 'Đặc sản' }}
                </span>
              </div>
              <div class="card-body p-3.5 d-flex flex-column justify-content-between">
                <div>
                  <h6 class="fw-bold text-dark mb-1 text-truncate" :title="dish.name">{{ dish.name }}</h6>
                  <p class="text-muted small line-clamp-2 mb-3 fs-8" style="min-height: 38px;">{{ dish.description }}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center border-top pt-2.5 mt-auto">
                  <span class="fw-bold text-danger fs-6">{{ dish.price.toLocaleString('vi-VN') }}đ</span>
                  <router-link to="/dat-ban" class="btn btn-danger btn-sm rounded-pill px-3 fw-semibold fs-8">
                    <i class="fa-solid fa-calendar-check me-1"></i> {{ langStore.t('home.bookBtn') || 'Đặt bàn' }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. QUICK RESERVATION BANNER (CTA Banner) -->
    <section class="py-5 text-white position-relative overflow-hidden" style="background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);">
      <div class="container py-4 text-center position-relative z-2">
        <span class="badge bg-warning text-dark px-3.5 py-2 rounded-pill fw-bold mb-3 fs-8 shadow-sm">
          <i class="fa-solid fa-utensils me-1"></i> ĐẶT BÀN TRƯỚC - PHỤC VỤ CHU ĐÁO
        </span>
        <h2 class="display-5 fw-extrabold brand-font text-white mb-3">
          Trải Nghiệm Ẩm Thực Cua 3 Miền Chuẩn Vị Ngay Hôm Nay
        </h2>
        <p class="lead text-white text-opacity-90 max-w-700 mx-auto mb-4 fs-6">
          Đặt bàn trước để được giữ chỗ ngồi ưng ý, nhận ưu đãi tiền cọc và không phải chờ đợi vào giờ cao điểm.
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/dat-ban" class="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold text-dark shadow-lg">
            <i class="fa-solid fa-calendar-check me-1.5"></i> Đặt Bàn Ngay
          </router-link>
          <router-link to="/thuc-don" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-bold">
            Khám Phá Món Ăn
          </router-link>
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
import { getImageUrl } from "../../utils/imageHelper";

const menuStore = useMenuStore();
const langStore = useLangStore();

onMounted(() => {
  menuStore.fetchDishes();
});

const featuredDishes = computed(() => {
  return menuStore.dishes.slice(0, 4);
});
</script>

<style scoped>
.hero-full-section {
  width: 100%;
  overflow: hidden;
}

.floating-feature-section {
  margin-top: -35px;
  margin-bottom: 25px;
}

@media (max-width: 768px) {
  .floating-feature-section {
    margin-top: 15px;
    margin-bottom: 15px;
  }
}

.feature-hover-card {
  transition: all 0.3s ease;
}

.feature-hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
}

.feature-icon-wrapper {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
}

.dish-zoom-img {
  transition: transform 0.5s ease;
}

.hover-lift:hover .dish-zoom-img {
  transform: scale(1.06);
}

.max-w-700 {
  max-width: 700px;
}

.shadow-md {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
