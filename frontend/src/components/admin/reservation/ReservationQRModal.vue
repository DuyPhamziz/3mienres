<template>
  <div
    v-if="reservation"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0,0,0,0.5);"
    @click.self="$emit('close')"
  >
    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-header border-bottom py-3">
          <h6 class="modal-title fw-bold text-dark">
            <i class="fa-solid fa-qrcode text-danger me-2"></i>Mã QR Check-in: {{ reservation.reservationCode }}
          </h6>
          <button type="button" @click="$emit('close')" class="btn-close"></button>
        </div>
        <div class="modal-body text-center p-4">
          <div class="p-3 bg-light rounded-4 border d-inline-block mb-3">
            <img
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(reservation.reservationCode)}`"
              :alt="reservation.reservationCode"
              class="img-fluid rounded-3 bg-white p-2 border"
              style="width: 180px; height: 180px;"
            />
          </div>
          <h5 class="fw-bold text-danger mb-1 brand-font">{{ reservation.reservationCode }}</h5>
          <p class="small text-muted mb-3">
            Khách hàng: <strong>{{ reservation.customerName }}</strong> ({{ reservation.customerPhone }})
          </p>
          <div class="d-flex justify-content-center gap-2">
            <button
              @click="downloadCard"
              class="btn btn-danger rounded-pill px-3 py-1.5 fw-semibold btn-sm shadow-sm"
              :disabled="downloading"
            >
              <i class="fa-solid fa-download me-1"></i>
              {{ downloading ? 'Đang tạo...' : 'Tải Thẻ Check-in (PNG)' }}
            </button>
            <button
              @click="downloadSimple"
              class="btn btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold btn-sm"
            >
              Tải Ảnh QR
            </button>
          </div>
        </div>
      </div>
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
    default: null,
  },
});

defineEmits(["close"]);

const downloading = ref(false);

const downloadCard = async () => {
  if (!props.reservation) return;
  downloading.value = true;
  try {
    const ok = await downloadCheckInCard(props.reservation);
    if (ok) toast.success("Đã tải Thẻ Check-in QR!");
  } catch (err) {
    toast.error("Lỗi tải thẻ: " + err.message);
  } finally {
    downloading.value = false;
  }
};

const downloadSimple = async () => {
  if (!props.reservation?.reservationCode) return;
  const ok = await downloadSimpleQR(props.reservation.reservationCode);
  if (ok) toast.success("Đã tải ảnh mã QR!");
};
</script>
