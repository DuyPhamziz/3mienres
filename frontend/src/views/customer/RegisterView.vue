<template>
  <div class="py-5">
    <div class="container">
      <div class="max-w-md mx-auto glass-card p-4 p-md-5 rounded-5">
        <div class="text-center mb-4">
          <span class="fs-1">🦀</span>
          <h2 class="fw-bold brand-font text-danger mt-1">Đăng Ký Thành Viên</h2>
          <p class="text-muted small">Tạo tài khoản để nhận ngay ưu đãi thăng hạng và chiết khấu đặc biệt</p>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label class="form-label fw-semibold">Họ và tên</label>
            <input v-model="form.name" type="text" class="form-control py-2 rounded-3" placeholder="Nguyễn Văn A" required />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Số điện thoại</label>
            <input v-model="form.phone" type="tel" class="form-control py-2 rounded-3" placeholder="0988776655" required />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Địa chỉ Email</label>
            <input v-model="form.email" type="email" class="form-control py-2 rounded-3" placeholder="khachhang@gmail.com" required />
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Mật khẩu</label>
            <input v-model="form.password" type="password" class="form-control py-2 rounded-3" placeholder="******" required />
          </div>

          <div v-if="errorMsg" class="alert alert-danger mb-3 small rounded-3">
            {{ errorMsg }}
          </div>

          <button type="submit" :disabled="authStore.loading" class="btn btn-primary-crab btn-lg w-100 py-3 mb-3">
            <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
            <span v-else>ĐĂNG KÝ NGAY</span>
          </button>

          <p class="text-center small text-muted mb-0">
            Đã có tài khoản? <router-link to="/login" class="text-danger fw-bold text-decoration-none">Đăng nhập</router-link>
          </p>
        </form>
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
