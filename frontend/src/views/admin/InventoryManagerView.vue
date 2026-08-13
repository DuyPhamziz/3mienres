<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Kho Nguyên Liệu & Nhập Kho</h2>
        <p class="text-muted small mb-0">Theo dõi tồn kho thực phẩm, cảnh báo nguyên liệu sắp hết và tạo phiếu nhập kho</p>
      </div>
      <button @click="fetchIngredients" class="btn btn-outline-danger btn-sm rounded-pill px-3">
        <i class="fa-solid fa-rotate me-1"></i> Làm mới
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="glass-card p-4 rounded-4 mb-4">
      <h5 class="fw-bold brand-font mb-3">📦 Danh Sách Nguyên Liệu Trong Kho</h5>
      <div v-if="ingredients.length > 0" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Tên Nguyên Liệu</th>
              <th>Đơn Vị Tính</th>
              <th>Số Lượng Tồn Kho</th>
              <th>Ngưỡng Tối Thiểu</th>
              <th>Trạng Thái Tồn Kho</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ing in ingredients" :key="ing._id">
              <td><strong class="text-dark">{{ ing.name }}</strong></td>
              <td><span class="badge bg-light text-dark border">{{ ing.unit }}</span></td>
              <td><strong :class="ing.isLowStock ? 'text-danger' : 'text-success'">{{ ing.stockQuantity }} {{ ing.unit }}</strong></td>
              <td>{{ ing.minStockLevel }} {{ ing.unit }}</td>
              <td>
                <span :class="['badge px-3 py-1 rounded-pill fs-8', ing.isLowStock ? 'bg-danger' : 'bg-success']">
                  {{ ing.isLowStock ? 'CẢNH BÁO SẮP HẾT' : 'AN TOÀN' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small py-4 text-center mb-0">Chưa có nguyên liệu nào trong kho</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";

const ingredients = ref([]);
const loading = ref(false);

const fetchIngredients = async () => {
  loading.value = true;
  try {
    const res = await api.get("/ingredients");
    ingredients.value = res.data.data.ingredients;
  } catch (err) {
    console.error("Lỗi lấy nguyên liệu kho:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchIngredients();
});
</script>
