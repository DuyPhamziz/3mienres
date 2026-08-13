<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">{{ langStore.t('admin.dashboard.title') }}</h2>
        <p class="text-muted small mb-0">{{ langStore.t('admin.dashboard.subtitle') }}</p>
      </div>
      <button @click="fetchData" class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">
        <i class="fa-solid fa-rotate me-1"></i> {{ langStore.isEnglish ? 'Refresh Data' : 'Làm mới' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <template v-else>
      <!-- KPI Metric Cards Grid -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="glass-card p-4 rounded-4 bg-white border-start border-danger border-5 shadow-sm">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted fw-semibold d-block mb-1">{{ langStore.t('admin.dashboard.totalRevenue') }}</small>
                <h3 class="fw-bold text-danger brand-font mb-0">{{ (kpis.totalRevenue || 0).toLocaleString('vi-VN') }}đ</h3>
              </div>
              <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <i class="fa-solid fa-money-bill-wave fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="glass-card p-4 rounded-4 bg-white border-start border-warning border-5 shadow-sm">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted fw-semibold d-block mb-1">{{ langStore.t('admin.dashboard.occupancyRate') }}</small>
                <h3 class="fw-bold text-dark brand-font mb-0">{{ kpis.occupancyRate || 0 }}%</h3>
              </div>
              <div class="p-3 bg-warning bg-opacity-15 text-warning rounded-circle">
                <i class="fa-solid fa-chart-pie fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="glass-card p-4 rounded-4 bg-white border-start border-primary border-5 shadow-sm">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted fw-semibold d-block mb-1">{{ langStore.t('admin.dashboard.totalReservations') }}</small>
                <h3 class="fw-bold text-primary brand-font mb-0">{{ kpis.totalReservations || 0 }}</h3>
              </div>
              <div class="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i class="fa-solid fa-calendar-check fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="glass-card p-4 rounded-4 bg-white border-start border-success border-5 shadow-sm">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted fw-semibold d-block mb-1">{{ langStore.t('admin.dashboard.activeSessions') }}</small>
                <h3 class="fw-bold text-success brand-font mb-0">{{ kpis.activeSessions || 0 }}</h3>
              </div>
              <div class="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i class="fa-solid fa-utensils fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts & Top Dishes Row -->
      <div class="row g-4 mb-4">
        <!-- Top 5 Best Sellers -->
        <div class="col-lg-6">
          <div class="glass-card p-4 rounded-4 bg-white shadow-sm h-100">
            <h5 class="fw-bold brand-font text-dark mb-3">
              <i class="fa-solid fa-fire text-danger me-2"></i>{{ langStore.t('admin.dashboard.topDishes') }}
            </h5>
            <div v-if="topDishes.length > 0" class="list-group list-group-flush">
              <div v-for="(item, idx) in topDishes" :key="idx" class="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                  <span class="badge bg-danger rounded-circle p-2 fs-8" style="width: 28px; height: 28px;">{{ idx + 1 }}</span>
                  <strong class="text-dark fs-7">{{ item.dishName }}</strong>
                </div>
                <div class="text-end">
                  <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1 fw-bold fs-8 me-2">
                    {{ item.totalQuantity }} suất
                  </span>
                  <strong class="text-dark fs-7">{{ item.totalRevenue.toLocaleString('vi-VN') }}đ</strong>
                </div>
              </div>
            </div>
            <p v-else class="text-muted small py-4 text-center mb-0">Chưa có dữ liệu bán món ăn trong ngày</p>
          </div>
        </div>

        <!-- Low Stock Inventory Alerts -->
        <div class="col-lg-6">
          <div class="glass-card p-4 rounded-4 bg-white shadow-sm h-100">
            <h5 class="fw-bold brand-font text-danger mb-3">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ langStore.t('admin.dashboard.lowStock') }}
            </h5>
            <div v-if="lowStockIngredients.length > 0" class="space-y-2">
              <div v-for="ing in lowStockIngredients" :key="ing._id" class="p-3 bg-danger bg-opacity-10 rounded-3 d-flex justify-content-between align-items-center border border-danger border-opacity-25 mb-2">
                <div>
                  <strong class="d-block text-dark fs-7">{{ ing.name }}</strong>
                  <small class="text-danger">Tồn kho còn: {{ ing.quantityInStock }} {{ ing.unit }} (Mức tối thiểu: {{ ing.minQuantity }})</small>
                </div>
                <router-link to="/admin/inventory" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
                  Nhập kho
                </router-link>
              </div>
            </div>
            <p v-else class="text-muted small py-4 text-center mb-0">
              <i class="fa-solid fa-circle-check text-success me-1"></i> Kho nguyên liệu đang ở mức an toàn
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Invoices Table -->
      <div class="glass-card p-4 rounded-4 bg-white shadow-sm">
        <h5 class="fw-bold brand-font text-dark mb-3">
          <i class="fa-solid fa-receipt me-2 text-danger"></i>{{ langStore.t('admin.dashboard.recentInvoices') }}
        </h5>
        <div v-if="recentInvoices.length > 0" class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr class="text-muted small">
                <th>Mã Hóa Đơn</th>
                <th>Khách Hàng</th>
                <th>Thanh Toán</th>
                <th>Tổng Tiền</th>
                <th>Thời Gian</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in recentInvoices" :key="inv._id">
                <td><strong class="text-danger fs-7">{{ inv.invoiceCode }}</strong></td>
                <td>{{ inv.customerName || 'Khách Vãng Lai' }}</td>
                <td>
                  <span class="badge bg-success bg-opacity-10 text-success px-2.5 py-1 rounded-pill fs-8 fw-semibold">
                    {{ inv.paymentMethod }}
                  </span>
                </td>
                <td><strong class="text-dark fs-7">{{ inv.finalTotal.toLocaleString('vi-VN') }}đ</strong></td>
                <td><small class="text-muted">{{ new Date(inv.createdAt).toLocaleString('vi-VN') }}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted small py-4 text-center mb-0">Chưa có hóa đơn thanh toán nào</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";
import { useLangStore } from "../../stores/langStore";

const langStore = useLangStore();
const loading = ref(false);
const kpis = ref({});
const topDishes = ref([]);
const lowStockIngredients = ref([]);
const recentInvoices = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get("/dashboard/overview");
    const data = res.data.data;
    kpis.value = data.kpis || {};
    topDishes.value = data.topDishes || [];
    lowStockIngredients.value = data.lowStockIngredients || [];
    recentInvoices.value = data.recentInvoices || [];
  } catch (err) {
    console.error("Lỗi lấy dữ liệu Dashboard:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
