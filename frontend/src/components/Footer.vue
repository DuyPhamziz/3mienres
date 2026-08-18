<template>
  <footer class="bg-dark text-white pt-5 pb-4 mt-auto">
    <div class="container">
      <div class="row g-4 mb-4">
        <!-- Col 1: Brand Info -->
        <div class="col-lg-4 col-md-6">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="p-2 bg-danger bg-opacity-20 text-danger rounded-3">
              <i class="fa-solid fa-utensils fs-4 text-warning"></i>
            </div>
            <span class="fw-bold fs-4 brand-font text-white">3 MIỀN CUA</span>
          </div>
          <p class="text-white-50 small leading-relaxed mb-3">
            {{ langStore.t('nav.brandSub') }}. {{ langStore.t('home.desc') }}
          </p>
          <div class="d-flex gap-3 text-warning">
            <i class="fa-brands fa-facebook fs-4 cursor-pointer"></i>
            <i class="fa-brands fa-youtube fs-4 cursor-pointer"></i>
            <i class="fa-brands fa-tiktok fs-4 cursor-pointer"></i>
          </div>
        </div>

        <!-- Col 2: Navigation Links -->
        <div class="col-lg-2 col-md-6">
          <h6 class="fw-bold text-white mb-3 brand-font">Menu Navigation</h6>
          <ul class="list-unstyled space-y-2 fs-7 text-white-50">
            <li class="mb-2"><router-link to="/" class="text-white-50 text-decoration-none hover-text-white">{{ langStore.t('nav.home') }}</router-link></li>
            <li class="mb-2"><router-link to="/thuc-don" class="text-white-50 text-decoration-none hover-text-white">{{ langStore.t('nav.menu') }}</router-link></li>
            <li class="mb-2"><router-link to="/dat-ban" class="text-white-50 text-decoration-none hover-text-white">{{ langStore.t('nav.bookTable') }}</router-link></li>
            <li class="mb-2"><router-link to="/tra-cuu" class="text-white-50 text-decoration-none hover-text-white">{{ langStore.t('nav.trackOrder') }}</router-link></li>
            <li class="mb-2"><router-link to="/hang-thanh-vien" class="text-white-50 text-decoration-none hover-text-white">{{ langStore.t('nav.loyalty') }}</router-link></li>
          </ul>
        </div>

        <!-- Col 3: Opening Hours & Contact -->
        <div class="col-lg-3 col-md-6">
          <h6 class="fw-bold text-white mb-3 brand-font">{{ langStore.t('nav.contact') }}</h6>
          <ul class="list-unstyled space-y-2 fs-7 text-white-50">
            <li class="mb-2"><i class="fa-solid fa-clock text-warning me-2"></i> {{ langStore.t('nav.hours') }}</li>
            <li class="mb-2"><i class="fa-solid fa-phone text-warning me-2"></i> Hotline: 1900 1234</li>
            <li class="mb-2"><i class="fa-solid fa-envelope text-warning me-2"></i> info@3miencua.vn</li>
            <li class="mb-2"><i class="fa-solid fa-location-dot text-warning me-2"></i> 123 Đường Hải Sản, TP. Hồ Chí Minh</li>
          </ul>
        </div>

        <!-- Col 4: Member Perks & Feedback -->
        <div class="col-lg-3 col-md-6">
          <h6 class="fw-bold text-white mb-3 brand-font">Hội Viên & Đóng Góp Ý Kiến</h6>
          <p class="text-white-50 small mb-3">Tích điểm nhận ưu đãi đến 15% và gửi phản hồi giúp nhà hàng nâng cao chất lượng dịch vụ.</p>
          <div class="d-flex flex-column gap-2">
            <router-link to="/register" class="btn btn-warning btn-sm w-100 rounded-pill fw-bold text-dark">
              <i class="fa-solid fa-crown me-1"></i> Đăng Ký Hội Viên
            </router-link>
            <button
              @click="showFeedbackModal = true"
              type="button"
              class="btn btn-outline-light btn-sm w-100 rounded-pill fw-semibold"
            >
              <i class="fa-solid fa-comment-dots text-warning me-1"></i> Gửi Góp Ý / Phản Hồi
            </button>
          </div>
        </div>
      </div>

      <div class="border-top border-secondary pt-3 text-center text-white-50 fs-8">
        {{ langStore.t('nav.copyright') }}
      </div>
    </div>

    <!-- Customer Feedback Modal -->
    <FeedbackModal
      :show="showFeedbackModal"
      :is-english="langStore.isEnglish"
      @close="showFeedbackModal = false"
    />
  </footer>
</template>

<script setup>
import { ref } from "vue";
import { useLangStore } from "../stores/langStore";
import FeedbackModal from "./customer/FeedbackModal.vue";

const langStore = useLangStore();
const showFeedbackModal = ref(false);
</script>
