<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Thực Đơn 3 Miền Bắc – Trung – Nam</h2>
        <p class="text-muted small mb-0">Quản lý món ăn đặc sản, cập nhật giá bán, tải ảnh thực tế và bật/tắt nhanh hết món</p>
      </div>
      <div class="d-flex gap-2 align-items-center flex-wrap">
        <div class="input-group input-group-sm" style="width: 200px;">
          <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input v-model="search" @keyup.enter="onSearch" type="text" class="form-control" placeholder="Tìm món ăn..." />
        </div>
        <button @click="showAddModal = true" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-plus me-1"></i> Thêm Món
        </button>
        <button @click="openCategoryModal" class="btn btn-outline-warning btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-layer-group me-1"></i> Danh Mục
        </button>
        <button @click="loadDishes" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Dish Table Grid -->
    <div v-if="menuStore.loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="glass-card p-4 rounded-4">
      <div v-if="menuStore.dishes.length > 0" class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Hình Ảnh Món Ăn</th>
              <th>Tên Món Ăn Đặc Sản</th>
              <th>Vùng Miền</th>
              <th>Giá Bán</th>
              <th>Trạng Thái Hàng</th>
              <th class="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dish in menuStore.dishes" :key="dish._id">
              <td>
                <div class="position-relative d-inline-block">
                  <img
                    v-if="dish.image"
                    :src="getImageUrl(dish.image)"
                    loading="lazy"
                    decoding="async"
                    class="rounded-3 shadow-sm border"
                    style="width: 55px; height: 55px; object-fit: cover;"
                    onerror="this.src='/images/dishes/default-dish.jpg'"
                  />
                  <div v-else class="p-2 bg-light rounded-3 text-center border" style="width: 55px; height: 55px;">
                    <i class="fa-solid fa-utensils fs-4 text-danger mt-1"></i>
                  </div>
                </div>
              </td>
              <td>
                <strong class="d-block text-dark">{{ dish.name }}</strong>
                <small class="text-muted">{{ dish.slug }}</small>
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
                <button @click="openUploadModal(dish)" class="btn btn-outline-primary btn-sm rounded-pill me-2">
                  <i class="fa-solid fa-cloud-arrow-up me-1"></i> Up Ảnh
                </button>
                <button @click="toggleAvailability(dish)" class="btn btn-outline-secondary btn-sm rounded-pill">
                  {{ dish.availability ? 'Hết hàng' : 'Mở lại' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted small py-4 text-center mb-0">Chưa có món ăn nào trong thực đơn</p>

      <!-- Phân trang -->
      <div v-if="meta.totalPages > 1" class="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
        <small class="text-muted">Trang {{ meta.page }}/{{ meta.totalPages }} · {{ meta.total }} món</small>
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

    <!-- Modals -->
    <UploadDishImageModal
      v-if="showUploadModal && selectedDish"
      :dish="selectedDish"
      :uploading="uploading"
      :error="uploadError"
      @close="showUploadModal = false"
      @submit="submitImageUpload"
    />

    <AddDishModal
      v-if="showAddModal"
      :categories="categories"
      :error="addDishError"
      @close="showAddModal = false"
      @submit="submitAddDish"
    />

    <CategoryModal
      v-if="showCategoryModal"
      :categories="categories"
      @close="showCategoryModal = false"
      @add="submitCategory"
      @delete="deleteCategory"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMenuStore } from "../../stores/menuStore";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import { getImageUrl } from "../../utils/imageHelper";
import UploadDishImageModal from "../../components/admin/menu/UploadDishImageModal.vue";
import AddDishModal from "../../components/admin/menu/AddDishModal.vue";
import CategoryModal from "../../components/admin/menu/CategoryModal.vue";

const menuStore = useMenuStore();

const search = ref("");
const categories = ref([]);
const meta = ref({ page: 1, totalPages: 1, total: 0 });

const showUploadModal = ref(false);
const showAddModal = ref(false);
const showCategoryModal = ref(false);
const selectedDish = ref(null);
const uploading = ref(false);
const uploadError = ref("");
const addDishError = ref("");

const loadDishes = async (page = 1) => {
  try {
    const params = { page, limit: 10 };
    if (search.value.trim()) params.search = search.value.trim();
    const res = await api.get("/dishes", { params });
    menuStore.dishes = res.data.data.dishes;
    meta.value = {
      page: res.data.meta?.page || 1,
      totalPages: res.data.meta?.totalPages || 1,
      total: res.data.meta?.total || res.data.results || 0,
    };
  } catch {
    toast.error("Không tải được danh sách món ăn");
  }
};

const onSearch = () => loadDishes(1);
const goPage = (p) => loadDishes(p);

const openUploadModal = (dish) => {
  selectedDish.value = dish;
  uploadError.value = "";
  showUploadModal.value = true;
};

const submitImageUpload = async (file) => {
  if (!file) return;
  uploading.value = true;
  uploadError.value = "";
  try {
    const formData = new FormData();
    formData.append("image", file);
    await api.post(`/dishes/${selectedDish.value._id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Tải ảnh món ăn lên server thành công!");
    showUploadModal.value = false;
    loadDishes(meta.value.page);
  } catch (err) {
    uploadError.value = err.response?.data?.message || "Lỗi tải ảnh lên";
  } finally {
    uploading.value = false;
  }
};

const toggleAvailability = async (dish) => {
  try {
    const newStatus = !dish.availability;
    await api.patch(`/dishes/${dish._id}/availability`, { availability: newStatus });
    dish.availability = newStatus;
    toast.success(`Đã chuyển trạng thái: ${newStatus ? "CÒN HÀNG" : "HẾT HÀNG"}`);
  } catch {
    toast.error("Lỗi cập nhật trạng thái món ăn");
  }
};

const submitAddDish = async (form) => {
  addDishError.value = "";
  try {
    await api.post("/dishes", {
      name: form.name.trim(),
      region: form.region,
      category: form.category,
      price: Number(form.price),
      description: form.description ? form.description.trim() : undefined,
    });
    toast.success("Tạo món ăn mới thành công!");
    showAddModal.value = false;
    loadDishes(1);
  } catch (err) {
    addDishError.value = err.response?.data?.message || "Lỗi tạo món ăn";
  }
};

const openCategoryModal = async () => {
  showCategoryModal.value = true;
  await fetchCategories();
};

const fetchCategories = async () => {
  try {
    const res = await api.get("/categories");
    categories.value = res.data.data.categories;
  } catch {
    // fallback
  }
};

const submitCategory = async (name) => {
  try {
    await api.post("/categories", { name });
    toast.success("Thêm danh mục thành công!");
    await fetchCategories();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi thêm danh mục");
  }
};

const deleteCategory = async (cat) => {
  if (!confirm(`Bạn có chắc muốn xóa danh mục '${cat.name}'?`)) return;
  try {
    await api.delete(`/categories/${cat._id}`);
    toast.success("Đã xóa danh mục");
    await fetchCategories();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi xóa danh mục");
  }
};

onMounted(async () => {
  await loadDishes();
  await fetchCategories();
});
</script>

<style scoped>
.badge-region-bac { background: #dbeafe; color: #1e40af; }
.badge-region-trung { background: #fef3c7; color: #92400e; }
.badge-region-nam { background: #fee2e2; color: #991b1b; }
</style>
