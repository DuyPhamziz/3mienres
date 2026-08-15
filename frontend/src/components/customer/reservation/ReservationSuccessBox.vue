<template>
  <div class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5 text-center mb-5 border-success shadow-lg bg-white">
    <!-- Success Badge & Title -->
    <div class="badge bg-success px-3 py-2 rounded-pill fs-7 mb-3">
      <i class="fa-solid fa-circle-check me-1"></i> {{ isEnglish ? 'BOOKING SUCCESSFUL' : 'ĐẶT BÀN THÀNH CÔNG' }}
    </div>
    <h2 class="brand-font text-success mb-2">
      {{ isEnglish ? 'Booking Code:' : 'Mã Đặt Bàn:' }} {{ successData.data.reservation.reservationCode }}
    </h2>
    <p class="text-muted mb-4">
      {{ isEnglish ? '3 Miền Cua Restaurant has registered booking for:' : 'Nhà hàng 3 Miền Cua đã ghi nhận giữ chỗ cho Anh/Chị' }}
      <strong>{{ successData.data.reservation.customerName }}</strong>!
    </p>

    <!-- Dynamic Combination Notice -->
    <div v-if="successData.isCombinedTable" class="alert alert-warning rounded-4 p-3 mb-4 text-start">
      <div class="d-flex align-items-center gap-3">
        <i class="fa-solid fa-puzzle-piece fs-3 text-warning"></i>
        <div>
          <strong class="d-block text-dark">{{ isEnglish ? 'Auto table combination notice:' : 'Thông báo ghép bàn tự động:' }}</strong>
          <small class="text-secondary">
            {{ isEnglish ? `For group of ${successData.data.reservation.guestsCount} guests, system automatically combined adjacent tables!` : `Vì đoàn ${successData.data.reservation.guestsCount} người khá đông, hệ thống đã tự động ghép cụm bàn kề nhau cho bạn!` }}
          </small>
        </div>
      </div>
    </div>

    <!-- Check-in QR Pass Component -->
    <div class="mb-4">
      <CheckInQRCard
        :reservation="successData.data.reservation"
        :isEnglish="isEnglish"
        :qrSize="160"
      />
    </div>

    <!-- VietQR Deposit Payment Box -->
    <div v-if="successData.deposit && successData.deposit.amount > 0" class="p-4 bg-light rounded-4 border mb-4">
      <h5 class="fw-bold brand-font text-danger mb-2">
        <i class="fa-solid fa-money-bill-transfer me-2"></i>{{ isEnglish ? 'Pay Table & Dish Deposit' : 'Thanh Toán Cọc Giữ Bàn & Món Ăn' }}
      </h5>
      <p class="small text-muted mb-3">
        {{ isEnglish ? `Please scan VietQR code below using Banking app to pay deposit of ${successData.deposit.amount.toLocaleString('vi-VN')}đ` : `Vui lòng quét Mã QR bên dưới bằng ứng dụng Ngân hàng để nộp tiền cọc ${successData.deposit.amount.toLocaleString('vi-VN')}đ` }}
      </p>
      
      <img
        v-if="successData.deposit.qrCodeUrl"
        :src="successData.deposit.qrCodeUrl"
        alt="Mã QR VietQR Đặt Cọc"
        class="img-fluid rounded-3 border shadow-sm mb-3"
        style="max-width: 260px;"
      />

      <div class="small text-secondary bg-white p-3 rounded-3 border text-start mb-3">
        <p class="mb-1"><strong>{{ isEnglish ? 'Bank:' : 'Ngân hàng nhận:' }}</strong> {{ successData.deposit.bankInfo.bankId }} - {{ successData.deposit.bankInfo.accountName }}</p>
        <p class="mb-1"><strong>{{ isEnglish ? 'Account No:' : 'Số tài khoản:' }}</strong> {{ successData.deposit.bankInfo.accountNo }}</p>
        <p class="mb-0"><strong>{{ isEnglish ? 'Transfer Note:' : 'Nội dung chuyển khoản:' }}</strong> <span class="text-danger fw-bold">COC {{ successData.data.reservation.reservationCode }}</span></p>
      </div>

      <!-- Nút Giả lập Nộp Cọc Demo -->
      <button
        type="button"
        @click="$emit('demo-deposit')"
        class="btn btn-warning rounded-pill px-4 py-2.5 fw-bold shadow-sm w-100 text-dark"
      >
        <i class="fa-solid fa-bolt me-1"></i> [⚡ DEMO TEST] Giả Lập Nộp Cọc Thành Công
      </button>
    </div>

    <!-- Navigation Buttons -->
    <div class="d-flex justify-content-center gap-3 flex-wrap">
      <router-link to="/" class="btn btn-primary-crab rounded-pill px-4 fw-bold">
        <i class="fa-solid fa-house me-1"></i> {{ isEnglish ? 'Back to Home' : 'Về Trang Chủ' }}
      </router-link>
      <router-link :to="`/tra-cuu?code=${successData.data.reservation.reservationCode}`" class="btn btn-outline-danger rounded-pill px-4 fw-semibold">
        {{ isEnglish ? 'View Status' : 'Xem Trạng Thái Đơn' }}
      </router-link>
      <button @click="$emit('reset')" class="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
        {{ isEnglish ? 'Book Another Table' : 'Đặt Thêm Đơn Khác' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import CheckInQRCard from "./CheckInQRCard.vue";

defineProps({
  successData: {
    type: Object,
    required: true,
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["demo-deposit", "reset"]);
</script>
