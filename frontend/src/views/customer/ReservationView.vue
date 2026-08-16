<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <!-- Title Header -->
      <div class="text-center max-w-2xl mx-auto mb-4">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-calendar-check me-1"></i> {{ langStore.t('reservation.badge') }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">{{ langStore.t('reservation.title') }}</h1>
        <p class="text-muted small mb-0">{{ langStore.t('reservation.subtitle') }}</p>
      </div>

      <!-- Auth Check: Login Required -->
      <div v-if="!authStore.isAuthenticated" class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center shadow-lg bg-white border-danger border-opacity-25">
        <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-block mb-3">
          <i class="fa-solid fa-user-lock display-4"></i>
        </div>
        <h3 class="fw-bold text-dark mb-2">{{ langStore.t('reservation.loginRequired') }}</h3>
        <p class="text-muted small mb-4">{{ langStore.t('reservation.loginDesc') }}</p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/login?redirect=/dat-ban" class="btn btn-primary-crab px-4 py-2.5 fw-bold">
            <i class="fa-solid fa-right-to-bracket me-2"></i> {{ langStore.isEnglish ? 'Login Now' : 'Đăng Nhập Ngay' }}
          </router-link>
          <router-link to="/register" class="btn btn-outline-danger rounded-pill px-4 py-2.5 fw-bold">
            {{ langStore.isEnglish ? 'Register Account' : 'Đăng Ký Thành Viên' }}
          </router-link>
        </div>
      </div>

      <!-- Success Box Screen with VietQR -->
      <ReservationSuccessBox
        v-else-if="successData"
        :successData="successData"
        :isEnglish="langStore.isEnglish"
        @demo-deposit="handleDemoDepositSuccess"
        @reset="resetForm"
      />

      <!-- Multi-step Wizard -->
      <div v-else class="max-w-5xl mx-auto">
        <!-- Wizard Navigation Bar -->
        <div class="wizard-header-steps mb-4">
          <div class="d-flex justify-content-between align-items-center position-relative px-2">
            <!-- Step 1 -->
            <div @click="goToStep(1)" :class="['wizard-step-node cursor-pointer', currentStep === 1 ? 'active' : '', currentStep > 1 ? 'completed' : '']">
              <div class="wizard-step-circle">
                <i v-if="currentStep > 1" class="fa-solid fa-check fs-8"></i>
                <span v-else>1</span>
              </div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '1. Contact Info' : '1. Thông Tin' }}</span>
            </div>

            <div class="wizard-step-line flex-grow-1 mx-2" :class="{ 'active-line': currentStep > 1 }"></div>

            <!-- Step 2 -->
            <div @click="goToStep(2)" :class="['wizard-step-node cursor-pointer', currentStep === 2 ? 'active' : '', currentStep > 2 ? 'completed' : '']">
              <div class="wizard-step-circle">
                <i v-if="currentStep > 2" class="fa-solid fa-check fs-8"></i>
                <span v-else>2</span>
              </div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '2. Select Table' : '2. Chọn Bàn' }}</span>
            </div>

            <div class="wizard-step-line flex-grow-1 mx-2" :class="{ 'active-line': currentStep > 2 }"></div>

            <!-- Step 3 -->
            <div @click="goToStep(3)" :class="['wizard-step-node cursor-pointer', currentStep === 3 ? 'active' : '', currentStep > 3 ? 'completed' : '']">
              <div class="wizard-step-circle">
                <i v-if="currentStep > 3" class="fa-solid fa-check fs-8"></i>
                <span v-else>3</span>
              </div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '3. Dishes' : '3. Chọn Món' }}</span>
            </div>

            <div class="wizard-step-line flex-grow-1 mx-2" :class="{ 'active-line': currentStep > 3 }"></div>

            <!-- Step 4 -->
            <div @click="goToStep(4)" :class="['wizard-step-node cursor-pointer', currentStep === 4 ? 'active' : '']">
              <div class="wizard-step-circle"><span>4</span></div>
              <span class="wizard-step-label fw-bold">{{ langStore.isEnglish ? '4. Confirm' : '4. Xác Nhận' }}</span>
            </div>
          </div>
        </div>

        <!-- Wizard Panels -->
        <div class="glass-card p-4 p-md-5 rounded-5 shadow-lg border-0 bg-white min-vh-card">
          <!-- Step 1 -->
          <StepContactInfo
            v-if="currentStep === 1"
            :form="form"
            :error="stepError"
            :isEnglish="langStore.isEnglish"
            @next="validateAndNext(1)"
          />

          <!-- Step 2 -->
          <StepTableSelect
            v-else-if="currentStep === 2"
            :form="form"
            :tables="tableStore.tables"
            :areas="tableStore.areas"
            :occupiedTableIds="occupiedTableIds"
            :loadingTables="loadingOccupied"
            :error="stepError"
            :isEnglish="langStore.isEnglish"
            @time-change="fetchOccupiedTables"
            @select-table="handleTableSelect"
            @back="currentStep = 1"
            @next="validateAndNext(2)"
          />

          <!-- Step 3 -->
          <StepPreOrder
            v-else-if="currentStep === 3"
            :dishes="menuStore.dishes"
            :preOrders="form.preOrders"
            :guestsCount="form.guestsCount"
            :isEnglish="langStore.isEnglish"
            @update-qty="updatePreOrderQuantity"
            @remove-dish="removePreOrderDish"
            @back="currentStep = 2"
            @next="currentStep = 4"
          />

          <!-- Step 4 -->
          <StepConfirmation
            v-else-if="currentStep === 4"
            :form="form"
            :tables="tableStore.tables"
            :preOrders="form.preOrders"
            :dishes="menuStore.dishes"
            :loading="reservationStore.loading"
            :error="stepError"
            :isEnglish="langStore.isEnglish"
            @back="currentStep = 3"
            @submit="handleSubmitReservation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useTableStore } from "../../stores/tableStore";
import { useMenuStore } from "../../stores/menuStore";
import { useReservationStore } from "../../stores/reservationStore";
import { useLangStore } from "../../stores/langStore";
import { toast } from "../../composables/useToast";
import api from "../../services/api";
import StepContactInfo from "../../components/customer/reservation/StepContactInfo.vue";
import StepTableSelect from "../../components/customer/reservation/StepTableSelect.vue";
import StepPreOrder from "../../components/customer/reservation/StepPreOrder.vue";
import StepConfirmation from "../../components/customer/reservation/StepConfirmation.vue";
import ReservationSuccessBox from "../../components/customer/reservation/ReservationSuccessBox.vue";

const authStore = useAuthStore();
const tableStore = useTableStore();
const menuStore = useMenuStore();
const reservationStore = useReservationStore();
const langStore = useLangStore();

const currentStep = ref(1);
const stepError = ref("");
const successData = ref(null);

const form = reactive({
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  guestsCount: 2,
  startAt: "",
  tableIds: [],
  preOrders: {},
  notes: "",
});

const occupiedTableIds = ref(new Set());
const loadingOccupied = ref(false);

const initDefaultTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  now.setMinutes(0, 0, 0);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  form.startAt = `${year}-${month}-${day}T${hours}:${minutes}`;
};

const fetchOccupiedTables = async () => {
  if (!form.startAt) return;
  loadingOccupied.value = true;
  try {
    const res = await api.get(`/tables/availability?startAt=${encodeURIComponent(form.startAt)}`);
    const occupied = res.data?.data?.occupiedTableIds || [];
    occupiedTableIds.value = new Set(occupied);
    form.tableIds = form.tableIds.filter((id) => !occupiedTableIds.value.has(id));
  } catch {
    occupiedTableIds.value = new Set();
  } finally {
    loadingOccupied.value = false;
  }
};

const handleTableSelect = (table) => {
  form.tableIds = [table._id];
};

const updatePreOrderQuantity = (dishId, delta) => {
  const current = form.preOrders[dishId] || 0;
  const next = current + delta;
  if (next <= 0) delete form.preOrders[dishId];
  else form.preOrders[dishId] = next;
};

const removePreOrderDish = (dishId) => {
  delete form.preOrders[dishId];
};

const validateAndNext = (step) => {
  stepError.value = "";
  if (step === 1) {
    if (!form.customerName.trim()) { stepError.value = "Vui lòng nhập họ và tên"; return; }
    if (!form.customerPhone.trim()) { stepError.value = "Vui lòng nhập số điện thoại"; return; }
    if (!form.guestsCount || form.guestsCount < 1) { stepError.value = "Vui lòng nhập số lượng khách hợp lệ (tối thiểu 1 người)"; return; }
    currentStep.value = 2;
    fetchOccupiedTables();
  } else if (step === 2) {
    if (!form.startAt) { stepError.value = "Vui lòng chọn thời gian bắt đầu"; return; }
    if (!form.tableIds || form.tableIds.length === 0) { stepError.value = "Vui lòng chọn 1 bàn mong muốn"; return; }
    currentStep.value = 3;
  }
};

const goToStep = (step) => {
  if (step < currentStep.value) {
    stepError.value = "";
    currentStep.value = step;
  } else if (step === 2 && currentStep.value === 1) {
    validateAndNext(1);
  } else if (step === 3 && currentStep.value <= 2) {
    validateAndNext(2);
  }
};

const handleSubmitReservation = async () => {
  stepError.value = "";
  try {
    const formattedDishes = [];
    for (const [dishId, qty] of Object.entries(form.preOrders)) {
      if (qty > 0) formattedDishes.push({ dish: dishId, quantity: qty });
    }

    const payload = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail ? form.customerEmail.trim() : undefined,
      guestsCount: form.guestsCount,
      startAt: new Date(form.startAt).toISOString(),
      tableIds: form.tableIds,
      preOrderDishes: formattedDishes,
      notes: form.notes ? form.notes.trim() : undefined,
    };

    const res = await reservationStore.createReservation(payload);
    successData.value = res;
    toast.success("Đặt bàn thành công!");
  } catch (err) {
    stepError.value = err.message || "Đặt bàn thất bại!";
  }
};

const handleDemoDepositSuccess = async () => {
  if (!successData.value?.data?.reservation?._id) return;
  try {
    await reservationStore.demoConfirmDeposit(successData.value.data.reservation._id);
    toast.success("Đã giả lập thanh toán nộp cọc thành công!");
    successData.value.deposit.status = "PAID";
  } catch (err) {
    toast.error(err.message || "Lỗi giả lập nộp cọc");
  }
};

const resetForm = () => {
  successData.value = null;
  currentStep.value = 1;
  form.tableIds = [];
  form.preOrders = {};
  form.notes = "";
  initDefaultTime();
};

onMounted(async () => {
  initDefaultTime();
  if (authStore.user) {
    form.customerName = authStore.user.name || "";
    form.customerPhone = authStore.user.phone || "";
    form.customerEmail = authStore.user.email || "";
  }
  tableStore.fetchTables();
  tableStore.fetchAreas();
  menuStore.fetchDishes();
});
</script>

<style scoped>
.wizard-step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.wizard-step-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #cbd5e1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.wizard-step-node.active .wizard-step-circle {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15);
}
.wizard-step-node.completed .wizard-step-circle {
  background: #16a34a;
  border-color: #16a34a;
  color: #ffffff;
}
.wizard-step-label {
  font-size: 0.75rem;
  margin-top: 0.35rem;
  color: #64748b;
}
.wizard-step-node.active .wizard-step-label {
  color: #dc2626;
}
.wizard-step-line {
  height: 3px;
  background: #e2e8f0;
  border-radius: 999px;
  transition: background 0.3s;
}
.wizard-step-line.active-line {
  background: #16a34a;
}
.min-vh-card {
  min-height: 480px;
}

@media (max-width: 576px) {
  .wizard-step-circle {
    width: 30px;
    height: 30px;
    font-size: 0.72rem;
  }
  .wizard-step-label {
    font-size: 0.62rem;
    margin-top: 0.2rem;
  }
  .min-vh-card {
    min-height: auto;
  }
}
</style>
