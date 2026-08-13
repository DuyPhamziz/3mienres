<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">Quản Lý Thực Đơn 3 Miền Bắc – Trung – Nam</h2>
        <p class="text-muted small mb-0">Quản lý món ăn đặc sản, cập nhật giá bán, tải ảnh thực tế và bật/tắt nhanh hết món</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="showAddModal = true" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-plus me-1"></i> Thêm Món Ăn Mới & Up Ảnh
        </button>
        <button @click="menuStore.fetchDishes()" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

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
                    v-if="dish.image && dish.image.startsWith('http')"
                    :src="dish.image"
                    class="rounded-3 shadow-sm border"
                    style="width: 55px; height: 55px; object-fit: cover;"
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
    </div>

    <!-- Modal Upload Ảnh Món Ăn -->
    <div v-if="showUploadModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">Tải Ảnh Lên Cho Món: {{ selectedDish?.name }}</h5>
            <button @click="showUploadModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3 text-center">
              <input type="file" ref="fileInput" @change="handleFileSelected" class="form-control" accept="image/*" />
            </div>
            <div v-if="previewUrl" class="text-center my-3">
              <small class="text-muted d-block mb-2">Xem trước ảnh sắp tải lên:</small>
              <img :src="previewUrl" class="img-fluid rounded-4 shadow-sm border" style="max-height: 200px;" />
            </div>
            <div v-if="uploadError" class="alert alert-danger small rounded-3">{{ uploadError }}</div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showUploadModal = false" class="btn btn-light rounded-pill px-4">Hủy</button>
            <button @click="submitImageUpload" :disabled="!selectedFile || uploading" class="btn btn-danger rounded-pill px-4 fw-bold">
              <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
              Tải Ảnh Lên Server
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Thêm Món Ăn Mới -->
    <div v-if="showAddModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">Thêm Món Ăn Đặc Sản Mới</h5>
            <button @click="showAddModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Tên món ăn <span class="text-danger">*</span></label>
              <input v-model="newDish.name" type="text" class="form-control" placeholder="Ví dụ: Cua Sốt Trứng Muối" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Vùng miền <span class="text-danger">*</span></label>
              <select v-model="newDish.region" class="form-select">
                <option value="Bắc">Miền Bắc</option>
                <option value="Trung">Miền Trung</option>
                <option value="Nam">Miền Nam</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Giá bán (đ) <span class="text-danger">*</span></label>
              <input v-model.number="newDish.price" type="number" min="0" step="5000" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Mô tả món ăn</label>
              <textarea v-model="newDish.description" class="form-control" rows="3"></textarea>
            </div>
            <div v-if="addError" class="alert alert-danger small rounded-3">{{ addError }}</div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showAddModal = false" class="btn btn-light rounded-pill px-4">Hủy</button>
            <button @click="submitCreateDish" class="btn btn-danger rounded-pill px-4 fw-bold">Tạo Món Mới</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useMenuStore } from "../../stores/menuStore";
import api from "../../services/api";

const menuStore = useMenuStore();

const showUploadModal = ref(false);
const showAddModal = ref(false);
const selectedDish = ref(null);
const selectedFile = ref(null);
const previewUrl = ref("");
const uploading = ref(false);
const uploadError = ref("");
const addError = ref("");

const newDish = reactive({
  name: "",
  region: "Nam",
  price: 250000,
  description: "",
});

const toggleAvailability = async (dish) => {
  try {
    await api.patch(`/dishes/${dish._id}/toggle-availability`);
    await menuStore.fetchDishes();
  } catch (err) {
    alert("Lỗi đổi trạng thái: " + err.message);
  }
};

const openUploadModal = (dish) => {
  selectedDish.value = dish;
  selectedFile.value = null;
  previewUrl.value = "";
  uploadError.value = "";
  showUploadModal.value = true;
};

const handleFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const submitImageUpload = async () => {
  if (!selectedFile.value) return;
  uploading.value = true;
  uploadError.value = "";
  try {
    const formData = new FormData();
    formData.append("image", selectedFile.value);

    // Up ảnh lên server /api/upload
    const resUpload = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const imageUrl = resUpload.data.url;

    // Cập nhật đường dẫn ảnh vào món ăn
    await api.put(`/dishes/${selectedDish.value._id}`, { image: imageUrl });

    alert("Tải ảnh lên và cập nhật thành công!");
    showUploadModal.value = false;
    await menuStore.fetchDishes();
  } catch (err) {
    uploadError.value = err.response?.data?.message || "Không thể tải ảnh lên!";
  } finally {
    uploading.value = false;
  }
};

const submitCreateDish = async () => {
  addError.value = "";
  try {
    await api.post("/dishes", newDish);
    showAddModal.value = false;
    newDish.name = "";
    await menuStore.fetchDishes();
  } catch (err) {
    addError.value = err.response?.data?.message || "Không thể tạo món mới!";
  }
};

onMounted(() => {
  menuStore.fetchDishes();
});
</script>
