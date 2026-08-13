<template>
  <div class="py-5">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="text-warning fw-bold text-uppercase tracking-wider">Chương trình tri ân</span>
        <h1 class="display-5 fw-bold brand-font">Thẻ Thành Viên & Quyền Lợi Ưu Đãi</h1>
        <p class="text-muted">Tích lũy chi tiêu tự động sau mỗi lần dùng bữa để nhận ngay chiết khấu đến 15%</p>
      </div>

      <!-- Current User Rank Progress (If Logged In) -->
      <div v-if="authStore.isAuthenticated" class="glass-card p-4 p-md-5 rounded-5 mb-5 border-warning max-w-3xl mx-auto">
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          <div class="d-flex align-items-center gap-3">
            <div class="p-3 bg-warning bg-opacity-20 rounded-circle text-warning fs-1">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <small class="text-muted d-block">Xin chào thành viên</small>
              <h3 class="fw-bold brand-font mb-1">{{ authStore.user?.name }}</h3>
              <span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold">
                Hạng {{ myRankData?.currentRank?.name || 'Đồng' }} (Ưu đãi {{ myRankData?.currentRank?.discountPercent || 0 }}%)
              </span>
            </div>
          </div>

          <div class="text-md-end">
            <small class="text-muted d-block">Tổng chi tiêu tích lũy</small>
            <h2 class="fw-bold text-danger mb-0">{{ (myRankData?.totalSpent || 0).toLocaleString('vi-VN') }}đ</h2>
          </div>
        </div>

        <!-- Progress Bar to Next Rank -->
        <div v-if="myRankData?.nextRank" class="mt-4 pt-3 border-top">
          <div class="d-flex justify-content-between small text-muted mb-2">
            <span>Tiến trình thăng hạng {{ myRankData.nextRank.name }} (Giảm {{ myRankData.nextRank.discountPercent }}%)</span>
            <span class="text-danger fw-bold">Còn thiếu {{ myRankData.amountToNextRank.toLocaleString('vi-VN') }}đ</span>
          </div>
          <div class="progress rounded-pill" style="height: 12px;">
            <div
              class="progress-bar bg-warning progress-bar-striped progress-bar-animated"
              role="progressbar"
              :style="{ width: Math.min(100, ((myRankData.totalSpent / myRankData.nextRank.minSpent) * 100)) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 4 Rank Cards Grid -->
      <div class="row g-4">
        <div v-for="rank in ranks" :key="rank._id" class="col-md-3">
          <div class="glass-card h-100 p-4 rounded-4 hover-lift text-center">
            <div class="fs-1 text-warning mb-2">
              <i v-if="rank.name === 'Đồng'" class="fa-solid fa-medal text-secondary"></i>
              <i v-else-if="rank.name === 'Bạc'" class="fa-solid fa-award text-secondary"></i>
              <i v-else-if="rank.name === 'Vàng'" class="fa-solid fa-crown text-warning"></i>
              <i v-else class="fa-solid fa-gem text-primary"></i>
            </div>
            <h3 class="fw-bold brand-font mb-1">Hạng {{ rank.name }}</h3>
            <span class="badge bg-danger px-3 py-2 rounded-pill fs-7 mb-3">Giảm {{ rank.discountPercent }}% Mọi Hóa Đơn</span>
            <p class="text-muted small mb-0">{{ rank.description }}</p>
            <div class="pt-3 mt-3 border-top small text-secondary">
              Chi tiêu từ: <strong>{{ rank.minSpent.toLocaleString('vi-VN') }}đ</strong>
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
import api from "../../services/api";

const authStore = useAuthStore();
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
