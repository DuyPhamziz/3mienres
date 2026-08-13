<template>
  <div class="py-5">
    <div class="container">
      <div class="max-w-md mx-auto glass-card p-4 p-md-5 rounded-5">
        <div class="text-center mb-4">
          <span class="fs-1">🦀</span>
          <h2 class="fw-bold brand-font text-danger mt-1">Đăng Nhập Tài Khoản</h2>
          <p class="text-muted small">Đăng nhập để theo dõi tích lũy chi tiêu & nhận ưu đãi thăng hạng</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label fw-semibold">Địa chỉ Email</label>
            <input v-model="email" type="email" class="form-control py-2 rounded-3" placeholder="manager@gmail.com" required />
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Mật khẩu</label>
            <input v-model="password" type="password" class="form-control py-2 rounded-3" placeholder="******" required />
          </div>

          <div v-if="errorMsg" class="alert alert-danger mb-3 small rounded-3">
            {{ errorMsg }}
          </div>

          <button type="submit" :disabled="authStore.loading" class="btn btn-primary-crab btn-lg w-100 py-3 mb-3">
            <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
            <span v-else>ĐĂNG NHẬP NGAY</span>
          </button>

          <p class="text-center small text-muted mb-0">
            Chưa có tài khoản? <router-link to="/register" class="text-danger fw-bold text-decoration-none">Đăng ký ngay</router-link>
          </p>
        </form>
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
