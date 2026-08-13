<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1"><i class="fa-solid fa-tags text-danger me-2"></i>Quản Lý Mã Giảm Giá</h2>
        <p class="text-muted small mb-0">Tạo và quản lý voucher khuyến mãi áp dụng khi thanh toán hóa đơn</p>
      </div>
      <button @click="showForm = !showForm" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
        <i class="fa-solid fa-plus me-1"></i> Tạo Voucher
      </button>
    </div>

    <!-- Form tạo voucher -->
    <div v-if="showForm" class="glass-card p-4 rounded-4 bg-white mb-4">
      <h5 class="fw-bold brand-font mb-3">Tạo Voucher Mới</h5>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label small fw-semibold">Mã voucher</label>
          <input v-model="form.code" type="text" class="form-control text-uppercase" placeholder="GIAM10" />
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-semibold">Tiêu đề</label>
          <input v-model="form.title" type="text" class="form-control" placeholder="Giảm 10% đơn" />
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-semibold">Loại</label>
          <select v-model="form.type" class="form-select">
            <option value="PERCENT">Giảm theo %</option>
            <option value="FIXED">Giảm số tiền cố định</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold">Giá trị ({{ form.type === 'PERCENT' ? '%' : 'đ' }})</label>
          <input v-model.number="form.value" type="number" min="0" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold">Đơn tối thiểu (đ)</label>
          <input v-model.number="form.minOrderValue" type="number" min="0" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold">Giảm tối đa (đ, 0 = không)</label>
          <input v-model.number="form.maxDiscount" type="number" min="0" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold">Ngày hết hạn</label>
          <input v-model="form.endDate" type="date" class="form-control" />
        </div>
      </div>
      <button @click="submitVoucher" :disabled="saving" class="btn btn-primary-crab mt-3 px-4 fw-bold">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="fa-solid fa-floppy-disk me-1"></i> Lưu Voucher
      </button>
    </div>

    <!-- Danh sách voucher -->
    <div class="glass-card p-4 rounded-4 bg-white">
      <div v-if="vouchers.length === 0" class="text-center text-muted py-4">
        <i class="fa-solid fa-ticket fs-2 d-block mb-2 opacity-50"></i>
        Chưa có voucher nào
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Mã</th>
              <th>Tiêu đề</th>
              <th>Giảm giá</th>
              <th>Hạn dùng</th>
              <th>Đã dùng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vouchers" :key="v._id">
              <td><strong class="text-danger">{{ v.code }}</strong></td>
              <td>{{ v.title }}</td>
              <td>
                {{ v.type === 'PERCENT' ? `${v.value}%` : `${v.value.toLocaleString('vi-VN')}đ` }}
                <small v-if="v.minOrderValue > 0" class="text-muted d-block">đơn ≥ {{ v.minOrderValue.toLocaleString('vi-VN') }}đ</small>
              </td>
              <td><small>{{ new Date(v.endDate).toLocaleDateString('vi-VN') }}</small></td>
              <td><span class="badge bg-secondary">{{ v.usedCount }}/{{ v.usageLimit || '∞' }}</span></td>
              <td>
                <span :class="['badge rounded-pill', v.isActive ? 'bg-success' : 'bg-danger']">
                  {{ v.isActive ? 'Đang hoạt động' : 'Đã tắt' }}
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
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const vouchers = ref([]);
const showForm = ref(false);
const saving = ref(false);

const form = reactive({
  code: "",
  title: "",
  type: "PERCENT",
  value: 10,
  minOrderValue: 0,
  maxDiscount: 0,
  endDate: "",
});

const fetchVouchers = async () => {
  try {
    const res = await api.get("/vouchers");
    vouchers.value = res.data.data.vouchers;
  } catch (err) {
    toast.error("Lỗi lấy danh sách voucher");
  }
};

const submitVoucher = async () => {
  saving.value = true;
  try {
    await api.post("/vouchers", form);
    toast.success("Tạo voucher thành công!");
    showForm.value = false;
    Object.assign(form, { code: "", title: "", type: "PERCENT", value: 10, minOrderValue: 0, maxDiscount: 0, endDate: "" });
    await fetchVouchers();
  } catch (err) {
    toast.error(err.response?.data?.message || "Tạo voucher thất bại!");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchVouchers();
});
</script>
