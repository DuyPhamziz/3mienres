<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h5 class="fw-bold brand-font mb-0"><i class="fa-solid fa-boxes-stacked text-danger me-2"></i>Danh Sách Nguyên Liệu Trong Kho</h5>
      <div class="d-flex gap-2 align-items-center">
        <div class="input-group input-group-sm" style="width: 220px;">
          <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input v-model="search" @keyup.enter="onSearch" type="text" class="form-control" placeholder="Tìm nguyên liệu..." />
        </div>
        <button @click="fetchIngredients" class="btn btn-outline-danger btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else>
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

      <!-- Phân trang -->
      <div v-if="meta.totalPages > 1" class="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
        <small class="text-muted">Trang {{ meta.page }}/{{ meta.totalPages }} · {{ meta.total }} nguyên liệu</small>
        <div class="d-flex gap-2">
          <button @click="goPage(meta.page - 1)" :disabled="meta.page <= 1" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <i class="fa-solid fa-chevron-left me-1"></i> Trước
          </button>
          <button @click="goPage(meta.page + 1)" :disabled="meta.page >= meta.totalPages" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
            Sau <i class="fa-solid fa-chevron-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";

const ingredients = ref([]);
const loading = ref(false);
const search = ref("");
const page = ref(1);
const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

const fetchIngredients = async () => {
  loading.value = true;
  try {
    const res = await api.get("/ingredients", { params: { search: search.value, page: page.value, limit: 10 } });
    ingredients.value = res.data.data.ingredients;
    meta.value = {
      page: res.data.page || 1,
      limit: res.data.limit || 10,
      total: res.data.total || 0,
      totalPages: res.data.totalPages || 0,
    };
  } catch (err) {
    console.error("Lỗi lấy nguyên liệu kho:", err);
  } finally {
    loading.value = false;
  }
};

const goPage = (p) => {
  if (p < 1 || p > meta.value.totalPages) return;
  page.value = p;
  fetchIngredients();
};

const onSearch = () => {
  page.value = 1;
  fetchIngredients();
};

onMounted(() => {
  fetchIngredients();
});
</script>
