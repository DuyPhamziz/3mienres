<template>
  <div class="menu-manager-view">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-book-open text-danger me-2"></i>Quản Lý Thực Đơn & Phân Tích Giá Vốn (COGS)
        </h4>
        <p class="text-secondary small mb-0">Quản lý món ăn đặc sản, cập nhật giá bán, tính toán giá vốn theo công thức và biên lợi nhuận</p>
      </div>

      <div class="d-flex gap-2 align-items-center flex-wrap">
        <div class="input-group input-group-sm" style="width: 210px;">
          <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input
            v-model="search"
            @input="currentPage = 1"
            type="text"
            class="form-control"
            placeholder="Tìm món ăn..."
          />
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

    <!-- Region Filter Tabs & Counter -->
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div class="d-flex align-items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          v-for="reg in regionTabs"
          :key="reg.key"
          @click="selectRegion(reg.key)"
          :class="['btn btn-sm rounded-pill px-3 fw-semibold text-nowrap transition-all', selectedRegion === reg.key ? 'btn-danger shadow-2xs' : 'btn-light border text-secondary']"
        >
          <i :class="reg.icon" class="me-1"></i>{{ reg.label }}
          <span class="badge ms-1 rounded-pill" :class="selectedRegion === reg.key ? 'bg-white text-danger' : 'bg-secondary bg-opacity-20 text-dark'">
            {{ getRegionCount(reg.key) }}
          </span>
        </button>
      </div>

      <div class="small text-muted">
        Tổng số: <strong class="text-dark">{{ filteredDishList.length }}</strong> món ăn
      </div>
    </div>

    <!-- Dish Table Grid -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
      <p class="text-muted small mt-2">Đang tải danh sách thực đơn...</p>
    </div>

    <div v-else class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden p-3 p-md-4">
      <div v-if="paginatedDishList.length > 0" class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 75px;">Hình Ảnh</th>
              <th style="width: 220px;">Món Ăn Đặc Sản</th>
              <th style="width: 105px;">Vùng Miền</th>
              <th style="width: 120px;">Giá Bán</th>
              <th style="width: 120px;">Giá Vốn (COGS)</th>
              <th style="width: 140px;">Biên Lợi Nhuận</th>
              <th style="width: 120px;" class="text-center">Trạng Thái</th>
              <th style="width: 130px;" class="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dish in paginatedDishList" :key="dish._id">
              <td>
                <div class="position-relative d-inline-block">
                  <img
                    :src="getImageUrl(dish.image)"
                    :alt="dish.name"
                    class="rounded-3 shadow-2xs border object-fit-cover bg-light"
                    style="width: 50px; height: 50px;"
                    onerror="this.src='/uploads/dishes/cua-rang-me-ca-mau.jpg'"
                  />
                </div>
              </td>
              <td>
                <strong class="d-block text-dark fs-7">{{ dish.name }}</strong>
                <small class="text-muted fs-9">{{ dish.category?.name || dish.category || 'Món chính' }}</small>
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

        <!-- ═══ PAGINATION CONTROLS ═══ -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 pt-3 mt-2 border-top">
          <div class="small text-muted">
            Hiển thị <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong> - <strong>{{ Math.min(currentPage * pageSize, filteredDishList.length) }}</strong> trên tổng số <strong>{{ filteredDishList.length }}</strong> món ăn
          </div>

          <div class="d-flex align-items-center gap-2">
            <!-- Select items per page -->
            <select v-model.number="pageSize" @change="currentPage = 1" class="form-select form-select-sm" style="width: 120px; font-size: 0.8rem;">
              <option :value="8">8 món / trang</option>
              <option :value="10">10 món / trang</option>
              <option :value="15">15 món / trang</option>
              <option :value="20">20 món / trang</option>
            </select>

            <!-- Page Buttons -->
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button @click="currentPage--" class="page-link" :disabled="currentPage === 1" aria-label="Previous">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
              </li>

              <li
                v-for="p in visiblePages"
                :key="p"
                class="page-item"
                :class="{ active: p === currentPage }"
              >
                <button @click="currentPage = p" class="page-link">{{ p }}</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button @click="currentPage++" class="page-link" :disabled="currentPage === totalPages" aria-label="Next">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5 text-muted">
        <i class="fa-solid fa-bowl-food display-5 opacity-40 mb-2 d-block"></i>
        <p class="small mb-0">Không tìm thấy món ăn nào phù hợp với bộ lọc</p>
      </div>
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
import { ref, computed, onMounted } from "vue";
import { useMenuStore } from "../../stores/menuStore";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import { exportToCSV } from "../../utils/excelExporter";
import { getImageUrl } from "../../utils/imageHelper";

import AddDishModal from "../../components/admin/menu/AddDishModal.vue";
import UploadDishImageModal from "../../components/admin/menu/UploadDishImageModal.vue";
import CategoryModal from "../../components/admin/menu/CategoryModal.vue";

const menuStore = useMenuStore();
const dishList = ref([]);
const loading = ref(false);
const search = ref("");
const selectedRegion = ref("ALL");
const currentPage = ref(1);
const pageSize = ref(10);

const showAddModal = ref(false);
const showUploadModal = ref(false);
const showCategoryModal = ref(false);
const selectedDish = ref(null);
const modalError = ref("");

const regionTabs = [
  { key: "ALL", label: "Tất Cả Vùng Miền", icon: "fa-solid fa-earth-asia" },
  { key: "Bắc", label: "Miền Bắc", icon: "fa-solid fa-bowl-rice" },
  { key: "Trung", label: "Miền Trung", icon: "fa-solid fa-pepper-hot" },
  { key: "Nam", label: "Miền Nam", icon: "fa-solid fa-water" },
];

const selectRegion = (regionKey) => {
  selectedRegion.value = regionKey;
  currentPage.value = 1;
};

const getRegionCount = (regionKey) => {
  if (regionKey === "ALL") return dishList.value.length;
  return dishList.value.filter((d) => d.region === regionKey).length;
};

const filteredDishList = computed(() => {
  let list = dishList.value;

  // Filter by Region
  if (selectedRegion.value !== "ALL") {
    list = list.filter((d) => d.region === selectedRegion.value);
  }

  // Filter by Search keyword
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    list = list.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      (d.category?.name || d.category || "").toLowerCase().includes(q)
    );
  }

  return list;
});

const totalPages = computed(() => {
  return Math.ceil(filteredDishList.value.length / pageSize.value) || 1;
});

const paginatedDishList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredDishList.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const cur = currentPage.value;

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    let start = Math.max(1, cur - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
  }
  return pages;
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await api.get("/dishes/profit-analysis");
    dishList.value = res.data.data.analysis || [];
    await menuStore.fetchCategories();
  } catch {
    await menuStore.fetchDishes();
    dishList.value = menuStore.dishes;
  } finally {
    loading.value = false;
  }
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
  exportToCSV(columns, filteredDishList.value, `Thuc-Don-Gia-Von-${new Date().toISOString().split("T")[0]}.csv`);
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
.page-link {
  color: #334155;
  border-radius: 6px;
  margin: 0 2px;
  border-color: #e2e8f0;
}
.page-item.active .page-link {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #ffffff;
}
</style>
