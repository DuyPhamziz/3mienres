<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1"><i class="fa-solid fa-gear text-danger me-2"></i>Cài Đặt Nhà Hàng</h2>
        <p class="text-muted small mb-0">Cấu hình thông tin nhà hàng, tài khoản ngân hàng, quy định đặt bàn và chính sách hoàn cọc</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else class="row g-4">
      <!-- Thông tin nhà hàng -->
      <div class="col-lg-6">
        <div class="glass-card p-4 rounded-4 bg-white h-100">
          <h5 class="fw-bold brand-font mb-3"><i class="fa-solid fa-store me-2 text-danger"></i>Thông Tin Nhà Hàng</h5>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Tên nhà hàng</label>
            <input v-model="form.restaurantName" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Hotline</label>
            <input v-model="form.hotline" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Địa chỉ</label>
            <input v-model="form.address" type="text" class="form-control" />
          </div>
        </div>
      </div>

      <!-- Tài khoản ngân hàng -->
      <div class="col-lg-6">
        <div class="glass-card p-4 rounded-4 bg-white h-100">
          <h5 class="fw-bold brand-font mb-3"><i class="fa-solid fa-building-columns me-2 text-danger"></i>Tài Khoản Ngân Hàng (VietQR)</h5>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Mã ngân hàng</label>
              <input v-model="form.bankAccount.bankId" type="text" class="form-control" placeholder="MB, VCB..." />
            </div>
            <div class="col-md-8">
              <label class="form-label small fw-semibold">Số tài khoản</label>
              <input v-model="form.bankAccount.accountNo" type="text" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label small fw-semibold">Tên chủ tài khoản</label>
              <input v-model="form.bankAccount.accountName" type="text" class="form-control" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quy định đặt bàn -->
      <div class="col-lg-6">
        <div class="glass-card p-4 rounded-4 bg-white h-100">
          <h5 class="fw-bold brand-font mb-3"><i class="fa-solid fa-calendar-days me-2 text-danger"></i>Quy Định Đặt Bàn</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Thời lượng mặc định (phút)</label>
              <input v-model.number="form.reservation.defaultDurationMinutes" type="number" min="30" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Thời gian giữ bàn quá giờ (phút)</label>
              <input v-model.number="form.reservation.gracePeriodMinutes" type="number" min="0" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Đặt trước tối đa (ngày)</label>
              <input v-model.number="form.reservation.maxAdvanceDays" type="number" min="1" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Tiền cọc mặc định (đ)</label>
              <input v-model.number="form.reservation.defaultDepositAmount" type="number" min="0" class="form-control" />
            </div>
          </div>
        </div>
      </div>

      <!-- Chính sách hoàn cọc + bàn -->
      <div class="col-lg-6">
        <div class="glass-card p-4 rounded-4 bg-white h-100">
          <h5 class="fw-bold brand-font mb-3"><i class="fa-solid fa-money-bill-transfer me-2 text-danger"></i>Chính Sách Hoàn Cọc</h5>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Hoàn 100% trước (giờ)</label>
              <input v-model.number="form.refund.fullRefundHours" type="number" min="0" class="form-control" />
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Hoàn % trước (giờ)</label>
              <input v-model.number="form.refund.partialRefundHours" type="number" min="0" class="form-control" />
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">% hoàn (mức partial)</label>
              <input v-model.number="form.refund.partialRefundPercent" type="number" min="0" max="100" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Sức chứa tối đa 1 bàn</label>
              <input v-model.number="form.table.maxSingleTableCapacity" type="number" min="1" max="20" class="form-control" />
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div class="form-check form-switch">
                <input v-model="form.table.allowCombination" type="checkbox" class="form-check-input" id="allowCombine" />
                <label class="form-check-label small fw-semibold" for="allowCombine">Cho phép ghép bàn</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 text-end">
      <button @click="saveSettings" :disabled="saving" class="btn btn-primary-crab px-5 py-3 fw-bold">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="fa-solid fa-floppy-disk me-2"></i> Lưu Cài Đặt
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const loading = ref(false);
const saving = ref(false);

const form = reactive({
  restaurantName: "",
  hotline: "",
  address: "",
  bankAccount: { bankId: "MB", accountNo: "", accountName: "" },
  reservation: { defaultDurationMinutes: 120, gracePeriodMinutes: 15, maxAdvanceDays: 30, defaultDepositAmount: 100000 },
  refund: { fullRefundHours: 24, partialRefundHours: 2, partialRefundPercent: 50 },
  table: { maxSingleTableCapacity: 20, allowCombination: true },
});

const loadSettings = async () => {
  loading.value = true;
  try {
    const res = await api.get("/settings");
    const s = res.data.data.settings;
    if (s) {
      form.restaurantName = s.restaurantName || "";
      form.hotline = s.hotline || "";
      form.address = s.address || "";
      form.bankAccount = { ...form.bankAccount, ...(s.bankAccount || {}) };
      form.reservation = { ...form.reservation, ...(s.reservation || {}) };
      form.refund = { ...form.refund, ...(s.refund || {}) };
      form.table = { ...form.table, ...(s.table || {}) };
    }
  } catch (err) {
    toast.error("Không tải được cài đặt nhà hàng");
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await api.patch("/settings", form);
    toast.success("Cập nhật cài đặt nhà hàng thành công!");
  } catch (err) {
    toast.error(err.response?.data?.message || "Lưu cài đặt thất bại!");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
