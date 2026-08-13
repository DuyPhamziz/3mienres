<template>
  <div class="hero-swiper-container position-relative overflow-hidden rounded-5 glass-card p-3 shadow-lg border-warning border-opacity-25" style="max-width: 480px; margin: 0 auto;">
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
        <div class="p-4 bg-gradient rounded-4 text-center text-white" style="background: linear-gradient(135deg, #e65100 0%, #d32f2f 100%); min-height: 280px;">
          <div class="p-3 bg-white bg-opacity-10 rounded-circle d-inline-block mb-3">
            <i class="fa-solid fa-water-lower display-3 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font mb-2">Cua Cà Mau Tươi Sống</h3>
          <span class="badge bg-warning text-dark rounded-pill px-3 py-1 fw-bold mb-2">Đánh bắt tại bể - Chế biến tại bàn</span>
          <p class="small text-white-50 mb-0">Thịt cua chắc nịch, gạch thơm béo ngậy với sốt me chua ngọt đậm vị Nam Bộ.</p>
        </div>
      </swiper-slide>

      <!-- Slide 2: Lẩu Cua Đồng -->
      <swiper-slide>
        <div class="p-4 bg-gradient rounded-4 text-center text-white" style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%); min-height: 280px;">
          <div class="p-3 bg-white bg-opacity-10 rounded-circle d-inline-block mb-3">
            <i class="fa-solid fa-bowl-food display-3 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font mb-2">Lẩu Cua Đồng Bắc Bộ</h3>
          <span class="badge bg-light text-primary rounded-pill px-3 py-1 fw-bold mb-2">Hương vị thanh ngọt đặc trưng</span>
          <p class="small text-white-50 mb-0">Riêu cua béo ngậy, ăn kèm rau mồng tơi tươi xanh và bánh đa chuẩn vị miền Bắc.</p>
        </div>
      </swiper-slide>

      <!-- Slide 3: Cua Sốt Tiêu Xanh -->
      <swiper-slide>
        <div class="p-4 bg-gradient rounded-4 text-center text-white" style="background: linear-gradient(135deg, #fb8c00 0%, #ef6c00 100%); min-height: 280px;">
          <div class="p-3 bg-white bg-opacity-10 rounded-circle d-inline-block mb-3">
            <i class="fa-solid fa-pepper-hot display-3 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font mb-2">Cua Sốt Tiêu Xanh</h3>
          <span class="badge bg-dark rounded-pill px-3 py-1 fw-bold mb-2">Đặc sản Miền Trung cay nồng</span>
          <p class="small text-white-50 mb-0">Sốt tiêu xanh thấm vị từng thớ thịt cua, đậm đà vị biển nắng gió miền Trung.</p>
        </div>
      </swiper-slide>

      <!-- Slide 4: Ưu Đãi Thành Viên -->
      <swiper-slide>
        <div class="p-4 bg-gradient rounded-4 text-center text-white" style="background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); min-height: 280px;">
          <div class="p-3 bg-white bg-opacity-10 rounded-circle d-inline-block mb-3">
            <i class="fa-solid fa-crown display-3 text-warning"></i>
          </div>
          <h3 class="fw-bold brand-font mb-2">Thẻ Thành Viên Tích Điểm</h3>
          <span class="badge bg-warning text-dark rounded-pill px-3 py-1 fw-bold mb-2">Giảm giá đến 15% Mọi Hóa Đơn</span>
          <p class="small text-white-50 mb-0">Tự động tích lũy chi tiêu và thăng hạng Bạc, Vàng, Kim Cương khi dùng bữa.</p>
        </div>
      </swiper-slide>
    </swiper>

    <div class="d-flex justify-content-around text-start pt-3 border-top border-secondary border-opacity-25 mt-2">
      <div>
        <small class="text-muted d-block"><i class="fa-solid fa-circle-check text-success me-1"></i>Đặc sản chọn lọc</small>
        <strong class="text-warning">Chất lượng cao cấp</strong>
      </div>
      <div>
        <small class="text-muted d-block"><i class="fa-solid fa-heart text-danger me-1"></i>Phục vụ tận tâm</small>
        <strong class="text-danger">Không gian ấm cúng</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const modules = [Autoplay, Pagination];
</script>

<style scoped>
.hero-swiper-container :deep(.swiper-pagination-bullet) {
  background: #ffffff;
  opacity: 0.5;
}
.hero-swiper-container :deep(.swiper-pagination-bullet-active) {
  background: #ffb300;
  opacity: 1;
  width: 20px;
  border-radius: 10px;
}
</style>
