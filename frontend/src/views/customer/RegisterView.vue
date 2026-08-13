<template>
  <div class="py-5 min-vh-100 d-flex align-items-center bg-light">
    <div class="container py-4">
      <div class="glass-card max-w-4xl mx-auto overflow-hidden rounded-5 shadow-lg border-0">
        <div class="row g-0">
          <!-- Left Column: Branding Visual -->
          <div class="col-lg-5 bg-gradient text-white p-5 d-flex flex-column justify-content-between position-relative" style="background: linear-gradient(135deg, #e65100 0%, #d32f2f 50%, #b71c1c 100%);">
            <div class="position-absolute top-0 start-0 w-100 h-100 opacity-20" style="background: radial-gradient(circle, #ffb300 0%, transparent 70%); pointer-events: none;"></div>
            <div class="position-relative">
              <div class="d-flex align-items-center gap-2 mb-4">
                <div class="p-2 bg-white bg-opacity-20 rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                  <i class="fa-solid fa-utensils fs-4 text-warning"></i>
                </div>
                <span class="fw-bold fs-4 text-white">3 MIỀN CUA</span>
              </div>
              <h2 class="fw-bold text-white mb-3">Đăng Ký Thành Viên Nhận Ngay Ưu Đãi</h2>
              <p class="text-white-50 small leading-relaxed mb-4">
                Tạo tài khoản để tham gia chương trình khách hàng thân thiết, nhận chiết khấu trực tiếp và trải nghiệm dịch vụ đặt bàn ưu tiên.
              </p>
            </div>

            <!-- Perks list -->
            <div class="position-relative space-y-3 my-3">
              <div class="d-flex align-items-center gap-3 p-3 bg-white bg-opacity-10 rounded-4">
                <i class="fa-solid fa-crown fs-4 text-warning"></i>
                <div>
                  <strong class="d-block text-white small">Tự Động Nâng Hạng</strong>
                  <small class="text-white-50 fs-8">Hệ thống cộng dồn chi tiêu sau mỗi hóa đơn</small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-3 p-3 bg-white bg-opacity-10 rounded-4 mt-2">
                <i class="fa-solid fa-percent fs-4 text-warning"></i>
                <div>
                  <strong class="d-block text-white small">Ưu Đãi Chiết Khấu Đến 15%</strong>
                  <small class="text-white-50 fs-8">Áp dụng trực tiếp khi ăn tại quán</small>
                </div>
              </div>
            </div>

            <div class="position-relative pt-3 border-top border-white border-opacity-25 small text-white-50">
              Hotline hỗ trợ: <strong class="text-warning">1900 1234</strong>
            </div>
          </div>

          <!-- Right Column: Register Form -->
          <div class="col-lg-7 p-4 p-md-5 bg-white d-flex flex-column justify-content-center">
            <div class="mb-4 text-center text-lg-start">
              <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
                <i class="fa-solid fa-user-plus me-1"></i> TẠO TÀI KHOẢN MỚI
              </span>
              <h2 class="fw-bold text-dark mb-1">Đăng Ký Hội Viên 3 Miền Cua</h2>
              <p class="text-muted small">Điền thông tin bên dưới để đăng ký tài khoản nhanh chóng</p>
            </div>

            <form @submit.prevent="handleRegister">
              <!-- Name Input -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7 mb-1">Họ và tên <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control py-2.5"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                  />
                  <i class="fa-solid fa-user"></i>
                </div>
              </div>

              <!-- Phone Input -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7 mb-1">Số điện thoại liên hệ <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="form-control py-2.5"
                    placeholder="Ví dụ: 0988776655"
                    required
                  />
                  <i class="fa-solid fa-phone"></i>
                </div>
              </div>

              <!-- Email Input -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-dark fs-7 mb-1">Địa chỉ Email <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-control py-2.5"
                    placeholder="Ví dụ: khachhang@gmail.com"
                    required
                  />
                  <i class="fa-solid fa-envelope"></i>
                </div>
              </div>

              <!-- Password Input -->
              <div class="mb-4">
                <label class="form-label fw-semibold text-dark fs-7 mb-1">Mật khẩu <span class="text-danger">*</span></label>
                <div class="form-control-icon position-relative">
                  <input
                    v-model="form.password"
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
                <span v-else><i class="fa-solid fa-user-plus me-2"></i> HOÀN TẤT ĐĂNG KÝ</span>
              </button>

              <div class="text-center text-muted fs-7">
                Đã có tài khoản thành viên?
                <router-link to="/login" class="text-danger fw-bold text-decoration-none ms-1">
                  Đăng nhập tại đây <i class="fa-solid fa-arrow-right fs-8"></i>
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
import { reactive, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const showPassword = ref(false);
const errorMsg = ref("");
const form = reactive({
  name: "",
  phone: "",
  email: "",
  password: "",
});

const handleRegister = async () => {
  errorMsg.value = "";
  try {
    await authStore.register(form);
    router.push("/");
  } catch (err) {
    errorMsg.value = err.message;
  }
};
</script>
