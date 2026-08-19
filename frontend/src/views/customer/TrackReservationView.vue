<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <!-- Page Header -->
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-clock-rotate-left me-1"></i>
          {{ langStore.isEnglish ? 'My Bookings' : 'Đơn Đặt Bàn Của Tôi' }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">
          {{ langStore.isEnglish ? 'Reservation History' : 'Lịch Sử Đặt Bàn & Món' }}
        </h1>
        <p class="text-muted small">
          {{ langStore.isEnglish ? 'All your past and upcoming table bookings with pre-order dishes, dining orders, and payment receipts.' : 'Tất cả các lượt đặt bàn, món đặt trước, món dùng tại bàn và hóa đơn thanh toán.' }}
        </p>
      </div>

      <!-- Not Logged In -->
      <div v-if="!authStore.isAuthenticated" class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center shadow-lg bg-white mb-5">
        <i class="fa-solid fa-user-shield display-4 text-danger mb-3 d-block"></i>
        <h3 class="fw-bold text-dark mb-2">{{ langStore.isEnglish ? 'Login Required' : 'Vui Lòng Đăng Nhập' }}</h3>
        <p class="text-muted small mb-4">{{ langStore.isEnglish ? 'Login to view your reservation history.' : 'Đăng nhập để xem lịch sử đặt bàn của bạn.' }}</p>
        <router-link to="/login?redirect=/tra-cuu" class="btn btn-primary-crab px-4 py-2 fw-bold">
          <i class="fa-solid fa-right-to-bracket me-2"></i>
          {{ langStore.isEnglish ? 'Login Now' : 'Đăng Nhập Ngay' }}
        </router-link>
      </div>

      <template v-else>
        <!-- Loading State -->
        <div v-if="reservationStore.loading && reservationStore.myReservations.length === 0" class="text-center py-5">
          <div class="spinner-border text-danger" role="status"></div>
          <p class="text-muted small mt-3">{{ langStore.isEnglish ? 'Loading your bookings...' : 'Đang tải lịch sử đặt bàn...' }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="reservationStore.myReservations.length === 0"
             class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center bg-white shadow-sm">
          <i class="fa-solid fa-calendar-xmark display-3 text-secondary mb-3 d-block opacity-50"></i>
          <h4 class="fw-bold text-dark mb-2">{{ langStore.isEnglish ? 'No Reservations Yet' : 'Chưa Có Đơn Đặt Bàn Nào' }}</h4>
          <p class="text-muted small mb-4">{{ langStore.isEnglish ? 'Book your first table and enjoy our 3-region specialty cuisine!' : 'Đặt bàn ngay để trải nghiệm ẩm thực đặc sản 3 miền!' }}</p>
          <router-link to="/dat-ban" class="btn btn-primary-crab px-4 fw-bold">
            <i class="fa-solid fa-calendar-check me-2"></i>
            {{ langStore.isEnglish ? 'Book a Table' : 'Đặt Bàn Ngay' }}
          </router-link>
        </div>

        <!-- Reservation List -->
        <div v-else class="max-w-4xl mx-auto">
          <div v-for="r in reservationStore.myReservations" :key="r._id"
               class="glass-card bg-white rounded-5 mb-4 overflow-hidden shadow-sm"
               :style="selectedId === r._id ? 'border: 2px solid #dc3545;' : 'border: 1px solid #e2e8f0;'">

            <!-- Reservation Header Row (always visible, clickable) -->
            <div class="p-4 d-flex align-items-center justify-content-between gap-3 flex-wrap cursor-pointer"
                 @click="toggleDetail(r)">
              <div class="d-flex align-items-center gap-3 flex-wrap flex-grow-1">
                <!-- Status Badge -->
                <span :class="['badge rounded-pill px-3 py-2 fw-bold fs-8 flex-shrink-0', statusClass(r.status)]">
                  <i :class="statusIcon(r.status)" class="me-1"></i>
                  {{ statusLabel(r.status) }}
                </span>

                <!-- Code + Time -->
                <div>
                  <strong class="d-block text-dark brand-font fs-6">{{ r.reservationCode }}</strong>
                  <small class="text-muted">
                    <i class="fa-solid fa-clock me-1"></i>
                    {{ new Date(r.startAt).toLocaleString(langStore.isEnglish ? 'en-US' : 'vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) }}
                  </small>
                </div>

                <!-- Guest + Table Info -->
                <div class="d-none d-md-block">
                  <small class="text-muted d-block">
                    <i class="fa-solid fa-users me-1 text-danger"></i>
                    {{ r.guestsCount }} {{ langStore.isEnglish ? 'guests' : 'khách' }}
                  </small>
                  <small class="text-muted" v-if="r.tables && r.tables.length">
                    <i class="fa-solid fa-chair me-1 text-danger"></i>
                    {{ r.tables.map(t => (langStore.isEnglish ? 'T' : 'Bàn ') + t.tableNumber).join(', ') }}
                  </small>
                </div>

                <!-- Pre-order Dish Count -->
                <div v-if="r.preOrderDishes && r.preOrderDishes.length" class="d-none d-md-block">
                  <small class="text-muted d-block">
                    <i class="fa-solid fa-utensils me-1 text-warning"></i>
                    {{ r.preOrderDishes.length }} {{ langStore.isEnglish ? 'pre-order dish(es)' : 'món đặt trước' }}
                  </small>
                </div>

                <!-- Invoice Paid indicator -->
                <div v-if="r.status === 'COMPLETED' || r.invoice" class="d-none d-lg-block">
                  <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 small fw-bold">
                    <i class="fa-solid fa-receipt me-1"></i>
                    {{ langStore.isEnglish ? 'Invoice Paid' : 'Đã thanh toán' }}
                  </span>
                </div>

                <!-- Arrived: Quick Order button right on header -->
                <div v-if="r.status === 'ARRIVED'" class="ms-auto me-2">
                  <router-link
                    :to="`/goi-mon?session=${r.session?.sessionCode || r.sessionCode || r.reservationCode}`"
                    @click.stop
                    class="btn btn-danger btn-sm rounded-pill px-3 py-1.5 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                    style="font-size: 0.82rem;"
                  >
                    <i class="fa-solid fa-utensils"></i>
                    {{ langStore.isEnglish ? 'Order Dishes' : 'Gọi Thêm Món Tại Bàn' }}
                  </router-link>
                </div>
              </div>

              <!-- Expand Toggle Arrow -->
              <i :class="['fa-solid fa-chevron-down text-muted transition-all', selectedId === r._id ? 'fa-rotate-180 text-danger' : '']"
                 style="transition: transform 0.25s ease;"></i>
            </div>

            <!-- Expanded Detail Panel -->
            <transition name="slide-down">
              <ReservationDetailPanel
                v-if="selectedId === r._id"
                :r="r"
                :isEnglish="langStore.isEnglish"
                @demo-deposit="handleDemoConfirmDeposit"
                @reschedule="openReschedule"
                @cancel="handleCancel"
              />
            </transition>
          </div>
        </div>
      </template>
    </div>

    <!-- Reschedule Modal Component -->
    <RescheduleModal
      v-if="showRescheduleModal"
      v-model="newStartAt"
      :error="actionError"
      :isEnglish="langStore.isEnglish"
      @close="showRescheduleModal = false"
      @submit="submitReschedule"
    />

    <!-- Confirm Cancel Modal -->
    <ConfirmModal
      :show="showCancelConfirm"
      :title="langStore.isEnglish ? 'Cancel Reservation' : 'Hủy Đơn Đặt Bàn'"
      :message="cancelConfirmMessage"
      :confirm-text="langStore.isEnglish ? 'Confirm Cancel' : 'Xác Nhận Hủy'"
      :cancel-text="langStore.isEnglish ? 'Keep Reservation' : 'Giữ Lại Đơn'"
      confirm-variant="danger"
      icon="fa-solid fa-calendar-xmark"
      :loading="cancelLoading"
      @cancel="showCancelConfirm = false"
      @confirm="executeCancelReservation"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useReservationStore } from "../../stores/reservationStore";
import { useAuthStore } from "../../stores/authStore";
import { useLangStore } from "../../stores/langStore";
import { useRealtime } from "../../composables/useRealtime";
import { toast } from "../../composables/useToast";
import ReservationDetailPanel from "../../components/customer/ReservationDetailPanel.vue";
import RescheduleModal from "../../components/customer/RescheduleModal.vue";
import ConfirmModal from "../../components/common/ConfirmModal.vue";

const route = useRoute();
const reservationStore = useReservationStore();
const authStore = useAuthStore();
const langStore = useLangStore();

// Lắng nghe realtime từ Socket.io
useRealtime();

const selectedId = ref(null);
const showRescheduleModal = ref(false);
const rescheduleTarget = ref(null);
const newStartAt = ref("");
const actionError = ref("");

const toggleDetail = (r) => {
  selectedId.value = selectedId.value === r._id ? null : r._id;
};

const statusClass = (s) => ({
  CONFIRMED: "bg-success text-white",
  PENDING: "bg-warning text-dark",
  ARRIVED: "bg-primary text-white",
  CANCELLED: "bg-danger text-white",
  COMPLETED: "bg-success text-white",
})[s] || "bg-secondary text-white";

const statusIcon = (s) => ({
  CONFIRMED: "fa-solid fa-circle-check",
  PENDING: "fa-solid fa-hourglass-half",
  ARRIVED: "fa-solid fa-door-open",
  CANCELLED: "fa-solid fa-ban",
  COMPLETED: "fa-solid fa-circle-check",
})[s] || "fa-solid fa-question";

const statusLabel = (s) => {
  const labels = {
    CONFIRMED: langStore.isEnglish ? "Confirmed" : "Đã Xác Nhận",
    PENDING: langStore.isEnglish ? "Pending" : "Chờ Xác Nhận",
    ARRIVED: langStore.isEnglish ? "Seated / Dining" : "Đã Vào Bàn",
    CANCELLED: langStore.isEnglish ? "Cancelled" : "Đã Hủy",
    COMPLETED: langStore.isEnglish ? "Paid & Completed" : "Đã Thanh Toán",
  };
  return labels[s] || s;
};

const handleDemoConfirmDeposit = async (r) => {
  try {
    const res = await reservationStore.demoConfirmDeposit(r._id);
    toast.success(res.message || "Đã giả lập thanh toán nộp cọc thành công!");
    await reservationStore.fetchMyReservations();
  } catch (err) {
    toast.error(err.message || "Lỗi giả lập nộp cọc!");
  }
};

const showCancelConfirm = ref(false);
const cancelTarget = ref(null);
const cancelLoading = ref(false);

const cancelConfirmMessage = computed(() => {
  if (!cancelTarget.value) return "";
  const r = cancelTarget.value;
  const hoursBefore = (new Date(r.startAt).getTime() - Date.now()) / (1000 * 60 * 60);
  const isPaid = r.depositStatus === "PAID" && r.depositAmount > 0;

  if (isPaid) {
    if (hoursBefore <= 24) {
      return langStore.isEnglish
        ? `⚠️ REFUND POLICY WARNING: You are cancelling within 24 hours of your booking. According to restaurant policy, your deposit of ${r.depositAmount.toLocaleString('vi-VN')}đ WILL BE FORFEITED. Do you wish to proceed?`
        : `⚠️ CẢNH BÁO QUY ĐỊNH HOÀN CỌC: Bạn đang hủy đơn CẬN NGÀY (dưới 24 giờ trước giờ hẹn). Theo quy định của nhà hàng, bạn sẽ BỊ MẤT TOÀN BỘ TIỀN CỌC (${r.depositAmount.toLocaleString('vi-VN')}đ). Bạn có chắc chắn muốn hủy không?`;
    } else {
      return langStore.isEnglish
        ? `✅ REFUND ELIGIBLE: You are cancelling more than 24 hours in advance. You will receive a 100% REFUND of your deposit (${r.depositAmount.toLocaleString('vi-VN')}đ). Confirm cancellation?`
        : `✅ CHÍNH SÁCH HOÀN TIỀN: Bạn đang hủy đơn TRƯỚC 24 GIỜ. Bạn sẽ được HOÀN LẠI 100% TIỀN CỌC (${r.depositAmount.toLocaleString('vi-VN')}đ). Bàn đã giữ sẽ được giải phóng. Bạn có chắc chắn muốn hủy?`;
    }
  }

  return langStore.isEnglish
    ? "Are you sure you want to cancel this reservation? The reserved tables will be released."
    : "Bạn có chắc chắn muốn hủy đơn đặt bàn này? Bàn đã giữ sẽ được giải phóng.";
});

const handleCancel = (r) => {
  cancelTarget.value = r;
  showCancelConfirm.value = true;
};

const executeCancelReservation = async () => {
  if (!cancelTarget.value) return;
  cancelLoading.value = true;
  try {
    await reservationStore.cancelReservation(cancelTarget.value._id, "Khách tự hủy online");
    toast.success(langStore.isEnglish ? "Reservation cancelled." : "Đã hủy đơn đặt bàn.");
    showCancelConfirm.value = false;
    cancelTarget.value = null;
    await reservationStore.fetchMyReservations();
  } catch (err) {
    toast.error(err.message);
  } finally {
    cancelLoading.value = false;
  }
};

const openReschedule = (r) => {
  rescheduleTarget.value = r;
  newStartAt.value = "";
  actionError.value = "";
  showRescheduleModal.value = true;
};

const submitReschedule = async () => {
  actionError.value = "";
  if (!newStartAt.value) {
    actionError.value = langStore.isEnglish ? "Please select a new time." : "Vui lòng chọn thời gian mới.";
    return;
  }
  try {
    const res = await reservationStore.rescheduleReservation(rescheduleTarget.value._id, new Date(newStartAt.value).toISOString());
    toast.success(res.message || (langStore.isEnglish ? "Reschedule request sent to manager!" : "Yêu cầu dời lịch đã gửi tới Quản lý nhà hàng!"));
    showRescheduleModal.value = false;
    await reservationStore.fetchMyReservations();
  } catch (err) {
    actionError.value = err.message;
  }
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await reservationStore.fetchMyReservations();
    if (route.query.code) {
      const match = reservationStore.myReservations.find(
        (r) => r.reservationCode === route.query.code.trim().toUpperCase()
      );
      if (match) selectedId.value = match._id;
    } else if (reservationStore.myReservations.length > 0) {
      selectedId.value = reservationStore.myReservations[0]._id;
    }
  }

  if (route.query.paid === "1") toast.success(langStore.isEnglish ? "Deposit payment successful!" : "Thanh toán cọc thành công!");
  else if (route.query.paid === "0") toast.error(langStore.isEnglish ? "Deposit payment incomplete." : "Thanh toán cọc chưa hoàn tất.");
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>
