<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h2 class="fw-bold brand-font mb-1">POS Quản Lý Bàn Ăn Thực Tế (Dining Sessions)</h2>
        <p class="text-muted small mb-0">Tiếp nhận khách Walk-in, Gọi món đợt 1 đợt 2, Cảnh báo quá giờ và Thanh toán xuất hóa đơn</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="showTimelineModal = true" class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold" title="Phím tắt: F1">
          <i class="fa-solid fa-calendar-day me-1"></i> Lịch Đặt Bàn <span class="badge bg-primary text-white ms-1 fs-9">F1</span>
        </button>
        <button @click="openWalkInModal" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm" title="Phím tắt: F2">
          <i class="fa-solid fa-person-walking-luggage me-1"></i> Khách Walk-in <span class="badge bg-white text-danger ms-1 fs-9">F2</span>
        </button>
        <button @click="sessionStore.fetchActiveSessions()" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Active Sessions Grid -->
    <div v-if="sessionStore.loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else-if="sessionStore.activeSessions.length > 0" class="row g-4 mb-4">
      <div v-for="session in sessionStore.activeSessions" :key="session._id" class="col-md-4">
        <SessionCard
          :session="session"
          @open-qr="openQrModal"
          @change-table="openChangeTableModal"
          @merge-table="openMergeModal"
          @dish-status="openDishStatusModal"
          @order="openOrderModal"
          @checkout="openCheckoutModal"
        />
      </div>
    </div>

    <div v-else class="glass-card p-5 rounded-4 text-center">
      <i class="fa-solid fa-utensils display-3 text-secondary mb-3 d-block"></i>
      <h4 class="fw-bold">Hiện tại chưa có bàn nào đang dùng bữa</h4>
      <p class="text-muted small">Bấm nút "Tiếp Nhận Khách Walk-in" hoặc Check-in từ đơn đặt trước để mở bàn</p>
    </div>

    <!-- Modals -->
    <WalkInModal
      v-if="showWalkInModal"
      :availableTables="availableTables"
      :error="modalError"
      @close="showWalkInModal = false"
      @submit="handleCreateWalkIn"
    />

    <SelfOrderQrModal
      v-if="showQrModal"
      :qrUrl="selfOrderQrUrl"
      :targetUrl="selfOrderUrl"
      @close="showQrModal = false"
    />

    <ChangeTableModal
      v-if="showChangeTableModal && selectedSession"
      :session="selectedSession"
      :availableTables="availableTables"
      :error="modalError"
      @close="showChangeTableModal = false"
      @submit="submitChangeTables"
    />

    <MergeSessionModal
      v-if="showMergeModal && selectedSession"
      :targetSession="selectedSession"
      :activeSessions="sessionStore.activeSessions"
      :error="modalError"
      :loading="merging"
      @close="showMergeModal = false"
      @submit="submitMergeSession"
    />

    <OrderDishModal
      v-if="showOrderModal && selectedSession"
      :session="selectedSession"
      :dishes="menuStore.dishes"
      @close="showOrderModal = false"
      @submit="submitOrder"
    />

    <CheckoutModal
      v-if="showCheckoutModal && selectedSession"
      :session="selectedSession"
      :error="modalError"
      @close="showCheckoutModal = false"
      @submit="submitCheckout"
    />

    <DishStatusModal
      v-if="showDishStatusModal && selectedSession"
      :session="selectedSession"
      :orders="sessionOrders"
      :loading="loadingOrders"
      @close="showDishStatusModal = false"
    />

    <TableTimelineModal
      v-if="showTimelineModal"
      @close="showTimelineModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "../../stores/sessionStore";
import { useTableStore } from "../../stores/tableStore";
import { useMenuStore } from "../../stores/menuStore";
import { toast } from "../../composables/useToast";
import api from "../../services/api";
import SessionCard from "../../components/admin/pos/SessionCard.vue";
import WalkInModal from "../../components/admin/pos/WalkInModal.vue";
import SelfOrderQrModal from "../../components/admin/pos/SelfOrderQrModal.vue";
import ChangeTableModal from "../../components/admin/pos/ChangeTableModal.vue";
import MergeSessionModal from "../../components/admin/pos/MergeSessionModal.vue";
import OrderDishModal from "../../components/admin/pos/OrderDishModal.vue";
import CheckoutModal from "../../components/admin/pos/CheckoutModal.vue";
import DishStatusModal from "../../components/admin/pos/DishStatusModal.vue";
import TableTimelineModal from "../../components/admin/reservation/TableTimelineModal.vue";

const router = useRouter();
const sessionStore = useSessionStore();
const tableStore = useTableStore();
const menuStore = useMenuStore();

const showTimelineModal = ref(false);
const showWalkInModal = ref(false);
const showOrderModal = ref(false);
const showCheckoutModal = ref(false);
const showQrModal = ref(false);
const showChangeTableModal = ref(false);
const showMergeModal = ref(false);
const showDishStatusModal = ref(false);

const loadingOrders = ref(false);
const sessionOrders = ref([]);
const qrSession = ref(null);
const selectedSession = ref(null);
const modalError = ref("");

const availableTables = computed(() =>
  tableStore.tables.filter((t) => t.status === "AVAILABLE"),
);

const selfOrderUrl = computed(() => {
  if (!qrSession.value) return "";
  return `${window.location.origin}/goi-mon?sessionCode=${qrSession.value.sessionCode}`;
});

const selfOrderQrUrl = computed(() => {
  if (!selfOrderUrl.value) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selfOrderUrl.value)}`;
});

const openWalkInModal = () => {
  modalError.value = "";
  tableStore.fetchTables();
  showWalkInModal.value = true;
};

const openQrModal = (session) => {
  qrSession.value = session;
  showQrModal.value = true;
};

const openChangeTableModal = (session) => {
  selectedSession.value = session;
  modalError.value = "";
  tableStore.fetchTables();
  showChangeTableModal.value = true;
};

const merging = ref(false);

const openMergeModal = (session) => {
  selectedSession.value = session;
  modalError.value = "";
  showMergeModal.value = true;
};

const submitMergeSession = async (sourceSessionId) => {
  modalError.value = "";
  merging.value = true;
  try {
    const res = await api.post(`/dining-sessions/${selectedSession.value._id}/merge`, {
      sourceSessionId,
    });
    toast.success(res.data.message || "Gộp bàn & hóa đơn thành công!");
    showMergeModal.value = false;
    await Promise.all([sessionStore.fetchActiveSessions(), tableStore.fetchTables()]);
  } catch (err) {
    modalError.value = err.response?.data?.message || err.message || "Lỗi khi gộp bàn";
  } finally {
    merging.value = false;
  }
};

const openOrderModal = (session) => {
  selectedSession.value = session;
  menuStore.fetchDishes();
  showOrderModal.value = true;
};

const openCheckoutModal = (session) => {
  selectedSession.value = session;
  modalError.value = "";
  showCheckoutModal.value = true;
};

const openDishStatusModal = async (session) => {
  selectedSession.value = session;
  showDishStatusModal.value = true;
  loadingOrders.value = true;
  try {
    const res = await api.get(`/orders/session/${session._id}`);
    sessionOrders.value = res.data.data.orders;
  } catch {
    toast.error("Không tải được danh sách món của bàn này");
  } finally {
    loadingOrders.value = false;
  }
};

const handleCreateWalkIn = async (form) => {
  modalError.value = "";
  try {
    await sessionStore.createWalkInSession(form);
    toast.success("Tiếp nhận khách Walk-in thành công!");
    showWalkInModal.value = false;
    tableStore.fetchTables();
  } catch (err) {
    modalError.value = err.message;
  }
};

const submitChangeTables = async (tableIds) => {
  modalError.value = "";
  if (!tableIds || tableIds.length === 0) {
    modalError.value = "Vui lòng chọn ít nhất 1 bàn cho khách";
    return;
  }
  try {
    await sessionStore.changeTables(selectedSession.value._id, tableIds);
    toast.success("Đổi bàn / Ghép thêm bàn thành công!");
    showChangeTableModal.value = false;
    tableStore.fetchTables();
  } catch (err) {
    modalError.value = err.message;
  }
};

const submitOrder = async (basket) => {
  try {
    const items = basket.map((item) => ({
      dish: item.dishId,
      quantity: item.quantity,
      price: item.price,
      notes: "",
    }));
    await api.post("/orders", {
      diningSessionId: selectedSession.value._id,
      items,
      notes: "Nhân viên gọi món tại bàn qua POS",
    });
    toast.success("Đã gửi đơn gọi món xuống Bếp thành công!");
    showOrderModal.value = false;
    sessionStore.fetchActiveSessions();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lỗi khi gửi đơn gọi món");
  }
};

const submitCheckout = async (form) => {
  modalError.value = "";
  try {
    const payload = {
      diningSessionId: selectedSession.value._id,
      paymentMethod: form.paymentMethod,
      discountAmount: Number(form.discountAmount) || 0,
      taxPercent: Number(form.taxPercent) || 0,
      voucherCode: form.voucherCode ? form.voucherCode.trim().toUpperCase() : undefined,
    };
    const res = await api.post("/invoices", payload);
    if (res.data.paymentUrl) {
      window.location.href = res.data.paymentUrl;
      return;
    }
    const sessionId = selectedSession.value._id;
    showCheckoutModal.value = false;
    sessionStore.fetchActiveSessions();
    tableStore.fetchTables();
    router.push(`/admin/invoice/${sessionId}`);
  } catch (err) {
    modalError.value = err.response?.data?.message || "Thanh toán thất bại!";
  }
};

const handleKeydown = (e) => {
  if (e.key === "F1") {
    e.preventDefault();
    showTimelineModal.value = true;
  } else if (e.key === "F2") {
    e.preventDefault();
    openWalkInModal();
  } else if (e.key === "Escape") {
    showWalkInModal.value = false;
    showQrModal.value = false;
    showChangeTableModal.value = false;
    showMergeModal.value = false;
    showDishStatusModal.value = false;
    showOrderModal.value = false;
    showCheckoutModal.value = false;
    showTimelineModal.value = false;
  }
};

onMounted(() => {
  sessionStore.fetchActiveSessions();
  tableStore.fetchTables();
  menuStore.fetchDishes();
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>
