<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-warning bg-opacity-20 text-warning px-3 py-2 rounded-pill fw-bold mb-2 fs-8 text-uppercase tracking-wider">
          <i class="fa-solid fa-crown me-1"></i>
          {{ langStore.isEnglish ? 'Loyalty Membership Program' : 'Chương Trình Hội Viên Thân Thiết' }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">
          {{ langStore.isEnglish ? 'Loyalty Rank Benefits' : 'Hạng Thành Viên & Quyền Lợi' }}
        </h1>
        <p class="text-muted">
          {{ langStore.isEnglish ? 'Spend more, rank up automatically, earn bigger discounts on every meal.' : 'Tiêu càng nhiều, thăng hạng tự động, nhận chiết khấu trực tiếp mỗi bữa ăn.' }}
        </p>
      </div>

      <!-- Current User Rank Progress -->
      <div v-if="authStore.isAuthenticated" class="glass-card p-4 p-md-5 rounded-5 mb-5 border border-warning bg-white max-w-3xl mx-auto shadow-sm">
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          <div class="d-flex align-items-center gap-3">
            <div class="p-3 bg-warning bg-opacity-20 rounded-circle" style="width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-crown fs-2 text-warning"></i>
            </div>
            <div>
              <small class="text-muted d-block">
                {{ langStore.isEnglish ? 'Welcome back,' : 'Xin chào,' }}
              </small>
              <h3 class="fw-bold brand-font mb-1 text-dark">{{ authStore.user?.name }}</h3>
              <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                {{ langStore.isEnglish ? 'Rank:' : 'Hạng:' }}
                {{ myRankData?.currentRank?.name || (langStore.isEnglish ? 'Bronze' : 'Đồng') }}
                &nbsp;·&nbsp;
                {{ langStore.isEnglish ? 'Discount' : 'Giảm' }} {{ myRankData?.currentRank?.discountPercent || 0 }}%
              </span>
            </div>
          </div>

          <div class="text-md-end">
            <small class="text-muted d-block mb-1">
              {{ langStore.isEnglish ? 'Total Spending' : 'Tổng Chi Tiêu Tích Lũy' }}
            </small>
            <h2 class="fw-bold text-danger mb-0">{{ (myRankData?.totalSpent || 0).toLocaleString('vi-VN') }}đ</h2>
          </div>
        </div>

        <div v-if="myRankData?.nextRank" class="mt-4 pt-3 border-top">
          <div class="d-flex justify-content-between small text-muted mb-2">
            <span>
              {{ langStore.isEnglish ? 'Progress to rank' : 'Tiến trình lên hạng' }}
              <strong class="text-dark ms-1">{{ myRankData.nextRank.name }}</strong>
              ({{ langStore.isEnglish ? 'Discount' : 'Giảm' }} {{ myRankData.nextRank.discountPercent }}%)
            </span>
            <span class="text-danger fw-bold">
              {{ langStore.isEnglish ? 'Remaining:' : 'Còn thiếu:' }}
              {{ myRankData.amountToNextRank.toLocaleString('vi-VN') }}đ
            </span>
          </div>
          <div class="progress rounded-pill" style="height: 12px;">
            <div
              class="progress-bar bg-warning progress-bar-striped progress-bar-animated"
              role="progressbar"
              :style="{ width: Math.min(100, ((myRankData.totalSpent / myRankData.nextRank.minSpent) * 100)) + '%' }"
            ></div>
          </div>
        </div>

        <div v-else-if="myRankData" class="mt-4 pt-3 border-top text-center">
          <span class="badge bg-success px-4 py-2 rounded-pill fw-bold fs-7">
            <i class="fa-solid fa-gem me-1"></i>
            {{ langStore.isEnglish ? '🏆 Highest Rank — Diamond Member!' : '🏆 Hạng Cao Nhất — Thành Viên Kim Cương!' }}
          </span>
        </div>
      </div>

      <!-- Not logged in prompt -->
      <div v-else class="glass-card p-5 rounded-5 text-center bg-white mb-5 max-w-xl mx-auto shadow-sm border border-warning border-opacity-50">
        <i class="fa-solid fa-crown display-4 text-warning mb-3 d-block"></i>
        <h4 class="fw-bold text-dark mb-2">
          {{ langStore.isEnglish ? 'Login to track your loyalty rank' : 'Đăng nhập để theo dõi hạng thành viên của bạn' }}
        </h4>
        <p class="text-muted small mb-4">
          {{ langStore.isEnglish ? 'Create an account and start earning discounts automatically.' : 'Tạo tài khoản để bắt đầu tích lũy và nhận ưu đãi tự động.' }}
        </p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/login" class="btn btn-primary-crab px-4 fw-bold">
            <i class="fa-solid fa-right-to-bracket me-2"></i>
            {{ langStore.isEnglish ? 'Login' : 'Đăng Nhập' }}
          </router-link>
          <router-link to="/register" class="btn btn-outline-warning rounded-pill px-4 fw-bold">
            {{ langStore.isEnglish ? 'Register' : 'Đăng Ký Ngay' }}
          </router-link>
        </div>
      </div>

      <!-- 4 Rank Cards -->
      <div class="row g-4">
        <div v-for="rank in ranks" :key="rank._id" class="col-md-6 col-lg-3">
          <div class="glass-card h-100 p-4 rounded-4 hover-lift text-center bg-white border-0 shadow-sm">
            <!-- Rank Icon -->
            <div class="fs-1 mb-3">
              <i v-if="rank.name === 'Đồng'" class="fa-solid fa-medal" style="color: #b45309;"></i>
              <i v-else-if="rank.name === 'Bạc'" class="fa-solid fa-award" style="color: #64748b;"></i>
              <i v-else-if="rank.name === 'Vàng'" class="fa-solid fa-crown text-warning"></i>
              <i v-else class="fa-solid fa-gem text-primary"></i>
            </div>

            <h4 class="fw-bold brand-font mb-1 text-dark">
              {{ langStore.isEnglish ? 'Rank' : 'Hạng' }} {{ rank.name }}
            </h4>
            <span class="badge bg-danger px-3 py-2 rounded-pill fs-7 mb-3 d-inline-block">
              {{ langStore.isEnglish ? `${rank.discountPercent}% off every meal` : `Giảm ${rank.discountPercent}% mỗi bữa ăn` }}
            </span>
            <p class="text-muted small mb-0 leading-relaxed">{{ rank.description }}</p>
            <div class="pt-3 mt-3 border-top small text-muted">
              {{ langStore.isEnglish ? 'Required spending:' : 'Chi tiêu tối thiểu:' }}
              <strong class="text-dark d-block">{{ rank.minSpent.toLocaleString('vi-VN') }}đ</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useLangStore } from "../../stores/langStore";
import api from "../../services/api";

const authStore = useAuthStore();
const langStore = useLangStore();
const ranks = ref([]);
const myRankData = ref(null);

onMounted(async () => {
  try {
    const resRanks = await api.get("/ranks");
    ranks.value = resRanks.data.data.ranks;

    if (authStore.isAuthenticated) {
      const resMy = await api.get("/ranks/me");
      myRankData.value = resMy.data.data;
    }
  } catch (err) {
    console.error("Lỗi lấy thông tin hạng thành viên:", err);
  }
});
</script>
