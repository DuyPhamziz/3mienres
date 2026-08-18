<template>
  <div class="import-receipt-tab">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h5 class="fw-bold brand-font text-dark mb-0">
          <i class="fa-solid fa-truck-ramp-box text-danger me-2"></i>Phiếu Nhập Kho Số Lượng Lớn
        </h5>
        <small class="text-muted">Nhập nguyên liệu từ nhà cung cấp, tự động cập nhật tồn kho và hỗ trợ thêm sản phẩm mới</small>
      </div>

      <div class="d-flex gap-2">
        <button @click="showForm = !showForm" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm">
          <i :class="showForm ? 'fa-solid fa-xmark me-1' : 'fa-solid fa-plus me-1'"></i>
          {{ showForm ? 'Đóng Form' : 'Tạo Phiếu Nhập Mới' }}
        </button>
        <button @click="fetchReceipts" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Form tạo phiếu nhập -->
    <div v-if="showForm" class="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4 border-start border-4 border-danger">
      <h6 class="fw-bold text-dark mb-3">Lập Phiếu Nhập Kho Mới</h6>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold text-dark mb-1">Nhà cung cấp (Đối tác)</label>
          <select v-model="form.supplier" class="form-select form-select-sm rounded-3">
            <option value="">— Nhập vãng lai / Chợ đầu mối (Không qua NCC) —</option>
            <option v-for="s in suppliers" :key="s._id" :value="s._id">
              {{ s.name }} ({{ s.supplierCode || 'NCC' }} - {{ s.phone }})
            </option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold text-dark mb-1">Ghi chú phiếu nhập</label>
          <input v-model="form.notes" type="text" class="form-control form-control-sm rounded-3" placeholder="Ví dụ: Nhập hải sản tươi chuẩn bị đại tiệc cuối tuần" />
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="form-label small fw-semibold text-dark mb-0">Danh sách nguyên liệu nhập vào kho</label>
        <div class="d-flex gap-2">
          <button @click="addRow(false)" type="button" class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1">
            <i class="fa-solid fa-plus me-1"></i> Thêm Nguyên Liệu Có Sẵn
          </button>
          <button @click="addRow(true)" type="button" class="btn btn-outline-success btn-sm rounded-pill px-3 py-1">
            <i class="fa-solid fa-sparkles me-1"></i> + Nhập Sản Phẩm / Món Mới
          </button>
        </div>
      </div>

      <div class="table-responsive rounded-4 border mb-3">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 280px;">Nguyên Liệu</th>
              <th style="width: 120px;">Đơn Vị</th>
              <th style="width: 140px;">Số Lượng Nhập</th>
              <th style="width: 160px;">Giá Nhập (đ / Đơn vị)</th>
              <th style="width: 150px;">Thành Tiền</th>
              <th style="width: 60px;" class="text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in form.items" :key="idx">
              <td>
                <!-- Nếu là dòng nguyên liệu có sẵn -->
                <div v-if="!row.isNew">
                  <select v-model="row.ingredient" @change="onSelectIngredient(row)" class="form-select form-select-sm rounded-3">
                    <option value="" disabled>— Chọn nguyên liệu trong kho —</option>
                    <option v-for="ing in ingredients" :key="ing._id" :value="ing._id">
                      {{ ing.name }} (Hiện tồn: {{ ing.stockQuantity }} {{ ing.unit }})
                    </option>
                  </select>
                </div>
                <!-- Nếu là dòng nguyên liệu MỚI -->
                <div v-else>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-success bg-opacity-10 text-success border-success fs-9">MỚI</span>
                    <input
                      v-model="row.newIngredientName"
                      type="text"
                      class="form-control form-control-sm border-success rounded-end-3"
                      placeholder="Tên nguyên liệu mới..."
                    />
                  </div>
                </div>
              </td>

              <td>
                <span v-if="!row.isNew" class="badge bg-light text-dark border px-2 py-1 fs-9">{{ row.unit || 'kg' }}</span>
                <input
                  v-else
                  v-model="row.unit"
                  type="text"
                  class="form-control form-control-sm rounded-3 text-center"
                  placeholder="kg, con..."
                />
              </td>

              <td>
                <input
                  v-model.number="row.quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-control form-control-sm rounded-3 fw-bold text-primary"
                  placeholder="0"
                />
              </td>

              <td>
                <input
                  v-model.number="row.importPrice"
                  type="number"
                  step="1000"
                  min="0"
                  class="form-control form-control-sm rounded-3 text-end"
                  placeholder="0"
                />
              </td>

              <td>
                <strong class="text-danger fs-8">
                  {{ ((row.quantity || 0) * (row.importPrice || 0)).toLocaleString('vi-VN') }}đ
                </strong>
              </td>

              <td class="text-center">
                <button @click="removeRow(idx)" class="btn btn-light btn-sm rounded-circle text-danger" title="Xóa dòng này">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="form.items.length > 0" class="p-3 bg-light rounded-4 d-flex justify-content-between align-items-center mb-3">
        <span class="text-secondary small">Tổng số mặt hàng: <strong>{{ form.items.length }}</strong></span>
        <div>
          <span class="text-muted small me-2">Tổng Tiền Hóa Đơn Nhập:</span>
          <h5 class="fw-bold text-danger d-inline-block mb-0">{{ totalAmount.toLocaleString('vi-VN') }}đ</h5>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 pt-2 border-top">
        <button @click="showForm = false" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="saving">
          Hủy
        </button>
        <button @click="submitReceipt" :disabled="saving" class="btn btn-danger rounded-pill px-4 fw-bold btn-sm shadow-sm">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1.5"></span>
          <i v-else class="fa-solid fa-floppy-disk me-1.5"></i>
          Xác Nhận Nhập Kho & Tăng Tồn Kho
        </button>
      </div>
    </div>

    <!-- Danh sách phiếu nhập -->
    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-danger"></div></div>
    <div v-else-if="receipts.length === 0" class="text-center text-muted py-5 bg-white rounded-4 shadow-2xs">
      <i class="fa-solid fa-box-open fs-1 d-block mb-2 opacity-40"></i>
      Chưa có phiếu nhập kho nào
    </div>
    <div v-else class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
          <thead class="bg-light text-secondary">
            <tr>
              <th style="width: 140px;">Mã Phiếu</th>
              <th style="width: 220px;">Nhà Cung Cấp</th>
              <th>Nguyên Liệu Đã Nhập</th>
              <th style="width: 150px;">Tổng Tiền</th>
              <th style="width: 140px;">Ngày Nhập</th>
              <th style="width: 130px;">Người Lập</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in receipts" :key="r._id">
              <td>
                <strong class="text-danger">{{ r.receiptCode }}</strong>
              </td>

              <td>
                <strong class="d-block text-dark">{{ r.supplier?.name || 'Vãng lai / Chợ đầu mối' }}</strong>
                <small class="text-muted fs-9" v-if="r.supplier?.phone">{{ r.supplier?.phone }}</small>
              </td>

              <td>
                <div class="d-flex flex-wrap gap-1">
                  <span v-for="(it, i) in r.items" :key="i" class="badge bg-light text-dark border rounded-pill px-2 py-1 fs-9">
                    {{ it.ingredient?.name }}: <strong>{{ it.quantity }} {{ it.ingredient?.unit }}</strong>
                  </span>
                </div>
              </td>

              <td>
                <strong class="text-danger fs-8">{{ r.totalAmount.toLocaleString('vi-VN') }}đ</strong>
              </td>

              <td>
                <span class="text-secondary d-block">{{ new Date(r.createdAt).toLocaleDateString('vi-VN') }}</span>
                <small class="text-muted fs-9">{{ new Date(r.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</small>
              </td>

              <td>
                <span class="badge bg-light text-dark border rounded-pill px-2 py-0.5 fs-9">
                  {{ r.importedBy?.name || 'Thủ kho' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

const addRow = (isNew = false) => {
  form.items.push({
    isNew,
    ingredient: "",
    newIngredientName: "",
    unit: "kg",
    quantity: 10,
    importPrice: 50000,
  });
};

const onSelectIngredient = (row) => {
  const selected = ingredients.value.find((ing) => ing._id === row.ingredient);
  if (selected) {
    row.unit = selected.unit;
  }
};

const removeRow = (idx) => {
  form.items.splice(idx, 1);
};

const fetchReceipts = async () => {
  loading.value = true;
  try {
    const res = await api.get("/import-receipts");
    receipts.value = res.data.data.importReceipts || [];
  } catch (err) {
    toast.error("Lỗi lấy danh sách phiếu nhập");
  } finally {
    loading.value = false;
  }
};

const fetchIngredients = async () => {
  try {
    const res = await api.get("/ingredients", { params: { limit: 100 } });
    ingredients.value = res.data.data.ingredients || [];
  } catch (err) {
    console.error("Lỗi lấy nguyên liệu:", err);
  }
};

const fetchSuppliers = async () => {
  try {
    const res = await api.get("/suppliers", { params: { limit: 100 } });
    suppliers.value = res.data.data.suppliers || [];
  } catch (err) {
    console.error("Lỗi lấy nhà cung cấp:", err);
  }
};

const submitReceipt = async () => {
  const valid = form.items.filter((r) =>
    (r.ingredient || (r.isNew && r.newIngredientName)) && r.quantity > 0 && r.importPrice >= 0,
  );

  if (valid.length === 0) {
    toast.error("Vui lòng thêm ít nhất 1 dòng nguyên liệu hợp lệ");
    return;
  }

  saving.value = true;
  try {
    await api.post("/import-receipts", {
      supplier: form.supplier || null,
      notes: form.notes,
      items: valid.map((r) => ({
        ingredient: r.isNew ? undefined : r.ingredient,
        isNewIngredient: r.isNew,
        newIngredientName: r.newIngredientName,
        unit: r.unit,
        quantity: r.quantity,
        importPrice: r.importPrice,
      })),
    });
    toast.success("Nhập kho thành công! Đã cập nhật số lượng tồn kho.");
    showForm.value = false;
    form.supplier = "";
    form.notes = "";
    form.items = [];
    await Promise.all([fetchReceipts(), fetchIngredients()]);
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

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
