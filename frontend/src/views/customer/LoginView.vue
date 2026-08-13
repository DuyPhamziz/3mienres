<template>
  <div class="py-5 min-vh-100 d-flex align-items-center bg-light">
    <div class="container py-4">
      <div class="glass-card max-w-4xl mx-auto overflow-hidden rounded-5 shadow-lg border-0">
        <div class="row g-0">
          <!-- Left Column: High Contrast Dark Crimson Branding Banner -->
          <div class="col-lg-5 text-white p-5 d-flex flex-column justify-content-between position-relative" style="background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 50%, #450a0a 100%);">
            <div class="position-relative">
              <div class="d-flex align-items-center gap-2 mb-4">
                <div class="p-2 bg-white bg-opacity-15 rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                  <i class="fa-solid fa-utensils fs-4 text-warning"></i>
                </div>
                <span class="fw-bold fs-4 text-white">3 MIỀN CUA</span>
              </div>
              <h2 class="fw-bold text-white mb-3">Chào Mừng Bạn Quay Trở Lại!</h2>
              <p class="text-white opacity-85 small leading-relaxed mb-4">
                Đăng nhập để theo dõi hạng thành viên, tích lũy điểm chi tiêu và nhận ưu đãi giảm đến 15% cho mọi bữa ăn đặc sản.
              </p>
            </div>

            <!-- Perks Highlights list -->
            <div class="position-relative space-y-3 my-3">
              <div class="d-flex align-items-center gap-3 p-3 bg-black bg-opacity-20 rounded-4 border border-white border-opacity-10 mb-2">
                <i class="fa-solid fa-gem fs-4 text-warning"></i>
                <div>
                  <strong class="d-block text-white small">Thẻ Thành Viên Tích Điểm</strong>
                  <small class="text-white opacity-75 fs-8">Thăng hạng Bạc, Vàng, Kim Cương</small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-3 p-3 bg-black bg-opacity-20 rounded-4 border border-white border-opacity-10">
                <i class="fa-solid fa-calendar-check fs-4 text-warning"></i>
                <div>
                  <strong class="d-block text-white small">Đặt Bàn Giữ Chỗ Nhanh</strong>
                  <small class="text-white opacity-75 fs-8">Hệ thống tự động xếp bàn kề nhau</small>
                </div>
              </div>
            </div>

            <div class="position-relative pt-3 border-top border-white border-opacity-20 small text-white opacity-80">
              Hotline hỗ trợ: <strong class="text-warning">1900 1234</strong>
            </div>
          </div>

          <!-- Right Column: Login Form -->
          <div class="col-lg-7 p-4 p-md-5 bg-white d-flex flex-column justify-content-center">
            <div class="mb-4 text-center text-lg-start">
              <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
                <i class="fa-solid fa-user-shield me-1"></i> TÀI KHOẢN THÀNH VIÊN
              </span>
              <h2 class="fw-bold text-dark mb-1">Đăng Nhập Thành Viên</h2>
              <p class="text-muted small">Vui lòng nhập email và mật khẩu của bạn để tiếp tục</p>
            </div>

            <form @submit.prevent="handleLogin">
              <!-- Email Input with Icon -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7 mb-1">Địa chỉ Email</label>
                <div class="form-control-icon">
                  <input
                    v-model="email"
                    type="email"
                    class="form-control py-2.5"
                    placeholder="Ví dụ: khachhang@gmail.com"
                    required
                  />
                  <i class="fa-solid fa-envelope"></i>
                </div>
              </div>

              <!-- Password Input with Icon & Toggle -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7 mb-1">Mật khẩu</label>
                <div class="form-control-icon position-relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control py-2.5 pe-5"
                    placeholder="Nhập mật khẩu từ 6 ký tự"
                    required
                  />
                  <i class="fa-solid fa-lock"></i>
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="btn btn-link text-muted position-absolute end-0 top-50 translate-middle-y pe-3 text-decoration-none"
                    style="z-index: 10;"
                  >
                    <i :class="['fa-solid', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                  </button>
                </div>
              </div>

              <!-- Remember Me -->
              <div class="d-flex justify-content-between align-items-center mb-4 fs-7">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="rememberMe" checked />
                  <label class="form-check-label text-muted" for="rememberMe">Ghi nhớ đăng nhập</label>
                </div>
              </div>

              <!-- Error Alert -->
              <div v-if="errorMsg" class="alert alert-danger mb-3 p-3 rounded-3 fs-7 d-flex align-items-center gap-2">
                <i class="fa-solid fa-circle-exclamation fs-5"></i>
                <div>{{ errorMsg }}</div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="authStore.loading"
                class="btn btn-primary-crab w-100 py-3 rounded-3 shadow-sm mb-4 fw-bold fs-6"
              >
                <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                <span v-else><i class="fa-solid fa-right-to-bracket me-2"></i> ĐĂNG NHẬP NGAY</span>
              </button>

              <div class="text-center text-muted fs-7">
                Chưa có tài khoản thành viên?
                <router-link to="/register" class="text-danger fw-bold text-decoration-none ms-1">
                  Đăng ký ngay <i class="fa-solid fa-arrow-right fs-8"></i>
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useRouter, useRoute } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMsg = ref("");

const handleLogin = async () => {
  errorMsg.value = "";
  try {
    await authStore.login(email.value, password.value);
    const redirectPath = route.query.redirect || (authStore.isStaff ? "/admin" : "/");
    router.push(redirectPath);
  } catch (err) {
    errorMsg.value = err.message;
  }
};
</script>
