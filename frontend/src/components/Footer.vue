<template>
  <footer class="bg-dark text-white pt-5 pb-4 mt-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4 col-md-6">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="p-2 bg-danger bg-opacity-20 rounded-3 text-danger d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
              <i class="fa-solid fa-utensils fs-4"></i>
            </div>
            <span class="fw-bold fs-3 brand-font text-danger">3 MIỀN CUA</span>
          </div>
          <p class="text-secondary small leading-relaxed">
            Nhà hàng 3 Miền Cua tự hào mang tới tinh hoa ẩm thực đặc sản 3 miền Bắc – Trung – Nam. Chuyên các món Cua Cà Mau tươi sống, lẩu cua đồng, tôm hùm và hải sản chọn lọc.
          </p>
          <div class="d-flex gap-3 mt-3">
            <a href="#" class="btn btn-outline-light btn-sm rounded-circle"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" class="btn btn-outline-light btn-sm rounded-circle"><i class="fa-brands fa-tiktok"></i></a>
            <a href="#" class="btn btn-outline-light btn-sm rounded-circle"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>

        <div class="col-lg-2 col-md-6">
          <h5 class="fw-bold mb-3 brand-font text-warning">Liên Kết Nhanh</h5>
          <ul class="list-unstyled text-secondary small space-y-2">
            <li class="mb-2"><router-link to="/" class="text-secondary text-decoration-none hover-text-white">Trang Chủ</router-link></li>
            <li class="mb-2"><router-link to="/thuc-don" class="text-secondary text-decoration-none hover-text-white">Thực Đơn 3 Miền</router-link></li>
            <li class="mb-2"><router-link to="/dat-ban" class="text-secondary text-decoration-none hover-text-white">Đặt Bàn Trực Tuyến</router-link></li>
            <li class="mb-2"><router-link to="/tra-cuu" class="text-secondary text-decoration-none hover-text-white">Tra Cứu Mã Đơn</router-link></li>
            <li class="mb-2"><router-link to="/hang-thanh-vien" class="text-secondary text-decoration-none hover-text-white">Thẻ Thành Viên</router-link></li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6">
          <h5 class="fw-bold mb-3 brand-font text-warning">Thời Gian Mở Cửa</h5>
          <ul class="list-unstyled text-secondary small">
            <li class="mb-2"><i class="fa-regular fa-clock me-2 text-danger"></i> Thứ 2 - Thứ 6: 10:00 - 22:00</li>
            <li class="mb-2"><i class="fa-regular fa-clock me-2 text-danger"></i> Thứ 7 - Chủ Nhật: 09:30 - 23:00</li>
            <li class="mt-3 text-warning fw-semibold"><i class="fa-solid fa-mug-hot me-1"></i> Phục vụ xuyên lễ tết</li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6">
          <h5 class="fw-bold mb-3 brand-font text-warning">Liên Hệ & Hotline</h5>
          <ul class="list-unstyled text-secondary small">
            <li class="mb-2"><i class="fa-solid fa-location-dot me-2 text-danger"></i> 123 Đường 3 Tháng 2, Phường 11, Quận 10, TP.HCM</li>
            <li class="mb-2"><i class="fa-solid fa-phone me-2 text-danger"></i> Hotline Đặt Bàn: <strong class="text-white">1900 1234</strong></li>
            <li class="mb-2"><i class="fa-solid fa-envelope me-2 text-danger"></i> contact@3miencua.vn</li>
          </ul>
        </div>
      </div>

      <hr class="border-secondary my-4" />

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
        <p class="mb-0">&copy; 2026 Nhà hàng 3 Miền Cua. All rights reserved.</p>
        <p class="mb-0">Hệ thống Quản lý & Đặt Bàn Thông Minh v2.0</p>
      </div>
    </div>
  </footer>
</template>
