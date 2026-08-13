<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Báo Cáo Dashboard Tổng Quan</h2>
        <p class="text-muted small mb-0">Theo dõi doanh thu, tỷ lệ lấp đầy bàn ăn và chỉ số kinh doanh real-time</p>
      </div>
      <button @click="fetchStats" class="btn btn-outline-danger btn-sm rounded-pill px-3">
        <i class="fa-solid fa-rotate me-1"></i> Làm mới dữ liệu
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <template v-else-if="stats">
      <!-- 4 Metric Cards -->
      <div class="row g-4 mb-4">
        <!-- Doanh Thu -->
        <div class="col-md-3">
          <div class="glass-card p-4 rounded-4 border-start border-danger border-4">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted d-block mb-1">Tổng Doanh Thu</small>
                <h3 class="fw-bold text-danger mb-0">{{ (stats.totalRevenue || 0).toLocaleString('vi-VN') }}đ</h3>
              </div>
              <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <i class="fa-solid fa-money-bill-wave fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Tỷ Lệ Lấp Đầy Bàn -->
        <div class="col-md-3">
          <div class="glass-card p-4 rounded-4 border-start border-warning border-4">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted d-block mb-1">Tỷ Lệ Lấp Đầy Bàn</small>
                <h3 class="fw-bold text-warning mb-0">{{ stats.tablesOverview?.occupancyRate || '0%' }}</h3>
                <small class="text-muted fs-8">{{ stats.tablesOverview?.occupiedTables || 0 }}/{{ stats.tablesOverview?.totalTables || 0 }} bàn đang có khách</small>
              </div>
              <div class="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
                <i class="fa-solid fa-chair fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Tổng Đơn Đặt Bàn -->
        <div class="col-md-3">
          <div class="glass-card p-4 rounded-4 border-start border-primary border-4">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted d-block mb-1">Số Đơn Đặt Bàn</small>
                <h3 class="fw-bold text-primary mb-0">{{ stats.reservationsCount || 0 }} đơn</h3>
              </div>
              <div class="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i class="fa-solid fa-calendar-check fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Hóa Đơn Xuất -->
        <div class="col-md-3">
          <div class="glass-card p-4 rounded-4 border-start border-success border-4">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted d-block mb-1">Hóa Đơn Đã Thu</small>
                <h3 class="fw-bold text-success mb-0">{{ stats.invoiceCount || 0 }} đơn</h3>
              </div>
              <div class="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i class="fa-solid fa-receipt fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Top 5 Món Bán Chạy -->
        <div class="col-lg-7">
          <div class="glass-card p-4 rounded-4 h-100">
            <h5 class="fw-bold brand-font mb-3">🔥 Top 5 Món Ăn Bán Chạy Nhất</h5>
            <div v-if="stats.topDishes && stats.topDishes.length > 0" class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr class="text-muted small">
                    <th>#</th>
                    <th>Món ăn đặc sản</th>
                    <th>Số lượng bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(dish, idx) in stats.topDishes" :key="dish._id">
                    <td class="fw-bold">{{ idx + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img :src="dish.image || 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=100&q=80'" class="rounded-2" style="width: 40px; height: 40px; object-fit: cover;" />
                        <span class="fw-semibold">{{ dish.name }}</span>
                      </div>
                    </td>
                    <td><span class="badge bg-danger rounded-pill">{{ dish.totalQuantity }} phần</span></td>
                    <td class="fw-bold text-success">{{ dish.totalRevenue.toLocaleString('vi-VN') }}đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted small py-4 text-center">Chưa có dữ liệu gọi món trong khoảng thời gian này</p>
          </div>
        </div>

        <!-- Cảnh báo Nguyên Liệu Sắp Hết Kho -->
        <div class="col-lg-5">
          <div class="glass-card p-4 rounded-4 h-100 border-danger border-opacity-50">
            <h5 class="fw-bold brand-font text-danger mb-3">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>Cảnh Báo Tồn Kho Sắp Hết
            </h5>
            <div v-if="stats.lowStockAlerts?.ingredients && stats.lowStockAlerts.ingredients.length > 0" class="space-y-3">
              <div v-for="ing in stats.lowStockAlerts.ingredients" :key="ing._id" class="p-3 bg-danger bg-opacity-10 rounded-3 d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong class="d-block text-dark">{{ ing.name }}</strong>
                  <small class="text-muted">Ngưỡng tối thiểu: {{ ing.minStockLevel }} {{ ing.unit }}</small>
                </div>
                <span class="badge bg-danger fs-7">Còn lại: {{ ing.stockQuantity }} {{ ing.unit }}</span>
              </div>
            </div>
            <div v-else class="text-center py-4 text-success">
              <i class="fa-solid fa-circle-check fs-2 mb-2 d-block"></i>
              <span class="small fw-semibold">Kho nguyên liệu hiện tại đều đầy đủ an toàn!</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";

const stats = ref(null);
const loading = ref(false);

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await api.get("/dashboard/stats");
    stats.value = res.data.data;
  } catch (err) {
    console.error("Lỗi lấy thông tin dashboard:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>
