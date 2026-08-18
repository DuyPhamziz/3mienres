<template>
  <div class="stock-audit-tab">
    <!-- ═══ 1. SUB-NAV / VIEW SWITCHER ═══ -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div class="btn-group rounded-pill p-1 bg-light border">
        <button
          @click="currentView = 'audit'"
          :class="['btn btn-sm rounded-pill px-3 fw-bold', currentView === 'audit' ? 'btn-danger shadow-2xs' : 'btn-light border-0 text-secondary']"
        >
          <i class="fa-solid fa-clipboard-check me-1.5"></i>Phiếu Kiểm Kê Thực Tế
        </button>
        <button
          @click="currentView = 'consumption'"
          :class="['btn btn-sm rounded-pill px-3 fw-bold', currentView === 'consumption' ? 'btn-danger shadow-2xs' : 'btn-light border-0 text-secondary']"
        >
          <i class="fa-solid fa-chart-pie me-1.5"></i>Tổng Kết Tiêu Thụ Định Kỳ
        </button>
        <button
          @click="currentView = 'history'"
          :class="['btn btn-sm rounded-pill px-3 fw-bold', currentView === 'history' ? 'btn-danger shadow-2xs' : 'btn-light border-0 text-secondary']"
        >
          <i class="fa-solid fa-clock-rotate-left me-1.5"></i>Lịch Sử Kiểm Kê
        </button>
      </div>

      <div class="d-flex gap-2">
        <button
          v-if="currentView === 'audit' && !isAuditing"
          @click="startNewAudit"
          class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm"
        >
          <i class="fa-solid fa-plus me-1"></i> Bắt Đầu Đợt Kiểm Kê Mới
        </button>
        <button
          v-if="isAuditing"
          @click="isAuditing = false"
          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
        >
          <i class="fa-solid fa-xmark me-1"></i> Đóng Khung Kiểm Kê
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         VIEW 1: PHIẾU KIỂM KÊ KHO THỰC TẾ & CÂN BẰNG TỒN KHO
    ════════════════════════════════════════════════════════════════════ -->
    <div v-if="currentView === 'audit'">
      <!-- Form Kiểm kê đang thực hiện -->
      <div v-if="isAuditing" class="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4 border-start border-4 border-danger">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 class="fw-bold brand-font text-dark mb-0">
              <i class="fa-solid fa-clipboard-list text-danger me-2"></i>Đợt Kiểm Kê Kho Thực Tế
            </h5>
            <small class="text-muted">Nhập số lượng đếm thực tế tại bếp/kho ngoài đời thực để hệ thống tự động so sánh và cân bằng tồn kho.</small>
          </div>

          <div class="d-flex align-items-center gap-2">
            <label class="small fw-semibold text-secondary mb-0">Kỳ kiểm kê:</label>
            <select v-model="auditForm.auditType" class="form-select form-select-sm rounded-3" style="width: 170px;">
              <option value="DAILY">Hằng Ngày</option>
              <option value="WEEKLY">Cuối Tuần (Weekly)</option>
              <option value="MONTHLY">Cuối Tháng (Monthly)</option>
              <option value="ADHOC">Đột Xuất</option>
            </select>
          </div>
        </div>

        <!-- Bảng danh sách nguyên liệu để đếm -->
        <div class="table-responsive rounded-4 border mb-3">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
            <thead class="bg-light text-secondary">
              <tr>
                <th style="width: 220px;">Tên Nguyên Liệu</th>
                <th style="width: 130px;">Tồn Hệ Thống</th>
                <th style="width: 170px;">Số Đếm Thực Tế *</th>
                <th style="width: 140px;" class="text-center">Chênh Lệch</th>
                <th>Lý Do Hao Hụt / Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in auditForm.items" :key="item.ingredient">
                <td>
                  <strong class="text-dark d-block">{{ item.name }}</strong>
                  <span class="badge bg-light text-secondary border fs-9 px-1.5">{{ item.unit }}</span>
                </td>

                <td>
                  <span class="badge bg-light text-dark border px-2.5 py-1 fs-8 fw-bold">
                    {{ item.systemStock }} {{ item.unit }}
                  </span>
                </td>

                <td>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="item.actualCount"
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-control fw-bold text-primary"
                      placeholder="0"
                    />
                    <span class="input-group-text bg-light fs-9 text-muted">{{ item.unit }}</span>
                  </div>
                </td>

                <td class="text-center">
                  <span
                    :class="[
                      'badge rounded-pill px-2.5 py-1 fs-9 fw-bold',
                      calcVariance(item) === 0 ? 'bg-success bg-opacity-15 text-success' :
                      calcVariance(item) < 0 ? 'bg-danger text-white' : 'bg-warning text-dark'
                    ]"
                  >
                    {{ calcVariance(item) > 0 ? '+' : '' }}{{ calcVariance(item) }} {{ item.unit }}
                  </span>
                </td>

                <td>
                  <select v-model="item.reason" class="form-select form-select-sm rounded-3">
                    <option value="Khớp hoàn toàn">✅ Khớp hoàn toàn</option>
                    <option value="Hao hụt tự nhiên khi sơ chế">🔪 Hao hụt sơ chế & làm sạch</option>
                    <option value="Rã đông mất nước">❄️ Rã đông mất nước</option>
                    <option value="Chế biến nấu thử món mới">🍳 Nấu thử món mới / đào tạo</option>
                    <option value="Đổ vỡ / Hư hỏng / Hết hạn">❌ Đổ vỡ / Hư hỏng / Loại bỏ</option>
                    <option value="Nhập bổ sung chưa vào phiếu">📦 Nhập thêm ngoài chưa vào phiếu</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-semibold text-dark mb-1">Ghi chú đợt kiểm kê</label>
          <input
            v-model="auditForm.notes"
            type="text"
            class="form-control form-control-sm rounded-3"
            placeholder="Ví dụ: Kiểm kê định kỳ tổng kết tuần 3 tháng 8"
          />
        </div>

        <!-- Buttons hành động -->
        <div class="d-flex justify-content-between align-items-center pt-3 border-top flex-wrap gap-2">
          <button @click="isAuditing = false" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="saving">
            Hủy Bỏ
          </button>

          <div class="d-flex gap-2">
            <button
              @click="submitAudit(false)"
              :disabled="saving"
              class="btn btn-outline-secondary rounded-pill px-4 btn-sm fw-semibold"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fa-solid fa-floppy-disk me-1"></i> Lưu Bản Nháp
            </button>
            <button
              @click="confirmApplyAudit"
              :disabled="saving"
              class="btn btn-danger rounded-pill px-4 btn-sm fw-bold shadow-sm"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fa-solid fa-scale-balanced me-1"></i> Cân Bằng Tồn Kho Theo Thực Tế
            </button>
          </div>
        </div>
      </div>

      <!-- Khi chưa bấm bắt đầu đợt kiểm kê -->
      <div v-else class="card border-0 rounded-4 shadow-2xs p-5 text-center bg-white">
        <div class="p-3 rounded-circle bg-danger bg-opacity-10 text-danger d-inline-block mx-auto mb-3">
          <i class="fa-solid fa-clipboard-check display-5"></i>
        </div>
        <h5 class="fw-bold brand-font text-dark mb-2">Sẵn Sàng Cho Kỳ Kiểm Kê Kho Mới?</h5>
        <p class="text-secondary small mx-auto mb-4" style="max-width: 520px;">
          Hệ thống sẽ lấy số liệu tồn kho hiện tại làm mốc chuẩn. Bạn chỉ cần kiểm đếm nguyên liệu thực tế bên ngoài (cân đo đong đếm) và nhập vào để hệ thống tính toán lượng tiêu thụ & hao hụt tự động.
        </p>
        <div>
          <button @click="startNewAudit" class="btn btn-danger rounded-pill px-4 py-2 fw-bold shadow-sm">
            <i class="fa-solid fa-play me-1.5"></i> Bắt Đầu Đếm & Kiểm Kê Ngay
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         VIEW 2: TỔNG KẾT TIÊU THỤ ĐỊNH KỲ (HÔM NAY / TUẦN / THÁNG)
    ════════════════════════════════════════════════════════════════════ -->
    <div v-else-if="currentView === 'consumption'">
      <!-- Bộ lọc thời gian -->
      <div class="card border-0 rounded-4 shadow-2xs p-3 bg-white mb-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="small fw-semibold text-secondary">Khoảng thời gian:</span>
            <div class="btn-group btn-group-sm">
              <button
                @click="changePeriod('today')"
                :class="['btn rounded-pill px-3', period === 'today' ? 'btn-danger' : 'btn-outline-secondary']"
              >
                Hôm Nay
              </button>
              <button
                @click="changePeriod('week')"
                :class="['btn rounded-pill px-3 ms-1', period === 'week' ? 'btn-danger' : 'btn-outline-secondary']"
              >
                Tuần Này (Cuối tuần)
              </button>
              <button
                @click="changePeriod('month')"
                :class="['btn rounded-pill px-3 ms-1', period === 'month' ? 'btn-danger' : 'btn-outline-secondary']"
              >
                Tháng Này (Cuối tháng)
              </button>
            </div>
          </div>

          <button @click="fetchConsumptionReport" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <i class="fa-solid fa-rotate me-1" :class="{ 'fa-spin': reportLoading }"></i> Tải lại báo cáo
          </button>
        </div>
      </div>

      <!-- Bảng báo cáo tiêu thụ -->
      <div class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden">
        <div v-if="reportLoading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status"></div>
        </div>

        <div v-else-if="consumptionList.length === 0" class="text-center py-5 text-muted">
          <i class="fa-solid fa-chart-simple fs-1 opacity-40 mb-2 d-block"></i>
          Chưa có dữ liệu tiêu thụ nguyên liệu trong kỳ này.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
            <thead class="bg-light text-secondary">
              <tr>
                <th style="width: 240px;">Nguyên Liệu</th>
                <th style="width: 140px;">Nhóm Danh Mục</th>
                <th style="width: 150px;">Tổng Đã Nhập Về</th>
                <th style="width: 160px;">Đã Đem Đi Nấu (Order)</th>
                <th style="width: 150px;">Tồn Kho Hiện Tại</th>
                <th style="width: 130px;" class="text-center">Đánh Giá Tiêu Thụ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in consumptionList" :key="item._id">
                <td>
                  <strong class="text-dark d-block">{{ item.name }}</strong>
                  <span class="badge bg-light text-muted border fs-9">{{ item.unit }}</span>
                </td>

                <td>
                  <span class="badge bg-light text-dark border rounded-pill px-2.5 py-1 fs-9">
                    {{ item.category }}
                  </span>
                </td>

                <td>
                  <strong class="text-primary">{{ item.totalImported }} {{ item.unit }}</strong>
                </td>

                <td>
                  <strong class="text-danger fs-8">{{ item.totalCooked }} {{ item.unit }}</strong>
                </td>

                <td>
                  <strong class="text-success">{{ item.currentStock }} {{ item.unit }}</strong>
                </td>

                <td class="text-center">
                  <span
                    v-if="item.totalCooked > 0"
                    class="badge bg-danger bg-opacity-15 text-danger rounded-pill px-2.5 py-1 fs-9 fw-bold"
                  >
                    🔥 Đang tiêu thụ mạnh
                  </span>
                  <span
                    v-else
                    class="badge bg-secondary bg-opacity-15 text-secondary rounded-pill px-2.5 py-1 fs-9"
                  >
                    Tồn ổn định
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         VIEW 3: LỊCH SỬ CÁC ĐỢT KIỂM KÊ
    ════════════════════════════════════════════════════════════════════ -->
    <div v-else-if="currentView === 'history'">
      <div class="card border-0 rounded-4 shadow-2xs bg-white overflow-hidden">
        <div v-if="historyLoading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status"></div>
        </div>

        <div v-else-if="auditHistory.length === 0" class="text-center py-5 text-muted">
          <i class="fa-solid fa-clock-rotate-left fs-1 opacity-40 mb-2 d-block"></i>
          Chưa có lịch sử kiểm kê kho nào được lưu.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.82rem;">
            <thead class="bg-light text-secondary">
              <tr>
                <th style="width: 140px;">Mã Phiếu</th>
                <th style="width: 130px;">Kỳ Kiểm Kê</th>
                <th style="width: 150px;">Thời Gian</th>
                <th style="width: 160px;">Người Thực Hiện</th>
                <th style="width: 150px;">Số Mặt Hàng</th>
                <th style="width: 140px;" class="text-center">Trạng Thái</th>
                <th style="width: 120px;" class="text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="audit in auditHistory" :key="audit._id">
                <td>
                  <strong class="text-danger">{{ audit.auditCode }}</strong>
                </td>

                <td>
                  <span class="badge bg-light text-dark border rounded-pill px-2 py-0.5 fs-9">
                    {{ auditTypeLabel(audit.auditType) }}
                  </span>
                </td>

                <td>
                  <span class="text-secondary d-block">{{ new Date(audit.createdAt).toLocaleDateString('vi-VN') }}</span>
                  <small class="text-muted fs-9">{{ new Date(audit.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</small>
                </td>

                <td>
                  <strong class="text-dark d-block">{{ audit.performedBy?.name || 'Thủ kho' }}</strong>
                  <small class="text-muted fs-9">{{ audit.performedBy?.email }}</small>
                </td>

                <td>
                  <span class="badge bg-light text-dark border rounded-pill px-2 py-1 fs-9">
                    {{ audit.items?.length || 0 }} nguyên liệu
                  </span>
                </td>

                <td class="text-center">
                  <span :class="['badge rounded-pill px-2.5 py-1 fs-9 fw-bold', audit.status === 'APPLIED' ? 'bg-success bg-opacity-15 text-success' : 'bg-warning bg-opacity-20 text-dark']">
                    {{ audit.status === 'APPLIED' ? '✅ Đã Cân Bằng Kho' : '📝 Bản Nháp' }}
                  </span>
                </td>

                <td class="text-center">
                  <button
                    v-if="audit.status !== 'APPLIED'"
                    @click="applyExistingAudit(audit)"
                    class="btn btn-sm btn-outline-success rounded-pill px-2.5 py-1 fw-bold"
                    title="Đồng bộ cân bằng kho ngay"
                  >
                    <i class="fa-solid fa-check me-1"></i> Áp Dụng
                  </button>
                  <span v-else class="text-muted fs-9 fst-italic">Đã đồng bộ</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ CONFIRM DIALOG MODAL ═══ -->
    <ConfirmModal
      :show="showConfirmDialog"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="Cân Bằng Tồn Kho"
      cancel-text="Hủy"
      confirm-variant="danger"
      :loading="saving"
      @cancel="showConfirmDialog = false"
      @confirm="executeConfirmedAction"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import ConfirmModal from "../common/ConfirmModal.vue";

const currentView = ref("audit");
const isAuditing = ref(false);
const saving = ref(false);
const reportLoading = ref(false);
const historyLoading = ref(false);

const period = ref("week");
const consumptionList = ref([]);
const auditHistory = ref([]);

const auditForm = reactive({
  auditType: "WEEKLY",
  notes: "",
  items: [],
});

// Confirm State
const showConfirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const pendingAction = ref(null);

const calcVariance = (item) => {
  const actual = Number(item.actualCount) || 0;
  const sys = Number(item.systemStock) || 0;
  return Number((actual - sys).toFixed(2));
};

const startNewAudit = async () => {
  saving.value = true;
  try {
    const res = await api.get("/ingredients", { params: { limit: 100 } });
    const ingredients = res.data.data.ingredients || [];

    auditForm.auditType = "WEEKLY";
    auditForm.notes = `Kiểm kê kho định kỳ ${new Date().toLocaleDateString("vi-VN")}`;
    auditForm.items = ingredients.map((ing) => ({
      ingredient: ing._id,
      name: ing.name,
      unit: ing.unit,
      systemStock: ing.stockQuantity || 0,
      actualCount: ing.stockQuantity || 0, // Mặc định điền số tồn hiện tại để đếm nhanh
      reason: "Khớp hoàn toàn",
    }));

    isAuditing.value = true;
  } catch (err) {
    toast.error("Lỗi lấy danh sách nguyên liệu kiểm kê");
  } finally {
    saving.value = false;
  }
};

const submitAudit = async (autoApply = false) => {
  saving.value = true;
  try {
    const payload = {
      auditType: auditForm.auditType,
      notes: auditForm.notes,
      autoApply,
      items: auditForm.items.map((it) => ({
        ingredient: it.ingredient,
        actualCount: Number(it.actualCount) || 0,
        reason: it.reason,
      })),
    };

    const res = await api.post("/stock-audits", payload);
    toast.success(res.data.message || "Lưu phiếu kiểm kê thành công!");
    isAuditing.value = false;
    await Promise.all([fetchAuditHistory(), fetchConsumptionReport()]);
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi lưu phiếu kiểm kê");
  } finally {
    saving.value = false;
  }
};

const confirmApplyAudit = () => {
  confirmTitle.value = "Xác nhận Cân Bằng Tồn Kho Thực Tế";
  confirmMessage.value = "Hệ thống sẽ cập nhật số lượng tồn kho của toàn bộ nguyên liệu theo đúng số lượng đếm thực tế. Hành động này sẽ thay đổi số liệu kho hiện tại!";
  pendingAction.value = async () => {
    await submitAudit(true);
  };
  showConfirmDialog.value = true;
};

const applyExistingAudit = (audit) => {
  confirmTitle.value = `Áp dụng kiểm kê ${audit.auditCode}`;
  confirmMessage.value = "Đồng bộ tồn kho hệ thống khớp theo số lượng thực tế đếm của phiếu kiểm kê này?";
  pendingAction.value = async () => {
    try {
      await api.patch(`/stock-audits/${audit._id}/apply`);
      toast.success("Đã đồng bộ cân bằng kho thành công!");
      await Promise.all([fetchAuditHistory(), fetchConsumptionReport()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi áp dụng kiểm kê");
    }
  };
  showConfirmDialog.value = true;
};

const executeConfirmedAction = async () => {
  if (pendingAction.value) {
    try {
      await pendingAction.value();
    } finally {
      pendingAction.value = null;
      showConfirmDialog.value = false;
    }
  }
};

const changePeriod = (p) => {
  period.value = p;
  fetchConsumptionReport();
};

const fetchConsumptionReport = async () => {
  reportLoading.value = true;
  try {
    const res = await api.get("/stock-audits/consumption-report", { params: { period: period.value } });
    consumptionList.value = res.data.data.report || [];
  } catch (err) {
    console.error("Lỗi lấy báo cáo tiêu thụ:", err);
  } finally {
    reportLoading.value = false;
  }
};

const fetchAuditHistory = async () => {
  historyLoading.value = true;
  try {
    const res = await api.get("/stock-audits", { params: { limit: 20 } });
    auditHistory.value = res.data.data.audits || [];
  } catch (err) {
    console.error("Lỗi lấy lịch sử kiểm kê:", err);
  } finally {
    historyLoading.value = false;
  }
};

const auditTypeLabel = (type) => {
  const map = {
    DAILY: "Hằng Ngày",
    WEEKLY: "Cuối Tuần",
    MONTHLY: "Cuối Tháng",
    ADHOC: "Đột Xuất",
  };
  return map[type] || type || "Cuối Tuần";
};

onMounted(() => {
  fetchConsumptionReport();
  fetchAuditHistory();
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
