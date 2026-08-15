<template>
  <div class="check-in-qr-card p-3 p-md-4 bg-white rounded-4 border border-danger border-opacity-40 text-center shadow-2xs">
    <div class="d-inline-flex align-items-center gap-1.5 px-3 py-1 bg-danger bg-opacity-10 text-danger rounded-pill fw-bold fs-8 mb-2">
      <i class="fa-solid fa-qrcode"></i>
      {{ isEnglish ? 'Check-in QR Pass' : 'Mã QR Check-in Nhận Bàn' }}
    </div>

    <h5 class="fw-bold text-dark mb-1 brand-font">
      {{ reservationCode }}
    </h5>

    <p v-if="showDescription" class="small text-muted mb-3 fs-8">
      {{ isEnglish
        ? 'Show this QR code at reception desk for instant 3-second check-in'
        : 'Xuất trình hoặc gửi ảnh mã QR này tại quầy để check-in nhận bàn trong 3 giây' }}
    </p>

    <!-- QR Image Box -->
    <div class="d-flex justify-content-center mb-3">
      <div class="p-2.5 bg-light rounded-4 border shadow-2xs d-inline-block">
        <img
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(reservationCode)}`"
          :alt="reservationCode"
          class="img-fluid rounded-3 bg-white p-2 border"
          :style="{ width: qrSize + 'px', height: qrSize + 'px' }"
        />
      </div>
    </div>

    <!-- Download Buttons -->
    <div class="d-flex justify-content-center gap-2 flex-wrap">
      <button
        type="button"
        @click="handleDownloadCard"
        class="btn btn-danger rounded-pill px-3 py-1.5 fw-semibold fs-8 shadow-sm"
        :disabled="downloading"
      >
        <i class="fa-solid fa-download me-1"></i>
        {{ downloading ? (isEnglish ? 'Generating...' : 'Đang tạo...') : (isEnglish ? 'Download Card (PNG)' : 'Tải Thẻ Check-in (PNG)') }}
      </button>

      <button
        type="button"
        @click="handleDownloadSimpleQR"
        class="btn btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold fs-8"
      >
        <i class="fa-solid fa-file-image me-1"></i>
        {{ isEnglish ? 'QR Only' : 'Tải Ảnh QR' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { downloadCheckInCard, downloadSimpleQR } from "../../../utils/qrHelper";
import { toast } from "../../../composables/useToast";

const props = defineProps({
  reservation: {
    type: Object,
    required: true,
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
  qrSize: {
    type: Number,
    default: 150,
  },
  showDescription: {
    type: Boolean,
    default: true,
  },
});

const reservationCode = props.reservation?.reservationCode || "";
const downloading = ref(false);

const handleDownloadCard = async () => {
  if (!props.reservation) return;
  downloading.value = true;
  try {
    const ok = await downloadCheckInCard(props.reservation);
    if (ok) {
      toast.success(props.isEnglish ? "Check-in Card downloaded!" : "Đã tải Thẻ Check-in QR thành công!");
    } else {
      toast.error(props.isEnglish ? "Failed to generate card image." : "Lỗi khi tạo ảnh thẻ Check-in.");
    }
  } catch (err) {
    toast.error(err.message || "Lỗi tải ảnh");
  } finally {
    downloading.value = false;
  }
};

const handleDownloadSimpleQR = async () => {
  if (!reservationCode) return;
  const ok = await downloadSimpleQR(reservationCode);
  if (ok) {
    toast.success(props.isEnglish ? "QR image downloaded!" : "Đã tải ảnh mã QR!");
  }
};
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
</style>
