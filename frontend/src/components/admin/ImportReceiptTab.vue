<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h5 class="fw-bold brand-font mb-0"><i class="fa-solid fa-truck-ramp-box text-danger me-2"></i>Phiếu Nhập Kho</h5>
      <button @click="showForm = !showForm" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
        <i class="fa-solid fa-plus me-1"></i> {{ showForm ? 'Đóng' : 'Tạo Phiếu Nhập' }}
      </button>
    </div>

    <!-- Form tạo phiếu nhập -->
    <div v-if="showForm" class="glass-card p-4 rounded-4 bg-white mb-4">
      <h6 class="fw-bold text-dark mb-3">Tạo Phiếu Nhập Kho Mới</h6>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Nhà cung cấp (tùy chọn)</label>
          <select v-model="form.supplier" class="form-select">
            <option value="">— Không có nhà cung cấp —</option>
            <option v-for="s in suppliers" :key="s._id" :value="s._id">{{ s.name }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Ghi chú</label>
          <input v-model="form.notes" type="text" class="form-control" placeholder="Ví dụ: Nhập hàng đầu tuần" />
        </div>
      </div>

      <label class="form-label small fw-semibold">Danh sách nguyên liệu nhập</label>
      <div v-for="(row, idx) in form.items" :key="idx" class="row g-2 mb-2">
        <div class="col-md-4">
          <select v-model="row.ingredient" class="form-select form-select-sm">
            <option value="" disabled>— Chọn nguyên liệu —</option>
            <option v-for="ing in ingredients" :key="ing._id" :value="ing._id">{{ ing.name }} ({{ ing.unit }})</option>
          </select>
        </div>
        <div class="col-md-3">
          <input v-model.number="row.quantity" type="number" step="0.01" min="0.01" class="form-control form-control-sm" placeholder="Số lượng" />
        </div>
        <div class="col-md-3">
          <input v-model.number="row.importPrice" type="number" min="0" class="form-control form-control-sm" placeholder="Giá nhập (đ)" />
        </div>
        <div class="col-md-2">
          <button @click="removeRow(idx)" class="btn btn-outline-danger btn-sm rounded-circle w-100" title="Xóa">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
      <button @click="addRow" class="btn btn-outline-danger btn-sm rounded-pill mb-3">
        <i class="fa-solid fa-plus me-1"></i> Thêm Dòng
      </button>

      <div v-if="form.items.length > 0" class="mb-3 p-2 bg-light rounded-3 d-flex justify-content-between small">
        <span class="text-muted">Tổng tiền dự kiến:</span>
        <strong class="text-danger">{{ totalAmount.toLocaleString('vi-VN') }}đ</strong>
      </div>

      <div class="d-flex gap-2">
        <button @click="submitReceipt" :disabled="saving" class="btn btn-primary-crab px-4 fw-bold">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fa-solid fa-floppy-disk me-1"></i> Nhập Kho
        </button>
        <button @click="showForm = false" class="btn btn-light rounded-pill px-4">Hủy</button>
      </div>
    </div>

    <!-- Danh sách phiếu nhập -->
    <div v-if="loading" class="text-center py-4"><div class="spinner-border text-danger"></div></div>
    <div v-else-if="receipts.length === 0" class="text-center text-muted py-4">
      <i class="fa-solid fa-box-open fs-2 d-block mb-2 opacity-50"></i>
      Chưa có phiếu nhập kho nào
    </div>
    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr class="text-muted small">
            <th>Mã phiếu</th>
            <th>Nhà cung cấp</th>
            <th>Nguyên liệu</th>
            <th>Tổng tiền</th>
            <th>Ngày nhập</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in receipts" :key="r._id">
            <td><strong class="text-danger">{{ r.receiptCode }}</strong></td>
            <td><small>{{ r.supplier?.name || '—' }}</small></td>
            <td>
              <span v-for="(it, i) in r.items" :key="i" class="badge bg-light text-dark border me-1 mb-1">
                {{ it.ingredient?.name }}: {{ it.quantity }}
              </span>
            </td>
            <td><strong>{{ r.totalAmount.toLocaleString('vi-VN') }}đ</strong></td>
            <td><small>{{ new Date(r.createdAt).toLocaleDateString('vi-VN') }}</small></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const receipts = ref([]);
const ingredients = ref([]);
const suppliers = ref([]);
const showForm = ref(false);
const saving = ref(false);
const loading = ref(false);

const form = reactive({
  supplier: "",
  notes: "",
  items: [],
});

const totalAmount = computed(() =>
  form.items.reduce((sum, r) => sum + (r.quantity || 0) * (r.importPrice || 0), 0),
);

const addRow = () => {
  form.items.push({ ingredient: "", quantity: 1, importPrice: 0 });
};

const removeRow = (idx) => {
  form.items.splice(idx, 1);
};

const fetchReceipts = async () => {
  loading.value = true;
  try {
    const res = await api.get("/import-receipts");
    receipts.value = res.data.data.importReceipts;
  } catch (err) {
    toast.error("Lỗi lấy danh sách phiếu nhập");
  } finally {
    loading.value = false;
  }
};

const fetchIngredients = async () => {
  try {
    const res = await api.get("/ingredients", { params: { limit: 100 } });
    ingredients.value = res.data.data.ingredients;
  } catch (err) {
    console.error("Lỗi lấy nguyên liệu:", err);
  }
};

const fetchSuppliers = async () => {
  try {
    const res = await api.get("/suppliers", { params: { limit: 100 } });
    suppliers.value = res.data.data.suppliers;
  } catch (err) {
    console.error("Lỗi lấy nhà cung cấp:", err);
  }
};

const submitReceipt = async () => {
  const valid = form.items.filter((r) => r.ingredient && r.quantity > 0 && r.importPrice !== undefined);
  if (valid.length === 0) {
    toast.error("Vui lòng thêm ít nhất 1 dòng nguyên liệu hợp lệ");
    return;
  }
  saving.value = true;
  try {
    await api.post("/import-receipts", {
      supplier: form.supplier || null,
      notes: form.notes,
      items: valid.map((r) => ({ ingredient: r.ingredient, quantity: r.quantity, importPrice: r.importPrice })),
    });
    toast.success("Nhập kho thành công! Đã cập nhật tồn kho.");
    showForm.value = false;
    form.supplier = "";
    form.notes = "";
    form.items = [];
    await fetchReceipts();
  } catch (err) {
    toast.error(err.response?.data?.message || "Nhập kho thất bại!");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchReceipts();
  fetchIngredients();
  fetchSuppliers();
});
</script>
