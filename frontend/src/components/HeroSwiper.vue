<template>
  <div class="hero-swiper-container position-relative overflow-hidden rounded-5 glass-card p-3 shadow-lg border-danger border-opacity-25 bg-white" style="max-width: 480px; margin: 0 auto;">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="20"
      :loop="true"
      :autoplay="{ delay: 3500, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      class="mySwiper rounded-4"
    >
      <!-- Slide 1: Cua Cà Mau -->
      <swiper-slide>
        <div class="p-4 rounded-4 text-center text-white shadow-sm" style="background: linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #7f1d1d 100%); min-height: 290px;">
          <div class="p-3 bg-white bg-opacity-20 rounded-circle d-inline-block mb-3" style="width: 70px; height: 70px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-water-lower fs-1 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font text-white mb-2 fs-4">
            {{ langStore.isEnglish ? 'Live Ca Mau Crabs' : 'Cua Cà Mau Tươi Sống' }}
          </h3>
          <span class="badge bg-warning text-dark rounded-pill px-3 py-1.5 fw-bold mb-3 fs-8 shadow-sm">
            {{ langStore.isEnglish ? 'Fresh from tank · Cooked to order' : 'Đánh bắt tại bể · Chế biến tại bàn' }}
          </span>
          <p class="small text-white opacity-90 mb-0 leading-relaxed">
            {{ langStore.isEnglish ? 'Firm meaty crabs with rich golden roe, served with signature Southern sweet & sour tamarind sauce.' : 'Thịt cua chắc nịch, gạch thơm béo ngậy với sốt me chua ngọt đậm vị Nam Bộ.' }}
          </p>
        </div>
      </swiper-slide>

      <!-- Slide 2: Lẩu Cua Đồng -->
      <swiper-slide>
        <div class="p-4 rounded-4 text-center text-white shadow-sm" style="background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%); min-height: 290px;">
          <div class="p-3 bg-white bg-opacity-20 rounded-circle d-inline-block mb-3" style="width: 70px; height: 70px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-bowl-food fs-1 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font text-white mb-2 fs-4">
            {{ langStore.isEnglish ? 'Northern Field Crab Hotpot' : 'Lẩu Cua Đồng Bắc Bộ' }}
          </h3>
          <span class="badge bg-amber-400 text-dark bg-warning rounded-pill px-3 py-1.5 fw-bold mb-3 fs-8 shadow-sm">
            {{ langStore.isEnglish ? 'Authentic rich flavor' : 'Hương vị thanh ngọt đặc trưng' }}
          </span>
          <p class="small text-white opacity-90 mb-0 leading-relaxed">
            {{ langStore.isEnglish ? 'Rich crab paste broth served with fresh Malabar spinach, luffa, and Northern red noodle cakes.' : 'Riêu cua béo ngậy, ăn kèm rau mồng tơi tươi xanh và bánh đa chuẩn vị miền Bắc.' }}
          </p>
        </div>
      </swiper-slide>

      <!-- Slide 3: Cua Sốt Tiêu Xanh -->
      <swiper-slide>
        <div class="p-4 rounded-4 text-center text-white shadow-sm" style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #9a3412 100%); min-height: 290px;">
          <div class="p-3 bg-white bg-opacity-20 rounded-circle d-inline-block mb-3" style="width: 70px; height: 70px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-pepper-hot fs-1 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font text-white mb-2 fs-4">
            {{ langStore.isEnglish ? 'Green Peppercorn Crab' : 'Cua Sốt Tiêu Xanh' }}
          </h3>
          <span class="badge bg-dark text-white rounded-pill px-3 py-1.5 fw-bold mb-3 fs-8 shadow-sm">
            {{ langStore.isEnglish ? 'Spicy Central Specialty' : 'Đặc sản Miền Trung cay nồng' }}
          </span>
          <p class="small text-white opacity-90 mb-0 leading-relaxed">
            {{ langStore.isEnglish ? 'Fresh green peppercorn sauce infusing every bite with rich coastal Central flavors.' : 'Sốt tiêu xanh thấm vị từng thớ thịt cua, đậm đà vị biển nắng gió miền Trung.' }}
          </p>
        </div>
      </swiper-slide>

      <!-- Slide 4: Ưu Đãi Thành Viên -->
      <swiper-slide>
        <div class="p-4 rounded-4 text-center text-white shadow-sm" style="background: linear-gradient(135deg, #15803d 0%, #16a34a 50%, #166534 100%); min-height: 290px;">
          <div class="p-3 bg-white bg-opacity-20 rounded-circle d-inline-block mb-3" style="width: 70px; height: 70px; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-crown fs-1 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font text-white mb-2 fs-4">
            {{ langStore.isEnglish ? 'Loyalty Rewards Program' : 'Thẻ Thành Viên Tích Điểm' }}
          </h3>
          <span class="badge bg-warning text-dark rounded-pill px-3 py-1.5 fw-bold mb-3 fs-8 shadow-sm">
            {{ langStore.isEnglish ? 'Up to 15% off every bill' : 'Giảm giá đến 15% Mọi Hóa Đơn' }}
          </span>
          <p class="small text-white opacity-90 mb-0 leading-relaxed">
            {{ langStore.isEnglish ? 'Automatically earn points and upgrade rank to Silver, Gold, and Diamond tiers.' : 'Tự động tích lũy chi tiêu và thăng hạng Bạc, Vàng, Kim Cương khi dùng bữa.' }}
          </p>
        </div>
      </swiper-slide>
    </swiper>

    <!-- Bottom Feature Highlights (High Contrast Dark Text on White Card) -->
    <div class="d-flex justify-content-around text-start pt-3 border-top mt-3">
      <div>
        <small class="text-secondary d-block fw-semibold fs-8 mb-1">
          <i class="fa-solid fa-circle-check text-success me-1"></i>
          {{ langStore.isEnglish ? 'Selected Seafood' : 'Đặc sản chọn lọc' }}
        </small>
        <strong class="text-dark fs-7 brand-font">
          {{ langStore.isEnglish ? 'Premium Quality' : 'Chất lượng cao cấp' }}
        </strong>
      </div>
      <div>
        <small class="text-secondary d-block fw-semibold fs-8 mb-1">
          <i class="fa-solid fa-heart text-danger me-1"></i>
          {{ langStore.isEnglish ? 'Dedicated Service' : 'Phục vụ tận tâm' }}
        </small>
        <strong class="text-danger fs-7 brand-font">
          {{ langStore.isEnglish ? 'Cozy Atmosphere' : 'Không gian ấm cúng' }}
        </strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import { useLangStore } from "../stores/langStore";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const modules = [Autoplay, Pagination];
const langStore = useLangStore();
</script>

<style scoped>
.hero-swiper-container :deep(.swiper-pagination-bullet) {
  background: #ffffff;
  opacity: 0.6;
}
.hero-swiper-container :deep(.swiper-pagination-bullet-active) {
  background: #ffb300;
  opacity: 1;
  width: 22px;
  border-radius: 10px;
}
</style>
