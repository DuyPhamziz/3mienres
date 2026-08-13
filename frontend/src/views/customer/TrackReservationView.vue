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
          {{ langStore.isEnglish ? 'All your past and upcoming table bookings with pre-order dishes and QR check-in codes.' : 'Tất cả các lượt đặt bàn và món đặt trước. Bấm vào đơn để xem QR check-in và quản lý.' }}
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
        <div v-if="reservationStore.loading" class="text-center py-5">
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
            <div class="p-4 d-flex align-items-center justify-content-between gap-3 flex-wrap"
                 style="cursor: pointer;"
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
              </div>

              <!-- Expand Toggle Arrow -->
              <i :class="['fa-solid fa-chevron-down text-muted transition-all', selectedId === r._id ? 'fa-rotate-180' : '']"
                 style="transition: transform 0.25s ease;"></i>
            </div>

            <!-- Expanded Detail Panel -->
            <transition name="slide-down">
              <div v-if="selectedId === r._id" class="border-top" style="background: #f8fafc;">
                <div class="row g-0">

                  <!-- Left: Check-in QR + Deposit -->
                  <div class="col-md-5 p-4 border-end">
                    <h6 class="fw-bold text-dark mb-3">
                      <i class="fa-solid fa-qrcode text-danger me-2"></i>
                      {{ langStore.isEnglish ? 'Check-in QR Code' : 'Mã QR Check-in Tại Quầy' }}
                    </h6>
                    <div class="text-center bg-white rounded-4 p-3 border mb-3">
                      <img
                        :src="`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(r.reservationCode)}`"
                        :alt="r.reservationCode"
                        class="img-fluid rounded-3"
                        style="max-width: 170px;"
                      />
                      <p class="small text-muted mt-2 mb-0">
                        {{ langStore.isEnglish ? 'Show to cashier for instant check-in' : 'Đưa mã này cho Thu ngân để check-in nhanh' }}
                      </p>
                    </div>

                    <!-- Deposit Info -->
                    <div v-if="r.deposit" class="p-3 rounded-4 border"
                         :class="r.deposit.status === 'PAID' ? 'bg-success bg-opacity-10 border-success' : 'bg-warning bg-opacity-10 border-warning'">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <i :class="r.deposit.status === 'PAID' ? 'fa-solid fa-circle-check text-success' : 'fa-solid fa-hourglass-half text-warning'"></i>
                        <strong class="small text-dark">
                          {{ langStore.isEnglish ? 'Deposit:' : 'Tiền cọc:' }}
                          {{ (r.deposit.amount || 0).toLocaleString('vi-VN') }}đ
                        </strong>
                      </div>
                      <small :class="r.deposit.status === 'PAID' ? 'text-success' : 'text-warning'" class="fw-semibold">
                        {{ r.deposit.status === 'PAID'
                            ? (langStore.isEnglish ? 'Deposit Confirmed' : 'Đã xác nhận nộp cọc')
                            : (langStore.isEnglish ? 'Pending deposit confirmation' : 'Chờ xác nhận cọc') }}
                      </small>
                    </div>

                    <!-- Action Buttons -->
                    <div v-if="r.status === 'CONFIRMED' || r.status === 'PENDING'" class="d-flex flex-column gap-2 mt-3">
                      <button @click="openReschedule(r)" class="btn btn-outline-primary rounded-pill fw-semibold btn-sm">
                        <i class="fa-solid fa-calendar-days me-1"></i>
                        {{ langStore.isEnglish ? 'Reschedule' : 'Dời Lịch' }}
                      </button>
                      <button @click="handleCancel(r)" class="btn btn-outline-danger rounded-pill fw-semibold btn-sm">
                        <i class="fa-solid fa-ban me-1"></i>
                        {{ langStore.isEnglish ? 'Cancel Booking' : 'Hủy Đặt Bàn' }}
                      </button>
                    </div>
                  </div>

                  <!-- Right: Booking Details + Pre-order Dishes -->
                  <div class="col-md-7 p-4">
                    <!-- Key Details -->
                    <h6 class="fw-bold text-dark mb-3">
                      <i class="fa-solid fa-circle-info text-danger me-2"></i>
                      {{ langStore.isEnglish ? 'Booking Details' : 'Thông Tin Đặt Bàn' }}
                    </h6>
                    <div class="row g-2 mb-4">
                      <div class="col-6">
                        <div class="p-2 bg-white rounded-3 border">
                          <small class="text-muted d-block fs-8">{{ langStore.isEnglish ? 'Guest Name' : 'Tên khách' }}</small>
                          <strong class="text-dark fs-7">{{ r.customerName }}</strong>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="p-2 bg-white rounded-3 border">
                          <small class="text-muted d-block fs-8">{{ langStore.isEnglish ? 'Phone' : 'Điện thoại' }}</small>
                          <strong class="text-dark fs-7">{{ r.customerPhone }}</strong>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="p-2 bg-white rounded-3 border">
                          <small class="text-muted d-block fs-8">{{ langStore.isEnglish ? 'Guests' : 'Số khách' }}</small>
                          <strong class="text-dark fs-7">{{ r.guestsCount }} {{ langStore.isEnglish ? 'pax' : 'người' }}</strong>
                        </div>
                      </div>
                      <div class="col-6" v-if="r.tables && r.tables.length">
                        <div class="p-2 bg-white rounded-3 border">
                          <small class="text-muted d-block fs-8">{{ langStore.isEnglish ? 'Tables' : 'Bàn đặt trước' }}</small>
                          <strong class="text-dark fs-7">{{ r.tables.map(t => (langStore.isEnglish ? 'T.' : 'Bàn ') + t.tableNumber).join(' + ') }}</strong>
                        </div>
                      </div>
                      <div class="col-12" v-if="r.specialRequest">
                        <div class="p-2 bg-white rounded-3 border">
                          <small class="text-muted d-block fs-8">{{ langStore.isEnglish ? 'Special Request' : 'Ghi chú đặc biệt' }}</small>
                          <small class="text-dark">{{ r.specialRequest }}</small>
                        </div>
                      </div>
                    </div>

                    <!-- Pre-order Dishes -->
                    <h6 class="fw-bold text-dark mb-2">
                      <i class="fa-solid fa-utensils text-warning me-2"></i>
                      {{ langStore.isEnglish ? 'Pre-ordered Dishes' : 'Món Đặt Trước (Pre-order)' }}
                    </h6>
                    <div v-if="r.preOrderDishes && r.preOrderDishes.length > 0">
                      <div v-for="(item, idx) in r.preOrderDishes" :key="idx"
                           class="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div class="d-flex align-items-center gap-2">
                          <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill fs-8 fw-bold px-2">x{{ item.quantity }}</span>
                          <span class="text-dark fw-semibold fs-7">{{ item.dish?.name || (langStore.isEnglish ? 'Unknown dish' : 'Món không xác định') }}</span>
                        </div>
                        <small class="text-danger fw-bold">
                          {{ ((item.dish?.price || 0) * item.quantity).toLocaleString('vi-VN') }}đ
                        </small>
                      </div>
                      <!-- Total -->
                      <div class="d-flex justify-content-between align-items-center pt-2 mt-1 fw-bold">
                        <span class="text-muted small">{{ langStore.isEnglish ? 'Pre-order subtotal:' : 'Tổng tiền món đặt trước:' }}</span>
                        <span class="text-danger">
                          {{ r.preOrderDishes.reduce((sum, item) => sum + (item.dish?.price || 0) * item.quantity, 0).toLocaleString('vi-VN') }}đ
                        </span>
                      </div>
                    </div>
                    <div v-else class="text-muted small py-2">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      {{ langStore.isEnglish ? 'No pre-order dishes for this booking.' : 'Không có món đặt trước cho lượt này.' }}
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </template>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="showRescheduleModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">
              <i class="fa-solid fa-calendar-days me-2"></i>
              {{ langStore.isEnglish ? 'Reschedule Booking' : 'Dời Lịch Đặt Bàn' }}
            </h5>
            <button @click="showRescheduleModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <label class="form-label fw-semibold text-dark">{{ langStore.isEnglish ? 'New dining time' : 'Thời gian dùng bữa mới' }}</label>
            <input v-model="newStartAt" type="datetime-local" class="form-control" />
            <div v-if="actionError" class="alert alert-danger small mt-3 mb-0 rounded-3">{{ actionError }}</div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showRescheduleModal = false" class="btn btn-light rounded-pill px-4">{{ langStore.isEnglish ? 'Cancel' : 'Hủy' }}</button>
            <button @click="submitReschedule" class="btn btn-primary-crab rounded-pill px-4 fw-bold">{{ langStore.isEnglish ? 'Confirm' : 'Xác Nhận' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useReservationStore } from "../../stores/reservationStore";
import { useAuthStore } from "../../stores/authStore";
import { useLangStore } from "../../stores/langStore";
import { toast } from "../../composables/useToast";

const route = useRoute();
const reservationStore = useReservationStore();
const authStore = useAuthStore();
const langStore = useLangStore();

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
  COMPLETED: "bg-secondary text-white",
})[s] || "bg-secondary text-white";

const statusIcon = (s) => ({
  CONFIRMED: "fa-solid fa-circle-check",
  PENDING: "fa-solid fa-hourglass-half",
  ARRIVED: "fa-solid fa-door-open",
  CANCELLED: "fa-solid fa-ban",
  COMPLETED: "fa-solid fa-flag-checkered",
})[s] || "fa-solid fa-question";

const statusLabel = (s) => {
  const labels = {
    CONFIRMED: langStore.isEnglish ? "Confirmed" : "Đã Xác Nhận",
    PENDING: langStore.isEnglish ? "Pending" : "Chờ Xác Nhận",
    ARRIVED: langStore.isEnglish ? "Checked In" : "Đã Vào Bàn",
    CANCELLED: langStore.isEnglish ? "Cancelled" : "Đã Hủy",
    COMPLETED: langStore.isEnglish ? "Completed" : "Đã Hoàn Thành",
  };
  return labels[s] || s;
};

const handleCancel = async (r) => {
  const msg = langStore.isEnglish ? "Are you sure you want to cancel this reservation?" : "Bạn có chắc muốn hủy đơn đặt bàn này?";
  if (!confirm(msg)) return;
  try {
    await reservationStore.cancelReservation(r._id, "Khách tự hủy online");
    toast.success(langStore.isEnglish ? "Reservation cancelled." : "Đã hủy đơn đặt bàn.");
    await reservationStore.fetchMyReservations();
  } catch (err) {
    toast.error(err.message);
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
    await reservationStore.rescheduleReservation(rescheduleTarget.value._id, new Date(newStartAt.value).toISOString());
    toast.success(langStore.isEnglish ? "Rescheduled successfully!" : "Dời lịch thành công!");
    showRescheduleModal.value = false;
    await reservationStore.fetchMyReservations();
  } catch (err) {
    actionError.value = err.message;
  }
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await reservationStore.fetchMyReservations();
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
  max-height: 1000px;
  opacity: 1;
}
</style>
