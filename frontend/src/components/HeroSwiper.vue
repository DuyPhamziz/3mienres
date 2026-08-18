<template>
  <div class="full-hero-swiper-wrapper position-relative overflow-hidden">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="0"
      :loop="true"
      :effect="'fade'"
      :fade-effect="{ crossFade: true }"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :navigation="{
        prevEl: '.hero-btn-prev',
        nextEl: '.hero-btn-next',
      }"
      class="heroSwiper"
    >
      <!-- Slide 1: Cua Cà Mau Tươi Sống -->
      <swiper-slide>
        <div
          class="hero-slide-item position-relative d-flex align-items-center"
          style="background-image: url('/uploads/banners/banner-cua-ca-mau.jpg');"
        >
          <div class="hero-overlay"></div>
          <div class="container position-relative z-2 py-5">
            <div class="row">
              <div class="col-lg-8 col-xl-7">
                <span class="badge bg-danger text-white px-3 py-2 rounded-pill fw-bold mb-3 fs-8 shadow-sm d-inline-flex align-items-center gap-1.5 animate-slide-down">
                  <i class="fa-solid fa-crown text-warning"></i>
                  {{ langStore.isEnglish ? 'SOUTHERN SIGNATURE CUISINE' : 'TINH HOA ẨM THỰC NAM BỘ' }}
                </span>
                <h1 class="display-4 fw-extrabold brand-font text-white mb-3 text-shadow leading-tight animate-fade-in">
                  {{ langStore.isEnglish ? 'Live Ca Mau Crabs' : 'Cua Cà Mau Tươi Sống' }}
                  <span class="text-warning d-block fs-2 mt-1">
                    {{ langStore.isEnglish ? 'Cooked Fresh to Order' : 'Đánh Bắt Tại Bể · Đậm Vị Gia Truyền' }}
                  </span>
                </h1>
                <p class="lead text-white text-opacity-90 mb-4 fs-6 leading-relaxed text-shadow max-w-600 animate-fade-in-delayed">
                  {{ langStore.isEnglish ? 'Firm meaty crabs with rich golden roe, served with signature Southern sweet & sour tamarind sauce and crispy hot bread.' : 'Thịt cua chắc nịch, gạch thơm béo ngậy được chế biến cùng sốt me chua ngọt, sốt bơ tỏi gia truyền chuẩn phong vị 3 miền.' }}
                </p>
                <div class="d-flex flex-wrap gap-3 align-items-center animate-slide-up">
                  <router-link to="/dat-ban" class="btn btn-danger btn-lg px-4 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2 btn-glow">
                    <i class="fa-solid fa-calendar-check"></i>
                    {{ langStore.isEnglish ? 'Book a Table Now' : 'Đặt Bàn Trực Tuyến' }}
                  </router-link>
                  <router-link to="/thuc-don" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-bold backdrop-blur">
                    <i class="fa-solid fa-utensils me-1"></i>
                    {{ langStore.isEnglish ? 'Explore Menu' : 'Xem Thực Đơn' }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>

      <!-- Slide 2: Lẩu Cua Đồng Bắc Bộ -->
      <swiper-slide>
        <div
          class="hero-slide-item position-relative d-flex align-items-center"
          style="background-image: url('/uploads/banners/banner-lau-cua-dong.jpg');"
        >
          <div class="hero-overlay"></div>
          <div class="container position-relative z-2 py-5">
            <div class="row">
              <div class="col-lg-8 col-xl-7">
                <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3 fs-8 shadow-sm d-inline-flex align-items-center gap-1.5 animate-slide-down">
                  <i class="fa-solid fa-bowl-food text-danger"></i>
                  {{ langStore.isEnglish ? 'NORTHERN AUTHENTIC HOTPOT' : 'HƯƠNG VỊ ĐỒNG QUÊ BẮC BỘ' }}
                </span>
                <h1 class="display-4 fw-extrabold brand-font text-white mb-3 text-shadow leading-tight animate-fade-in">
                  {{ langStore.isEnglish ? 'Northern Field Crab Hotpot' : 'Lẩu Cua Đồng Bắc Bộ' }}
                  <span class="text-warning d-block fs-2 mt-1">
                    {{ langStore.isEnglish ? 'Rich Aromatic Broth' : 'Nước Dùng Thanh Ngọt · Riêu Cua Đậm Đà' }}
                  </span>
                </h1>
                <p class="lead text-white text-opacity-90 mb-4 fs-6 leading-relaxed text-shadow max-w-600 animate-fade-in-delayed">
                  {{ langStore.isEnglish ? 'Rich crab paste broth served with fresh Malabar spinach, luffa, and Northern red noodle cakes for the whole family.' : 'Riêu cua béo ngậy, ăn kèm rau mồng tơi tươi xanh, hoa chuối và bánh đa đỏ Hải Phòng nồng nàn ấm cúng cho bữa tiệc gia đình.' }}
                </p>
                <div class="d-flex flex-wrap gap-3 align-items-center animate-slide-up">
                  <router-link to="/dat-ban" class="btn btn-danger btn-lg px-4 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2 btn-glow">
                    <i class="fa-solid fa-users"></i>
                    {{ langStore.isEnglish ? 'Book Family Table' : 'Đặt Bàn Tiệc Gia Đình' }}
                  </router-link>
                  <router-link to="/thuc-don" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-bold backdrop-blur">
                    <i class="fa-solid fa-fire me-1"></i>
                    {{ langStore.isEnglish ? 'Hotpot Dishes' : 'Khám Phá Món Lẩu' }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>

      <!-- Slide 3: Cua Sốt Tiêu Xanh Phú Quốc -->
      <swiper-slide>
        <div
          class="hero-slide-item position-relative d-flex align-items-center"
          style="background-image: url('/uploads/banners/banner-cua-tieu-xanh.jpg');"
        >
          <div class="hero-overlay"></div>
          <div class="container position-relative z-2 py-5">
            <div class="row">
              <div class="col-lg-8 col-xl-7">
                <span class="badge bg-danger text-white px-3 py-2 rounded-pill fw-bold mb-3 fs-8 shadow-sm d-inline-flex align-items-center gap-1.5 animate-slide-down">
                  <i class="fa-solid fa-pepper-hot text-warning"></i>
                  {{ langStore.isEnglish ? 'CENTRAL SPICY SPECIALTY' : 'CAY NỒNG MIỀN TRUNG & HẢI ĐẢO' }}
                </span>
                <h1 class="display-4 fw-extrabold brand-font text-white mb-3 text-shadow leading-tight animate-fade-in">
                  {{ langStore.isEnglish ? 'Green Peppercorn Crab' : 'Cua Sốt Tiêu Xanh' }}
                  <span class="text-warning d-block fs-2 mt-1">
                    {{ langStore.isEnglish ? 'Spicy Oceanic Sensation' : 'Tiêu Tươi Cay The · Thấm Vị Từng Thớ Thịt' }}
                  </span>
                </h1>
                <p class="lead text-white text-opacity-90 mb-4 fs-6 leading-relaxed text-shadow max-w-600 animate-fade-in-delayed">
                  {{ langStore.isEnglish ? 'Fresh green peppercorn sauce infusing every bite with rich coastal Central flavors and delightful spicy warmth.' : 'Hương thơm tiêu xanh cay the nồng ấm hòa quyện sốt sánh mịn ngấm sâu vào thịt cua biển tươi chắc, mang lại trải nghiệm vị giác bùng nổ.' }}
                </p>
                <div class="d-flex flex-wrap gap-3 align-items-center animate-slide-up">
                  <router-link to="/dat-ban" class="btn btn-danger btn-lg px-4 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2 btn-glow">
                    <i class="fa-solid fa-calendar-check"></i>
                    {{ langStore.isEnglish ? 'Book Table Now' : 'Đặt Bàn Thưởng Thức' }}
                  </router-link>
                  <router-link to="/thuc-don" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-bold backdrop-blur">
                    <i class="fa-solid fa-utensils me-1"></i>
                    {{ langStore.isEnglish ? 'Menu Details' : 'Xem Chi Tiết Món' }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>

      <!-- Slide 4: Thẻ Thành Viên VIP & Ưu Đãi -->
      <swiper-slide>
        <div
          class="hero-slide-item position-relative d-flex align-items-center"
          style="background-image: url('/uploads/banners/banner-loyalty-rewards.jpg');"
        >
          <div class="hero-overlay"></div>
          <div class="container position-relative z-2 py-5">
            <div class="row">
              <div class="col-lg-8 col-xl-7">
                <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3 fs-8 shadow-sm d-inline-flex align-items-center gap-1.5 animate-slide-down">
                  <i class="fa-solid fa-gem text-danger"></i>
                  {{ langStore.isEnglish ? 'VIP LOYALTY REWARDS' : 'ĐẶC QUYỀN HỘI VIÊN 3 MIỀN' }}
                </span>
                <h1 class="display-4 fw-extrabold brand-font text-white mb-3 text-shadow leading-tight animate-fade-in">
                  {{ langStore.isEnglish ? 'Loyalty Rewards Program' : 'Thẻ Thành Viên Tích Điểm' }}
                  <span class="text-warning d-block fs-2 mt-1">
                    {{ langStore.isEnglish ? 'Up to 15% Off Every Bill' : 'Giảm Đến 15% Mọi Hóa Đơn & Quà Tặng VIP' }}
                  </span>
                </h1>
                <p class="lead text-white text-opacity-90 mb-4 fs-6 leading-relaxed text-shadow max-w-600 animate-fade-in-delayed">
                  {{ langStore.isEnglish ? 'Automatically earn points on every dining session. Unlock Silver, Gold, and Diamond tiers with exclusive culinary benefits.' : 'Tự động tích lũy chi tiêu và thăng hạng Bạc, Vàng, Kim Cương với nhiều ưu đãi sinh nhật, voucher giảm giá và dịch vụ ưu tiên.' }}
                </p>
                <div class="d-flex flex-wrap gap-3 align-items-center animate-slide-up">
                  <router-link to="/hang-thanh-vien" class="btn btn-warning btn-lg px-4 py-3 rounded-pill fw-bold text-dark shadow-lg d-flex align-items-center gap-2">
                    <i class="fa-solid fa-crown"></i>
                    {{ langStore.isEnglish ? 'Explore VIP Tiers' : 'Khám Phá Hạng Thành Viên' }}
                  </router-link>
                  <router-link to="/dat-ban" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-bold backdrop-blur">
                    <i class="fa-solid fa-calendar-plus me-1"></i>
                    {{ langStore.isEnglish ? 'Book & Earn Points' : 'Đặt Bàn Tích Điểm' }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <!-- Custom Navigation Arrows (Glassmorphism) -->
    <button
      class="hero-btn-prev hero-nav-btn position-absolute start-0 top-50 translate-middle-y z-3 ms-3 ms-md-4 rounded-circle border-0 d-flex align-items-center justify-content-center"
      aria-label="Previous Slide"
    >
      <i class="fa-solid fa-chevron-left text-white fs-5"></i>
    </button>
    <button
      class="hero-btn-next hero-nav-btn position-absolute end-0 top-50 translate-middle-y z-3 me-3 me-md-4 rounded-circle border-0 d-flex align-items-center justify-content-center"
      aria-label="Next Slide"
    >
      <i class="fa-solid fa-chevron-right text-white fs-5"></i>
    </button>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { useLangStore } from "../stores/langStore";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";

const modules = [Autoplay, Pagination, Navigation, EffectFade];
const langStore = useLangStore();
</script>

<style scoped>
.full-hero-swiper-wrapper {
  width: 100%;
  min-height: 540px;
  background-color: #1a1a1a;
}

.heroSwiper {
  width: 100%;
  height: 100%;
}

.hero-slide-item {
  width: 100%;
  min-height: 580px;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  transition: transform 0.6s ease;
}

@media (min-width: 992px) {
  .hero-slide-item {
    min-height: 640px;
  }
}

@media (max-width: 768px) {
  .hero-slide-item {
    min-height: 480px;
  }
}

/* Lớp phủ điện ảnh (Cinematic Gradient) giúp chữ cực kỳ sắc nét */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(15, 10, 10, 0.88) 0%,
    rgba(20, 10, 10, 0.70) 50%,
    rgba(15, 10, 10, 0.35) 100%
  );
  z-index: 1;
}

@media (max-width: 768px) {
  .hero-overlay {
    background: linear-gradient(
      180deg,
      rgba(15, 10, 10, 0.85) 0%,
      rgba(15, 10, 10, 0.75) 100%
    );
  }
}

.text-shadow {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.65);
}

.fw-extrabold {
  font-weight: 800;
}

.max-w-600 {
  max-width: 600px;
}

.backdrop-blur {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.backdrop-blur:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.6);
}

.btn-glow {
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.45);
  transition: all 0.3s ease;
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(220, 38, 38, 0.6);
}

/* Glassmorphism Navigation Arrows */
.hero-nav-btn {
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.hero-nav-btn:hover {
  background: rgba(220, 38, 38, 0.8);
  border-color: rgba(220, 38, 38, 1) !important;
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

@media (max-width: 576px) {
  .hero-nav-btn {
    display: none !important;
  }
}

/* Swiper Pagination Styling */
.full-hero-swiper-wrapper :deep(.swiper-pagination) {
  bottom: 25px !important;
}

.full-hero-swiper-wrapper :deep(.swiper-pagination-bullet) {
  background: #ffffff;
  opacity: 0.5;
  width: 10px;
  height: 10px;
  transition: all 0.3s ease;
}

.full-hero-swiper-wrapper :deep(.swiper-pagination-bullet-active) {
  background: #f59e0b;
  opacity: 1;
  width: 32px;
  border-radius: 12px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease forwards;
}

.animate-fade-in-delayed {
  animation: fadeIn 0.8s ease 0.2s forwards;
}

.animate-slide-up {
  animation: fadeIn 0.8s ease 0.35s forwards;
}
</style>
