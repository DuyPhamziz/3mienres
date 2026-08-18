<template>
  <div class="ingredient-tab">
    <!-- ═══ 1. LOW STOCK ALERT BANNER (NẾU CÓ NGUYÊN LIỆU THIẾU HỤT) ═══ -->
    <div v-if="stats.lowStockCount > 0" class="alert alert-danger rounded-4 p-3 mb-4 shadow-sm border-0 border-start border-4 border-danger">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2.5">
          <div class="p-2 bg-danger bg-opacity-20 text-danger rounded-circle">
            <i class="fa-solid fa-triangle-exclamation fs-5"></i>
          </div>
          <div>
            <h6 class="fw-bold text-danger mb-0 fs-7">Cảnh Báo Tồn Kho Khẩn Cấp! ({{ stats.lowStockCount }} nguyên liệu chạm ngưỡng tối thiểu)</h6>
            <small class="text-secondary fs-8">Các nguyên liệu dưới đây đang sắp hết trong kho, vui lòng lập phiếu nhập hàng bổ sung sớm.</small>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-1.5 align-items-center">
          <span
            v-for="item in stats.lowStockItems"
            :key="item._id"
            class="badge bg-white text-danger border border-danger rounded-pill px-2.5 py-1 fs-9 shadow-2xs"
          >
            {{ item.name }}: <strong>{{ item.stockQuantity }} / {{ item.minStockLevel }} {{ item.unit }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ 2. HEADER & ACTION BAR ═══ -->
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h5 class="fw-bold brand-font text-dark mb-0">
          <i class="fa-solid fa-boxes-stacked text-danger me-2"></i>Danh Sách Nguyên Liệu Trong Kho
        </h5>
        <small class="text-muted">Theo dõi tồn kho thực tế, thiết lập ngưỡng tối thiểu cảnh báo cho nhà bếp</small>
      </div>

      <div class="d-flex gap-2 align-items-center">
        <button @click="exportExcel" class="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold">
          <i class="fa-solid fa-file-excel me-1"></i> Xuất Excel
        </button>
        <button @click="openAddModal" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm">
          <i class="fa-solid fa-plus me-1"></i> Thêm Nguyên Liệu
        </button>
        <button @click="fetchIngredients" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- ═══ 3. FILTER BAR ═══ -->
    <div class="card border-0 rounded-4 shadow-2xs p-3 bg-light mb-3">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white border-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
            <input
              v-model="search"
              @keyup.enter="onSearch"
              type="text"
              class="form-control border-0"
              placeholder="Tìm tên nguyên liệu..."
            />
          </div>
        </div>

        <div class="col-md-3">
          <select v-model="categoryFilter" @change="onSearch" class="form-select form-select-sm rounded-3">
            <option value="">-- Tất cả nhóm --</option>
            <option value="meat">Thịt & Hải sản</option>
            <option value="vegetable">Rau củ quả</option>
            <option value="drink">Nước uống & Rượu</option>
            <option value="spice">Gia vị & Hương liệu</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div class="col-md-3">
          <select v-model="lowStockFilter" @change="onSearch" class="form-select form-select-sm rounded-3">
            <option value="">-- Tất cả trạng thái --</option>
            <option value="true">⚠️ Chỉ xem nguyên liệu CẢNH BÁO</option>
            <option value="false">✅ Chỉ xem nguyên liệu AN TOÀN</option>
          </select>
        </div>

        <div class="col-md-2 text-md-end">
          <span class="text-muted small">
            Tổng: <strong>{{ meta.total }}</strong> nguyên liệu
          </span>
        </div>
      </div>
    </div>

    <!-- ═══ 4. TABLE ═══ -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else>
      <div v-if="ingredients.length > 0" class="table-responsive rounded-4 border bg-white shadow-2xs">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 240px;">Tên Nguyên Liệu</th>
              <th style="width: 140px;">Nhóm Danh Mục</th>
              <th style="width: 100px;">Đơn Vị</th>
              <th style="width: 160px;">Tồn Kho Hiện Tại</th>
              <th style="width: 160px;">Ngưỡng Cảnh Báo</th>
              <th style="width: 140px;" class="text-center">Trạng Thái</th>
              <th style="width: 130px;" class="text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ing in ingredients" :key="ing._id" :class="{ 'table-danger-subtle': ing.isLowStock }">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div
                    :class="[
                      'p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0',
                      ing.isLowStock ? 'bg-danger bg-opacity-15 text-danger' : 'bg-success bg-opacity-15 text-success'
                    ]"
                    style="width: 34px; height: 34px;"
                  >
                    <i :class="ing.isLowStock ? 'fa-solid fa-triangle-exclamation fs-7' : 'fa-solid fa-box fs-7'"></i>
                  </div>
                  <div>
                    <strong class="text-dark d-block">{{ ing.name }}</strong>
                    <small class="text-muted fs-9">Cập nhật: {{ new Date(ing.updatedAt).toLocaleDateString('vi-VN') }}</small>
                  </div>
                </div>
              </td>

              <td>
                <span class="badge bg-light text-dark border rounded-pill px-2.5 py-1 fs-9">
                  {{ categoryLabel(ing.category) }}
                </span>
              </td>

              <td>
                <span class="badge bg-light text-secondary border rounded-pill px-2 py-0.5 fs-9 fw-semibold">
                  {{ ing.unit }}
                </span>
              </td>

              <td>
                <strong :class="ing.isLowStock ? 'text-danger fs-7' : 'text-success fs-7'">
                  {{ ing.stockQuantity }} {{ ing.unit }}
                </strong>
              </td>

              <td>
                <span class="text-secondary fw-semibold">
                  <i class="fa-solid fa-bell text-warning me-1"></i>≤ {{ ing.minStockLevel }} {{ ing.unit }}
                </span>
              </td>

              <td class="text-center">
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold shadow-2xs', ing.isLowStock ? 'bg-danger text-white' : 'bg-success bg-opacity-15 text-success']">
                  {{ ing.isLowStock ? '⚠️ SẮP HẾT HÀNG' : '✅ ĐỦ HÀNG' }}
                </span>
              </td>

              <td class="text-center">
                <div class="btn-group btn-group-sm">
                  <button
                    @click="openEditModal(ing)"
                    class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1 me-1"
                    title="Cấu hình số lượng & ngưỡng cảnh báo"
                  >
                    <i class="fa-solid fa-sliders me-1"></i>Chỉnh Ngưỡng
                  </button>
                  <button
                    @click="confirmDeleteIngredient(ing)"
                    class="btn btn-light btn-sm rounded-circle text-danger"
                    title="Xóa nguyên liệu"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-muted small py-5 text-center mb-0 bg-white rounded-4 border">
        <i class="fa-solid fa-box-open fs-1 opacity-40 mb-2 d-block"></i>
        Chưa có nguyên liệu nào phù hợp với bộ lọc trong kho.
      </p>

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

    <!-- ═══ MODAL THÊM / SỬA NGUYÊN LIỆU & CẤU HÌNH NGƯỠNG CẢNH BÁO ═══ -->
    <div v-if="showModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-1">
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-sliders text-warning me-2"></i>
              {{ isEditing ? 'Cấu Hình Ngưỡng & Tồn Kho' : 'Thêm Nguyên Liệu Mới' }}
            </h5>
            <button @click="showModal = false" type="button" class="btn-close" :disabled="modalSaving"></button>
          </div>

          <div class="modal-body py-3">
            <form @submit.prevent="submitIngredientForm">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark mb-1">Tên nguyên liệu *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control form-control-sm rounded-3"
                  placeholder="Ví dụ: Cua Cà Mau Tươi Sống, Thịt Bò Fillet..."
                  required
                />
              </div>

              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Nhóm danh mục</label>
                  <select v-model="form.category" class="form-select form-select-sm rounded-3">
                    <option value="meat">Thịt & Hải sản</option>
                    <option value="vegetable">Rau củ quả</option>
                    <option value="drink">Nước uống & Rượu</option>
                    <option value="spice">Gia vị & Hương liệu</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">Đơn vị tính *</label>
                  <input
                    v-model="form.unit"
                    type="text"
                    class="form-control form-control-sm rounded-3"
                    placeholder="kg, con, lít, quả, chai..."
                    required
                  />
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">
                    <i class="fa-solid fa-warehouse text-danger me-1"></i>Số lượng tồn kho
                  </label>
                  <input
                    v-model.number="form.stockQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control form-control-sm rounded-3"
                    placeholder="0"
                  />
                </div>

                <div class="col-sm-6">
                  <label class="form-label small fw-semibold text-dark mb-1">
                    <i class="fa-solid fa-triangle-exclamation text-warning me-1"></i>Ngưỡng cảnh báo tối thiểu *
                  </label>
                  <input
                    v-model.number="form.minStockLevel"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control form-control-sm rounded-3 border-warning"
                    placeholder="10"
                    required
                  />
                  <small class="text-muted fs-9 d-block mt-1">Khi tồn kho ≤ ngưỡng này, hệ thống sẽ bật cảnh báo đỏ.</small>
                </div>
              </div>

              <div v-if="modalError" class="alert alert-danger small py-2 rounded-3 mb-3">
                <i class="fa-solid fa-circle-exclamation me-1"></i>{{ modalError }}
              </div>

              <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button @click="showModal = false" type="button" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="modalSaving">
                  Hủy
                </button>
                <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold btn-sm shadow-sm" :disabled="modalSaving">
                  <span v-if="modalSaving" class="spinner-border spinner-border-sm me-1.5"></span>
                  <i v-else class="fa-solid fa-floppy-disk me-1.5"></i>
                  {{ isEditing ? 'Lưu Cấu Hình' : 'Tạo Nguyên Liệu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM DELETE MODAL ═══ -->
    <ConfirmModal
      :show="showConfirmDelete"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="Xóa nguyên liệu"
      cancel-text="Hủy"
      confirm-variant="danger"
      :loading="modalSaving"
      @cancel="showConfirmDelete = false"
      @confirm="executeConfirmedDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import ConfirmModal from "../common/ConfirmModal.vue";
import { exportToCSV } from "../../utils/excelExporter";

const exportExcel = () => {
  const columns = [
    { header: "Tên Nguyên Liệu", key: "name" },
    { header: "Nhóm Danh Mục", key: (r) => categoryLabel(r.category) },
    { header: "Đơn Vị Tính", key: "unit" },
    { header: "Số Lượng Tồn", key: "stockQuantity" },
    { header: "Ngưỡng Cảnh Báo", key: "minStockLevel" },
    { header: "Trạng Thái", key: (r) => (r.stockQuantity <= r.minStockLevel ? "CẢNH BÁO SẮP HẾT" : "ĐỦ HÀNG") },
  ];
  exportToCSV(columns, ingredients.value, `Bao-Cao-Ton-Kho-${new Date().toISOString().split("T")[0]}.csv`);
  toast.success("Đã xuất file báo cáo tồn kho thành công!");
};

const ingredients = ref([]);
const loading = ref(false);
const search = ref("");
const categoryFilter = ref("");
const lowStockFilter = ref("");
const page = ref(1);
const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });
const stats = ref({ totalIngredients: 0, lowStockCount: 0, lowStockItems: [] });

// Modal State
const showModal = ref(false);
const isEditing = ref(false);
const modalSaving = ref(false);
const modalError = ref("");
const editingId = ref(null);

const form = reactive({
  name: "",
  category: "meat",
  unit: "kg",
  stockQuantity: 0,
  minStockLevel: 10,
});

// Confirm State
const showConfirmDelete = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const pendingDeleteAction = ref(null);

const fetchInventoryStats = async () => {
  try {
    const res = await api.get("/ingredients/stats");
    stats.value = res.data.data;
  } catch (err) {
    console.warn("Lỗi lấy thống kê kho:", err);
  }
};

const fetchIngredients = async () => {
  loading.value = true;
  try {
    const params = {
      search: search.value.trim(),
      category: categoryFilter.value,
      lowStock: lowStockFilter.value,
      page: page.value,
      limit: 10,
    };
    const res = await api.get("/ingredients", { params });
    ingredients.value = res.data.data.ingredients || [];
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

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  modalError.value = "";
  Object.assign(form, {
    name: "",
    category: "meat",
    unit: "kg",
    stockQuantity: 20,
    minStockLevel: 5,
  });
  showModal.value = true;
};

const openEditModal = (ing) => {
  isEditing.value = true;
  editingId.value = ing._id;
  modalError.value = "";
  Object.assign(form, {
    name: ing.name || "",
    category: ing.category || "meat",
    unit: ing.unit || "kg",
    stockQuantity: ing.stockQuantity || 0,
    minStockLevel: ing.minStockLevel || 5,
  });
  showModal.value = true;
};

const submitIngredientForm = async () => {
  modalError.value = "";
  modalSaving.value = true;
  try {
    if (isEditing.value) {
      await api.patch(`/ingredients/${editingId.value}`, form);
      toast.success("Cấu hình tồn kho & ngưỡng cảnh báo thành công!");
    } else {
      await api.post("/ingredients", form);
      toast.success("Thêm nguyên liệu mới thành công!");
    }
    showModal.value = false;
    await Promise.all([fetchInventoryStats(), fetchIngredients()]);
  } catch (err) {
    modalError.value = err.response?.data?.message || "Lỗi lưu nguyên liệu";
  } finally {
    modalSaving.value = false;
  }
};

const confirmDeleteIngredient = (ing) => {
  confirmTitle.value = "Xác nhận xóa nguyên liệu";
  confirmMessage.value = `Bạn có chắc chắn muốn xóa nguyên liệu '${ing.name}' khỏi kho?`;
  pendingDeleteAction.value = async () => {
    try {
      await api.delete(`/ingredients/${ing._id}`);
      toast.success("Đã xóa nguyên liệu");
      await Promise.all([fetchInventoryStats(), fetchIngredients()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi xóa nguyên liệu");
    }
  };
  showConfirmDelete.value = true;
};

const executeConfirmedDelete = async () => {
  if (pendingDeleteAction.value) {
    modalSaving.value = true;
    try {
      await pendingDeleteAction.value();
    } finally {
      modalSaving.value = false;
      pendingDeleteAction.value = null;
      showConfirmDelete.value = false;
    }
  }
};

const categoryLabel = (cat) => {
  const map = {
    meat: "Thịt & Hải sản",
    vegetable: "Rau củ quả",
    drink: "Nước uống & Rượu",
    spice: "Gia vị & Hương liệu",
    other: "Khác",
  };
  return map[cat] || cat || "Khác";
};

onMounted(() => {
  fetchInventoryStats();
  fetchIngredients();
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.table-danger-subtle {
  background-color: #fff5f5 !important;
}
</style>
