<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-ticket me-1"></i>
          {{ langStore.isEnglish ? 'Reservation Lookup' : 'Tra Cứu Đặt Bàn' }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">
          {{ langStore.isEnglish ? 'Track Your Reservation' : 'Tra Cứu Đơn Đặt Bàn' }}
        </h1>
        <p class="text-muted small">
          {{ langStore.isEnglish ? 'Enter your reservation code to check status, get check-in QR code and manage your booking.' : 'Nhập mã đặt bàn để kiểm tra trạng thái, lấy mã QR check-in và quản lý đơn của bạn.' }}
        </p>
      </div>

      <!-- Yêu cầu đăng nhập nếu chưa đăng nhập -->
      <div v-if="!authStore.isAuthenticated" class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center shadow-lg bg-white mb-5">
        <i class="fa-solid fa-user-shield display-4 text-danger mb-3 d-block"></i>
        <h3 class="fw-bold text-dark mb-2">
          {{ langStore.isEnglish ? 'Login Required' : 'Yêu Cầu Đăng Nhập' }}
        </h3>
        <p class="text-muted small mb-4">
          {{ langStore.isEnglish ? 'Please login to look up and manage your reservation.' : 'Vui lòng đăng nhập để tra cứu và quản lý đơn đặt bàn của bạn.' }}
        </p>
        <router-link to="/login?redirect=/tra-cuu" class="btn btn-primary-crab px-4 py-2 fw-bold">
          <i class="fa-solid fa-right-to-bracket me-2"></i>
          {{ langStore.isEnglish ? 'Login Now' : 'Đăng Nhập Ngay' }}
        </router-link>
      </div>

      <template v-else>
        <!-- Search Box -->
        <div class="max-w-xl mx-auto glass-card p-4 rounded-5 mb-5 shadow-sm bg-white">
          <form @submit.prevent="handleSearch" class="d-flex flex-column flex-md-row gap-2">
            <div class="form-control-icon flex-grow-1">
              <input
                v-model="searchCode"
                type="text"
                class="form-control py-2 text-uppercase fw-bold"
                :placeholder="langStore.isEnglish ? 'Enter code e.g. RES-123456...' : 'Nhập mã đặt bàn VD: RES-123456...'"
                required
              />
              <i class="fa-solid fa-ticket"></i>
            </div>
            <button type="submit" :disabled="reservationStore.loading" class="btn btn-primary-crab px-4 text-nowrap fw-bold">
              <span v-if="reservationStore.loading" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fa-solid fa-magnifying-glass me-1"></i>
              {{ langStore.isEnglish ? 'Search' : 'Tra Cứu' }}
            </button>
          </form>
          <div v-if="errorMsg" class="alert alert-danger mt-3 mb-0 small rounded-3 d-flex align-items-center gap-2">
            <i class="fa-solid fa-circle-exclamation fs-5"></i>
            <div>{{ errorMsg }}</div>
          </div>
        </div>

        <!-- Result Ticket Pass Card -->
        <div v-if="reservation" class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5 shadow-lg bg-white" style="border-top: 5px solid #dc3545;">
          <!-- Header: Brand + Status -->
          <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
            <div class="d-flex align-items-center gap-2">
              <div class="p-2 bg-danger bg-opacity-10 text-danger rounded-3">
                <i class="fa-solid fa-utensils fs-4"></i>
              </div>
              <div>
                <strong class="d-block text-dark brand-font">NHÀ HÀNG 3 MIỀN CUA</strong>
                <small class="text-muted fs-8">
                  {{ langStore.isEnglish ? 'RESERVATION TICKET & CHECK-IN QR PASS' : 'PHIẾU GIỮ CHỖ & MÃ QR CHECK-IN' }}
                </small>
              </div>
            </div>
            <span
              :class="[
                'badge px-3 py-2 rounded-pill fs-7 fw-bold',
                reservation.status === 'CONFIRMED' ? 'bg-success' :
                reservation.status === 'ARRIVED' ? 'bg-primary' :
                reservation.status === 'CANCELLED' ? 'bg-danger' : 'bg-secondary'
              ]"
            >
              {{
                reservation.status === 'CONFIRMED' ? (langStore.isEnglish ? 'CONFIRMED' : 'ĐÃ GIỮ CHỖ') :
                reservation.status === 'ARRIVED' ? (langStore.isEnglish ? 'CHECKED IN' : 'ĐÃ CHECK-IN') :
                reservation.status === 'CANCELLED' ? (langStore.isEnglish ? 'CANCELLED' : 'ĐÃ HỦY') :
                reservation.status
              }}
            </span>
          </div>

          <!-- MÃ QR CHECK-IN TỐC ĐỘ TẠI QUẦY -->
          <div class="p-4 bg-light rounded-4 border text-center mb-4">
            <span class="badge bg-danger text-white px-3 py-2 rounded-pill mb-3 fw-bold fs-8 d-inline-block">
              <i class="fa-solid fa-qrcode me-1"></i>
              {{ langStore.isEnglish ? 'CHECK-IN QR CODE' : 'MÃ QR CHECK-IN VÀO BÀN' }}
            </span>
            <h4 class="brand-font fw-bold text-danger mb-3">
              {{ langStore.isEnglish ? 'Reservation Code:' : 'Mã Đơn:' }} {{ reservation.reservationCode }}
            </h4>

            <img
              v-if="checkInQrUrl"
              :src="checkInQrUrl"
              alt="Mã QR Check-in Quầy POS"
              class="img-fluid rounded-3 border bg-white p-2 shadow-sm mb-3"
              style="max-width: 220px;"
            />

            <p class="small text-dark mb-0 fw-semibold">
              <i class="fa-solid fa-bolt text-warning me-1"></i>
              {{ langStore.isEnglish ? 'Show this QR code to the cashier for instant 3-second table check-in!' : 'Đưa mã QR này cho Thu ngân quét để tự động xác nhận vào bàn trong 3 giây!' }}
            </p>
          </div>

          <!-- Customer & Booking Details Grid -->
          <div class="row g-3 mb-4 p-3 bg-light rounded-4 border">
            <div class="col-6">
              <span class="text-muted small d-block mb-1">{{ langStore.isEnglish ? 'Guest Name' : 'Họ và tên khách hàng' }}</span>
              <strong class="d-block text-dark fs-6">{{ reservation.customerName }}</strong>
            </div>
            <div class="col-6">
              <span class="text-muted small d-block mb-1">{{ langStore.isEnglish ? 'Contact Phone' : 'Số điện thoại liên hệ' }}</span>
              <strong class="d-block text-dark fs-6">{{ reservation.customerPhone }}</strong>
            </div>
            <div class="col-6">
              <span class="text-muted small d-block mb-1">{{ langStore.isEnglish ? 'Guest Count' : 'Số lượng khách' }}</span>
              <strong class="d-block text-dark fs-6">
                {{ reservation.guestsCount }} {{ langStore.isEnglish ? 'guests' : 'người' }}
              </strong>
            </div>
            <div class="col-6">
              <span class="text-muted small d-block mb-1">{{ langStore.isEnglish ? 'Dining Time' : 'Thời gian dùng bữa' }}</span>
              <strong class="d-block text-danger fs-6">{{ new Date(reservation.startAt).toLocaleString('vi-VN') }}</strong>
            </div>
          </div>

          <!-- Pre-assigned Tables -->
          <div class="p-3 bg-white rounded-4 border mb-4">
            <h6 class="fw-bold brand-font text-dark mb-2">
              <i class="fa-solid fa-chair text-danger me-1"></i>
              {{ langStore.isEnglish ? 'Reserved Table(s):' : 'Vị trí bàn giữ chỗ:' }}
            </h6>
            <div v-if="reservation.tables && reservation.tables.length > 0" class="d-flex flex-wrap gap-2">
              <span v-for="table in reservation.tables" :key="table._id" class="badge bg-danger px-3 py-2 rounded-pill fs-7">
                {{ langStore.isEnglish ? 'Table' : 'Bàn' }} {{ table.tableNumber }} ({{ table.capacity }} {{ langStore.isEnglish ? 'seats' : 'chỗ' }})
              </span>
            </div>
            <span v-else class="text-muted small">
              {{ langStore.isEnglish ? 'Auto-assigning tables...' : 'Đang tự động gán bàn...' }}
            </span>
          </div>

          <!-- Action buttons: Reschedule / Cancel -->
          <div v-if="reservation.status === 'CONFIRMED' || reservation.status === 'PENDING'" class="d-flex gap-2 mb-4 flex-wrap">
            <button @click="showRescheduleModal = true" class="btn btn-outline-primary rounded-pill flex-fill fw-semibold">
              <i class="fa-solid fa-calendar-days me-1"></i>
              {{ langStore.isEnglish ? 'Reschedule' : 'Dời Lịch Đặt Bàn' }}
            </button>
            <button @click="handleCancel" class="btn btn-outline-danger rounded-pill flex-fill fw-semibold">
              <i class="fa-solid fa-ban me-1"></i>
              {{ langStore.isEnglish ? 'Cancel Booking' : 'Hủy Đặt Bàn' }}
            </button>
          </div>

          <!-- Thông tin hoàn cọc khi đã hủy -->
          <div v-if="reservation.status === 'CANCELLED'" class="alert alert-warning rounded-4 p-3 mb-4 d-flex align-items-center gap-2">
            <i class="fa-solid fa-money-bill-transfer fs-4 text-warning"></i>
            <div class="small text-dark">
              <strong class="d-block">{{ langStore.isEnglish ? 'Booking Cancelled.' : 'Đơn đã bị hủy.' }}</strong>
              <span v-if="reservation.refundAmount > 0">
                {{ langStore.isEnglish ? 'Deposit refund:' : 'Số tiền cọc được hoàn lại:' }}
                <strong class="text-danger">{{ reservation.refundAmount.toLocaleString('vi-VN') }}đ</strong>
              </span>
              <span v-else>
                {{ langStore.isEnglish ? 'No refund per restaurant cancellation policy.' : 'Không hoàn cọc theo chính sách hủy của nhà hàng.' }}
              </span>
            </div>
          </div>

          <!-- Deposit VietQR QR Code -->
          <div v-if="depositInfo && depositInfo.amount > 0" class="p-4 bg-white rounded-4 border text-center mb-4">
            <h6 class="fw-bold text-danger mb-2">
              {{ langStore.isEnglish ? 'Pay Deposit:' : 'Thanh Toán Tiền Cọc:' }}
              {{ depositInfo.amount.toLocaleString('vi-VN') }}đ
            </h6>
            <span
              :class="['badge rounded-pill px-3 py-2 mb-3 d-inline-block fs-7 fw-semibold', depositInfo.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark']"
            >
              <i :class="depositInfo.status === 'PAID' ? 'fa-solid fa-circle-check' : 'fa-solid fa-hourglass-half'" class="me-1"></i>
              {{
                depositInfo.status === 'PAID'
                  ? (langStore.isEnglish ? 'Deposit Confirmed' : 'Nhà hàng đã xác nhận nhận cọc')
                  : (langStore.isEnglish ? 'Awaiting deposit confirmation' : 'Chờ xác nhận nộp cọc')
              }}
            </span>
            <img
              v-if="depositInfo.qrCodeUrl"
              :src="depositInfo.qrCodeUrl"
              alt="Mã QR VietQR Cọc"
              class="img-fluid rounded-3 border mb-3 d-block mx-auto"
              style="max-width: 220px;"
            />
            <p class="small text-muted mb-3">
              {{ langStore.isEnglish ? 'Pay deposit via VietQR to confirm your reservation.' : 'Nộp cọc qua VietQR để nhà hàng giữ chỗ và chuẩn bị món pre-order.' }}
            </p>
            <div v-if="depositInfo.status !== 'PAID'" class="d-flex flex-wrap justify-content-center gap-2">
              <button @click="payVnpay" class="btn btn-outline-primary rounded-pill px-4 fw-bold">
                <i class="fa-solid fa-credit-card me-1"></i>
                {{ langStore.isEnglish ? 'Pay via VNPay' : 'Thanh Toán Cọc Qua VNPay' }}
              </button>
              <button @click="payMomo" class="btn btn-outline-danger rounded-pill px-4 fw-bold">
                <i class="fa-solid fa-wallet me-1"></i>
                {{ langStore.isEnglish ? 'Pay via MoMo' : 'Thanh Toán Qua MoMo' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Modal dời lịch -->
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
                <label class="form-label fw-semibold text-dark">
                  {{ langStore.isEnglish ? 'New dining time' : 'Thời gian dùng bữa mới' }}
                </label>
                <input v-model="newStartAt" type="datetime-local" class="form-control" />
                <div v-if="actionError" class="alert alert-danger small mt-3 mb-0 rounded-3">{{ actionError }}</div>
              </div>
              <div class="modal-footer border-0">
                <button @click="showRescheduleModal = false" class="btn btn-light rounded-pill px-4">
                  {{ langStore.isEnglish ? 'Cancel' : 'Hủy' }}
                </button>
                <button @click="handleReschedule" class="btn btn-primary-crab rounded-pill px-4 fw-bold">
                  {{ langStore.isEnglish ? 'Confirm Reschedule' : 'Xác Nhận Dời' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
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

const searchCode = ref(route.query.code || "");
const errorMsg = ref("");
const reservation = ref(null);
const depositInfo = ref(null);
const checkInQrUrl = ref("");
const showRescheduleModal = ref(false);
const newStartAt = ref("");
const actionError = ref("");

const handleSearch = async () => {
  errorMsg.value = "";
  try {
    const res = await reservationStore.trackReservation(searchCode.value, authStore.user?.phone);
    reservation.value = res.data.reservation;
    depositInfo.value = res.deposit;
    checkInQrUrl.value = res.checkInQrUrl;
  } catch (err) {
    errorMsg.value = err.message;
    reservation.value = null;
  }
};

const handleCancel = async () => {
  const confirmMsg = langStore.isEnglish
    ? "Are you sure you want to cancel this reservation?"
    : "Bạn có chắc muốn hủy đơn đặt bàn này?";
  if (!confirm(confirmMsg)) return;
  try {
    const res = await reservationStore.cancelReservation(reservation.value._id, "Khách tự hủy online");
    reservation.value = res.data.reservation;
    if (res.refundAmount > 0) {
      toast.warning(`${langStore.isEnglish ? 'Cancelled. Refund:' : 'Đã hủy. Hoàn cọc'} ${res.refundAmount.toLocaleString('vi-VN')}đ`);
    } else {
      toast.info(langStore.isEnglish ? "Reservation cancelled." : "Đã hủy đơn đặt bàn");
    }
  } catch (err) {
    toast.error(err.message);
  }
};

const handleReschedule = async () => {
  actionError.value = "";
  if (!newStartAt.value) {
    actionError.value = langStore.isEnglish ? "Please select a new time" : "Vui lòng chọn thời gian mới";
    return;
  }
  try {
    await reservationStore.rescheduleReservation(reservation.value._id, new Date(newStartAt.value).toISOString());
    toast.success(langStore.isEnglish ? "Rescheduled successfully!" : "Dời lịch đặt bàn thành công!");
    showRescheduleModal.value = false;
    await handleSearch();
  } catch (err) {
    actionError.value = err.message;
  }
};

const payVnpay = async () => {
  try {
    const url = await reservationStore.createDepositPaymentUrl(reservation.value._id);
    window.location.href = url;
  } catch (err) {
    toast.error(err.message);
  }
};

const payMomo = async () => {
  try {
    const url = await reservationStore.createDepositPaymentUrlMomo(reservation.value._id);
    window.location.href = url;
  } catch (err) {
    toast.error(err.message);
  }
};

onMounted(() => {
  if (searchCode.value && authStore.isAuthenticated) handleSearch();
  if (route.query.paid === "1") toast.success(langStore.isEnglish ? "Deposit payment successful!" : "Thanh toán cọc thành công!");
  else if (route.query.paid === "0") toast.error(langStore.isEnglish ? "Deposit payment incomplete." : "Thanh toán cọc chưa hoàn tất.");
});
</script>
