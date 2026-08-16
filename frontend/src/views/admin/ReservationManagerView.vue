<template>
  <div class="reservation-manager">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2 class="fw-bold brand-font mb-1 text-dark">
          <i class="fa-solid fa-qrcode text-danger me-2"></i>Quản Lý Đặt Bàn & Check-in Bằng Ảnh QR
        </h2>
        <p class="text-muted small mb-0">
          Tải ảnh thẻ/mã QR do khách hàng xuất trình để hệ thống tự động giải mã và mở bàn tức thì
        </p>
      </div>

      <!-- Quick Search & Refresh -->
      <div class="d-flex gap-2 align-items-center">
        <div class="input-group input-group-sm" style="width: 240px;">
          <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input
            v-model="search"
            @keyup.enter="onSearch"
            type="text"
            class="form-control"
            placeholder="Tìm mã / tên / SĐT..."
          />
        </div>
        <button @click="fetchReservations" class="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-2xs">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- 1. Hub Tiếp Nhận & Check-in Bằng Ảnh QR -->
    <QRCheckInHub
      :matched-reservation="matchedReservation"
      :latest-confirmed-reservation="latestConfirmedReservation"
      :check-in-loading="checkInLoading"
      @code-scanned="handleCodeScanned"
      @check-in="handleCheckIn"
      @confirm-deposit="handleConfirmDeposit"
      @clear="activeCode = ''"
    />

    <!-- 2. Bảng Danh Sách Đơn Đặt Bàn -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
      <p class="text-muted small mt-2">Đang tải danh sách đặt bàn...</p>
    </div>

    <ReservationTable
      v-else
      :reservations="filteredReservations"
      :meta="meta"
      :active-reservation-id="matchedReservation?._id"
      @page-change="goPage"
      @open-qr="selectedResQR = $event"
      @check-in="handleCheckIn"
      @confirm-deposit="handleConfirmDeposit"
    />

    <!-- 3. Modal Xem / Tải QR của đơn -->
    <ReservationQRModal
      :reservation="selectedResQR"
      @close="selectedResQR = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSessionStore } from "../../stores/sessionStore";
import { useReservationStore } from "../../stores/reservationStore";
import { toast } from "../../composables/useToast";
import QRCheckInHub from "../../components/admin/reservation/QRCheckInHub.vue";
import ReservationTable from "../../components/admin/reservation/ReservationTable.vue";
import ReservationQRModal from "../../components/admin/reservation/ReservationQRModal.vue";

const sessionStore = useSessionStore();
const reservationStore = useReservationStore();

const loading = ref(false);
const checkInLoading = ref(false);
const activeCode = ref("");
const search = ref("");
const page = ref(1);
const selectedResQR = ref(null);
const directMatchedReservation = ref(null);

const reservations = computed(() => reservationStore.allReservations);
const meta = computed(() => reservationStore.reservationMeta);

const latestConfirmedReservation = computed(() => {
  return reservations.value.find((r) => r.status === "CONFIRMED") || reservations.value[0] || null;
});

const matchedReservation = computed(() => {
  if (directMatchedReservation.value) return directMatchedReservation.value;
  const code = activeCode.value.trim().toUpperCase();
  if (!code) return null;
  return reservations.value.find((r) => r.reservationCode?.toUpperCase() === code || r.customerPhone === code);
});

const filteredReservations = computed(() => {
  if (!activeCode.value) return reservations.value;
  const keyword = activeCode.value.trim().toUpperCase();
  return reservations.value.filter((r) => r.reservationCode?.includes(keyword) || r.customerPhone?.includes(keyword));
});

const fetchReservations = async () => {
  loading.value = true;
  try {
    await reservationStore.fetchAllReservations({ search: search.value, page: page.value, limit: 15 });
  } catch (err) {
    toast.error("Lỗi lấy danh sách đặt bàn: " + err.message);
  } finally {
    loading.value = false;
  }
};

const goPage = (p) => {
  if (p < 1 || p > meta.value.totalPages) return;
  page.value = p;
  fetchReservations();
};

const onSearch = () => {
  page.value = 1;
  fetchReservations();
};

const handleCodeScanned = async (code) => {
  activeCode.value = code;
  directMatchedReservation.value = null;

  if (!code) return;

  const cleanCode = code.trim().toUpperCase();
  const localFound = reservations.value.find(
    (r) => r.reservationCode?.toUpperCase() === cleanCode || r.customerPhone === cleanCode
  );
  if (localFound) {
    directMatchedReservation.value = localFound;
    return;
  }

  try {
    const res = await api.get(`/reservations/track/${encodeURIComponent(cleanCode)}`);
    if (res.data?.data?.reservation) {
      directMatchedReservation.value = res.data.data.reservation;
    }
  } catch (err) {
    console.warn("Không tìm thấy đơn đặt bàn:", err);
  }
};

const handleConfirmDeposit = async (reservation) => {
  try {
    await reservationStore.confirmDeposit(reservation._id);
    toast.success(`Đã xác nhận cọc ${reservation.depositAmount.toLocaleString('vi-VN')}đ cho ${reservation.reservationCode}`);
    await fetchReservations();
  } catch (err) {
    toast.error(err.message);
  }
};

const handleCheckIn = async (reservation) => {
  checkInLoading.value = true;
  try {
    const tableIds = reservation.tables && reservation.tables.length > 0
      ? reservation.tables.map((t) => t._id || t)
      : [];
    await sessionStore.checkInReservation(reservation._id, reservation.guestsCount, tableIds);
    toast.success(`Check-in mở bàn thành công cho khách hàng ${reservation.customerName}!`);
    await fetchReservations();
  } catch (err) {
    toast.error("Lỗi Check-in: " + err.message);
  } finally {
    checkInLoading.value = false;
  }
};

onMounted(() => {
  fetchReservations();
});
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
