<template>
  <div>
    <!-- Hero Banner Section with Swiper Slider & Rich Aesthetics -->
    <section class="position-relative py-5 bg-dark text-white overflow-hidden">
      <div class="position-absolute top-0 start-0 w-100 h-100 opacity-25" style="background: radial-gradient(circle at center, #ff6f00 0%, #d32f2f 40%, transparent 70%);"></div>
      <div class="container position-relative py-5">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3 fs-7 shadow-sm">
              <i class="fa-solid fa-utensils me-2"></i>ẨM THỰC ĐẶC SẢN 3 MIỀN
            </span>
            <h1 class="display-3 fw-bold brand-font mb-3 leading-tight">
              Tinh Hoa Ẩm Thực <span class="text-danger">3 Miền Cua</span> Độc Đáo
            </h1>
            <p class="fs-5 text-secondary mb-4 leading-relaxed">
              Trải nghiệm hương vị đậm đà đặc trưng đặc sản 3 miền Bắc – Trung – Nam. Cua Cà Mau tươi sống bắt tại bể, lẩu cua đồng thơm nức và hải sản chọn lọc cao cấp.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <router-link to="/dat-ban" class="btn btn-primary-crab btn-lg px-4 py-3 shadow">
                <i class="fa-solid fa-calendar-check me-2"></i> Đặt Bàn Trực Tuyến
              </router-link>
              <router-link to="/thuc-don" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill">
                <i class="fa-solid fa-book-open me-2"></i> Xem Thực Đơn 3 Miền
              </router-link>
            </div>
          </div>

          <!-- Right Column: Embedded Swiper Slider -->
          <div class="col-lg-6 text-center">
            <HeroSwiper />
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Regions Feature Cards with FontAwesome Icons -->
    <section class="py-5">
      <div class="container py-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
          <span class="text-danger fw-bold text-uppercase tracking-wider">Hương vị đặc trưng</span>
          <h2 class="display-6 fw-bold brand-font mt-1">Đặc Sản Ẩm Thực 3 Miền Bắc – Trung – Nam</h2>
        </div>

        <div class="row g-4">
          <!-- Miền Bắc -->
          <div class="col-md-4">
            <div class="glass-card h-100 p-4 hover-lift text-center">
              <div class="p-4 rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 90px; height: 90px;">
                <i class="fa-solid fa-bowl-food display-4"></i>
              </div>
              <div class="badge badge-region-bac px-3 py-2 rounded-pill fs-7 mb-3">MIỀN BẮC</div>
              <h4 class="fw-bold brand-font mb-2">Lẩu Cua Đồng Bắc Bộ</h4>
              <p class="text-muted small mb-4">Hương vị thanh ngọt dịu mát từ cua đồng tươi, ăn kèm riêu cua béo ngậy và rau nhúng mồng tơi tươi xanh.</p>
              <router-link to="/thuc-don?region=Bắc" class="btn btn-outline-primary btn-sm rounded-pill px-4">
                <i class="fa-solid fa-compass me-1"></i> Khám phá món Bắc
              </router-link>
            </div>
          </div>

          <!-- Miền Trung -->
          <div class="col-md-4">
            <div class="glass-card h-100 p-4 hover-lift text-center">
              <div class="p-4 rounded-circle bg-warning bg-opacity-10 text-warning mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 90px; height: 90px;">
                <i class="fa-solid fa-pepper-hot display-4"></i>
              </div>
              <div class="badge badge-region-trung px-3 py-2 rounded-pill fs-7 mb-3">MIỀN TRUNG</div>
              <h4 class="fw-bold brand-font mb-2">Cua Sốt Tiêu Xanh</h4>
              <p class="text-muted small mb-4">Vị cay nồng ấm đượm vị biển Miền Trung, sốt tiêu xanh thấm vị từng thớ thịt cua chắc ngọt.</p>
              <router-link to="/thuc-don?region=Trung" class="btn btn-outline-warning btn-sm rounded-pill px-4 text-dark">
                <i class="fa-solid fa-compass me-1"></i> Khám phá món Trung
              </router-link>
            </div>
          </div>

          <!-- Miền Nam -->
          <div class="col-md-4">
            <div class="glass-card h-100 p-4 hover-lift text-center">
              <div class="p-4 rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 90px; height: 90px;">
                <i class="fa-solid fa-fish display-4"></i>
              </div>
              <div class="badge badge-region-nam px-3 py-2 rounded-pill fs-7 mb-3">MIỀN NAM</div>
              <h4 class="fw-bold brand-font mb-2">Cua Rang Me Cà Mau</h4>
              <p class="text-muted small mb-4">Đặc sản đậm đà Nam Bộ với sốt me chua ngọt đậm vị, thịt cua Cà Mau chắc nịch nhiều gạch thơm lừng.</p>
              <router-link to="/thuc-don?region=Nam" class="btn btn-outline-success btn-sm rounded-pill px-4">
                <i class="fa-solid fa-compass me-1"></i> Khám phá món Nam
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Booking CTA Banner -->
    <section class="py-5 bg-danger text-white position-relative overflow-hidden">
      <div class="position-absolute top-0 start-0 w-100 h-100 opacity-20" style="background: radial-gradient(circle, #ffb300 0%, transparent 60%);"></div>
      <div class="container text-center py-4 position-relative">
        <i class="fa-solid fa-crown display-3 text-warning mb-3 d-block"></i>
        <h2 class="display-5 fw-bold brand-font mb-3">Đặt Bàn Trực Tuyến - Nhận Ưu Đãi Thăng Hạng</h2>
        <p class="fs-5 opacity-90 max-w-xl mx-auto mb-4">
          Đặt bàn trước để nhà hàng chuẩn bị sẵn không gian hoàn hảo và tự động tích lũy chi tiêu nhận chiết khấu đến 15%!
        </p>
        <router-link to="/dat-ban" class="btn btn-gold btn-lg px-5 py-3 shadow">
          <i class="fa-solid fa-calendar-check me-2"></i> ĐẶT BÀN ONLINE NGAY
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroSwiper from "../../components/HeroSwiper.vue";
</script>
