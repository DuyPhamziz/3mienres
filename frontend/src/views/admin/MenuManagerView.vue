<template>
  <div class="menu-manager-view">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-book-open text-danger me-2"></i>Quản Lý Thực Đơn & Phân Tích Giá Vốn (COGS)
        </h4>
        <p class="text-secondary small mb-0">Quản lý món ăn đặc sản, cập nhật giá bán, tính toán giá vốn theo công thức và biên lợi nhuận</p>
      </div>

      <div class="d-flex gap-2 align-items-center flex-wrap">
        <div class="input-group input-group-sm" style="width: 200px;">
          <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input v-model="search" @keyup.enter="onSearch" type="text" class="form-control" placeholder="Tìm món ăn..." />
        </div>
        <button @click="exportMenuExcel" class="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold">
          <i class="fa-solid fa-file-excel me-1"></i> Xuất Excel
        </button>
        <button @click="showAddModal = true" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm">
          <i class="fa-solid fa-plus me-1"></i> Thêm Món
        </button>
        <button @click="showCategoryModal = true" class="btn btn-outline-warning text-dark btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-layer-group me-1"></i> Danh Mục
        </button>
        <button @click="loadData" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Dish Table Grid -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden p-4">
      <div v-if="dishList.length > 0" class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 70px;">Hình Ảnh</th>
              <th style="width: 220px;">Món Ăn Đặc Sản</th>
              <th style="width: 100px;">Vùng Miền</th>
              <th style="width: 120px;">Giá Bán</th>
              <th style="width: 120px;">Giá Vốn (COGS)</th>
              <th style="width: 140px;">Biên Lợi Nhuận</th>
              <th style="width: 120px;" class="text-center">Trạng Thái</th>
              <th style="width: 140px;" class="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dish in dishList" :key="dish._id">
              <td>
                <div class="position-relative d-inline-block">
                  <img
                    v-if="dish.image"
                    :src="getImageUrl(dish.image)"
                    loading="lazy"
                    decoding="async"
                    class="rounded-3 shadow-2xs border"
                    style="width: 48px; height: 48px; object-fit: cover;"
                    onerror="this.src='/images/dishes/default-dish.jpg'"
                  />
                  <div v-else class="p-2 bg-light rounded-3 text-center border" style="width: 48px; height: 48px;">
                    <i class="fa-solid fa-utensils fs-5 text-danger mt-1"></i>
                  </div>
                </div>
              </td>
              <td>
                <strong class="d-block text-dark">{{ dish.name }}</strong>
                <small class="text-muted fs-9">{{ dish.category?.name || dish.category }}</small>
              </td>
              <td>
                <span
                  :class="[
                    'badge rounded-pill px-2.5 py-1 fs-9 fw-semibold',
                    dish.region === 'Bắc' ? 'bg-danger bg-opacity-15 text-danger' : dish.region === 'Trung' ? 'bg-primary bg-opacity-15 text-primary' : 'bg-success bg-opacity-15 text-success'
                  ]"
                >
                  Miền {{ dish.region || 'Nam' }}
                </span>
              </td>
              <td><strong class="text-dark fs-8">{{ (dish.price || 0).toLocaleString('vi-VN') }}đ</strong></td>
              <td>
                <span class="text-secondary fw-semibold">
                  {{ (dish.foodCost || 0).toLocaleString('vi-VN') }}đ
                </span>
              </td>
              <td>
                <div>
                  <strong :class="dish.profitMargin >= 60 ? 'text-success' : dish.profitMargin >= 40 ? 'text-primary' : 'text-danger'">
                    {{ dish.profitMargin !== undefined ? dish.profitMargin : 0 }}%
                  </strong>
                  <span
                    :class="[
                      'badge rounded-pill px-2 py-0.5 fs-9 ms-1 fw-bold',
                      dish.profitMargin >= 60 ? 'bg-success bg-opacity-15 text-success' : dish.profitMargin >= 40 ? 'bg-primary bg-opacity-15 text-primary' : 'bg-danger bg-opacity-15 text-danger'
                    ]"
                  >
                    {{ dish.profitMargin >= 60 ? '🔥 Lãi Cao' : dish.profitMargin >= 40 ? 'Ổn Định' : 'Cần Tối Ưu' }}
                  </span>
                </div>
              </td>
              <td class="text-center">
                <span :class="['badge px-2.5 py-1 rounded-pill fs-9 fw-bold', dish.availability !== false ? 'bg-success bg-opacity-15 text-success' : 'bg-danger text-white']">
                  {{ dish.availability !== false ? '✅ CÒN HÀNG' : '❌ HẾT HÀNG' }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button @click="openUploadModal(dish)" class="btn btn-outline-primary btn-sm rounded-circle me-1" title="Tải ảnh món">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                  </button>
                  <button
                    @click="toggleAvailability(dish)"
                    :class="['btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold', dish.availability !== false ? 'btn-outline-danger' : 'btn-outline-success']"
                  >
                    {{ dish.availability !== false ? 'Tắt' : 'Bật' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small py-5 text-center mb-0">Chưa có món ăn nào trong thực đơn</p>
    </div>

    <!-- Modals -->
    <AddDishModal
      v-if="showAddModal"
      :categories="menuStore.categories"
      :error="modalError"
      @close="showAddModal = false"
      @submit="handleAddDish"
    />

    <UploadDishImageModal
      v-if="showUploadModal"
      :dish="selectedDish"
      @close="showUploadModal = false"
      @uploaded="handleDishUploaded"
    />

    <CategoryModal
      v-if="showCategoryModal"
      :categories="menuStore.categories"
      @close="showCategoryModal = false"
      @refresh="menuStore.fetchCategories()"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMenuStore } from "../../stores/menuStore";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import { exportToCSV } from "../../utils/excelExporter";

import AddDishModal from "../../components/admin/menu/AddDishModal.vue";
import UploadDishImageModal from "../../components/admin/menu/UploadDishImageModal.vue";
import CategoryModal from "../../components/admin/menu/CategoryModal.vue";

const menuStore = useMenuStore();
const dishList = ref([]);
const loading = ref(false);
const search = ref("");
const showAddModal = ref(false);
const showUploadModal = ref(false);
const showCategoryModal = ref(false);
const selectedDish = ref(null);
const modalError = ref("");

const getImageUrl = (path) => {
  if (!path) return "/images/dishes/default-dish.jpg";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path.startsWith("/") ? "" : "/"}${path}`;
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await api.get("/dishes/profit-analysis");
    dishList.value = res.data.data.analysis || [];
    await menuStore.fetchCategories();
  } catch (err) {
    await menuStore.fetchDishes();
    dishList.value = menuStore.dishes;
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  if (!search.value.trim()) {
    loadData();
    return;
  }
  const q = search.value.trim().toLowerCase();
  dishList.value = dishList.value.filter((d) => d.name.toLowerCase().includes(q));
};

const exportMenuExcel = () => {
  const columns = [
    { header: "Tên Món Ăn", key: "name" },
    { header: "Danh Mục", key: (d) => d.category?.name || d.category || "" },
    { header: "Vùng Miền", key: "region" },
    { header: "Giá Bán (đ)", key: "price" },
    { header: "Giá Vốn COGS (đ)", key: (d) => d.foodCost || 0 },
    { header: "Lợi Nhuận Gộp (đ)", key: (d) => d.grossProfit || 0 },
    { header: "Biên Lợi Nhuận (%)", key: (d) => `${d.profitMargin || 0}%` },
    { header: "Trạng Thái", key: (d) => (d.availability !== false ? "Còn hàng" : "Hết hàng") },
  ];
  exportToCSV(columns, dishList.value, `Thuc-Don-Gia-Von-${new Date().toISOString().split("T")[0]}.csv`);
  toast.success("Đã xuất file thực đơn kèm giá vốn thành công!");
};

const openUploadModal = (dish) => {
  selectedDish.value = dish;
  showUploadModal.value = true;
};

const toggleAvailability = async (dish) => {
  try {
    await menuStore.toggleAvailability(dish._id);
    dish.availability = !dish.availability;
    toast.success(`Đã cập nhật trạng thái món ${dish.name}`);
  } catch (err) {
    toast.error("Lỗi cập nhật trạng thái: " + err.message);
  }
};

const handleAddDish = async (form) => {
  modalError.value = "";
  try {
    await menuStore.createDish(form);
    toast.success("Thêm món ăn mới thành công!");
    showAddModal.value = false;
    await loadData();
  } catch (err) {
    modalError.value = err.message;
  }
};

const handleDishUploaded = async () => {
  toast.success("Tải ảnh món ăn thành công!");
  showUploadModal.value = false;
  await loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
