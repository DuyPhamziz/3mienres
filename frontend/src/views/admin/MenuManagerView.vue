<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Thực Đơn 3 Miền Bắc – Trung – Nam</h2>
        <p class="text-muted small mb-0">Quản lý món ăn đặc sản, cập nhật giá bán và bật/tắt nhanh hết món</p>
      </div>
      <button @click="menuStore.fetchDishes()" class="btn btn-outline-danger btn-sm rounded-pill px-3">
        <i class="fa-solid fa-rotate me-1"></i> Làm mới
      </button>
    </div>

    <div v-if="menuStore.loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="glass-card p-4 rounded-4">
      <div v-if="menuStore.dishes.length > 0" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Món Ăn Đặc Sản</th>
              <th>Vùng Miền</th>
              <th>Giá Bán</th>
              <th>Trạng Thái Hàng</th>
              <th class="text-end">Bật / Tắt Hàng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dish in menuStore.dishes" :key="dish._id">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <img :src="dish.image || 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=100&q=80'" class="rounded-3" style="width: 50px; height: 50px; object-fit: cover;" />
                  <div>
                    <strong class="d-block text-dark">{{ dish.name }}</strong>
                    <small class="text-muted">{{ dish.slug }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span
                  :class="[
                    'badge rounded-pill px-3 py-1 fs-8',
                    dish.region === 'Bắc' ? 'badge-region-bac' : dish.region === 'Trung' ? 'badge-region-trung' : 'badge-region-nam'
                  ]"
                >
                  Miền {{ dish.region }}
                </span>
              </td>
              <td><strong class="text-danger">{{ dish.price.toLocaleString('vi-VN') }}đ</strong></td>
              <td>
                <span :class="['badge px-3 py-1 rounded-pill fs-8', dish.availability ? 'bg-success' : 'bg-danger']">
                  {{ dish.availability ? 'CÒN HÀNG' : 'HẾT HÀNG' }}
                </span>
              </td>
              <td class="text-end">
                <button @click="toggleAvailability(dish)" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
                  {{ dish.availability ? 'Đánh dấu Hết Hàng' : 'Mở bán lại' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small py-4 text-center mb-0">Chưa có món ăn nào trong thực đơn</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useMenuStore } from "../../stores/menuStore";
import api from "../../services/api";

const menuStore = useMenuStore();

const toggleAvailability = async (dish) => {
  try {
    await api.patch(`/dishes/${dish._id}/toggle-availability`);
    await menuStore.fetchDishes();
  } catch (err) {
    alert("Lỗi đổi trạng thái: " + err.message);
  }
};

onMounted(() => {
  menuStore.fetchDishes();
});
</script>
