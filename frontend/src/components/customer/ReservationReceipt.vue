<template>
  <div class="receipt-card bg-white rounded-4 border p-4 shadow-sm position-relative overflow-hidden">
    <!-- Top Accent Line -->
    <div class="receipt-top-bar"></div>

    <!-- Receipt Header -->
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <div class="receipt-icon-box">
          <i class="fa-solid fa-receipt text-success fs-6"></i>
        </div>
        <div>
          <div class="fw-bold text-dark fs-7 lh-sm text-uppercase">
            {{ isEnglish ? 'Electronic Receipt' : 'Hóa Đơn Thanh Toán' }}
          </div>
          <small class="text-muted fs-8" v-if="invoice?.invoiceCode">
            {{ invoice.invoiceCode }}
          </small>
        </div>
      </div>

      <!-- Status Pill -->
      <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5 fs-8 fw-bold border border-success border-opacity-25">
        <i class="fa-solid fa-circle-check me-1"></i>
        {{ isEnglish ? 'Paid & Completed' : 'Đã Thanh Toán Thành Công' }}
      </span>
    </div>

    <!-- Meta Info Row (Strip) -->
    <div class="p-2.5 bg-light rounded-3 d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 fs-8">
      <div class="d-flex align-items-center gap-1.5 text-muted">
        <i class="fa-regular fa-clock text-secondary"></i>
        <span>{{ invoice?.paidAt ? new Date(invoice.paidAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : (isEnglish ? 'Just now' : 'Vừa xong') }}</span>
      </div>

      <div class="d-flex align-items-center gap-1.5 text-muted">
        <i class="fa-solid fa-wallet text-secondary"></i>
        <span class="fw-semibold text-dark">{{ formatPaymentMethod(invoice?.paymentMethod) }}</span>
      </div>

      <div v-if="invoice?.cashier?.name" class="d-flex align-items-center gap-1.5 text-muted">
        <i class="fa-regular fa-user text-secondary"></i>
        <span>TN: <strong class="text-dark">{{ invoice.cashier.name }}</strong></span>
      </div>
    </div>

    <!-- Breakdown Calculation Table -->
    <div v-if="invoice" class="receipt-body">
      <div class="receipt-row d-flex justify-content-between align-items-center py-1.5">
        <span class="text-muted fs-8">{{ isEnglish ? 'Subtotal (Food & Drinks):' : 'Tổng tiền món ăn:' }}</span>
        <span class="text-dark fw-semibold fs-7">{{ (invoice.subtotal || 0).toLocaleString('vi-VN') }}đ</span>
      </div>

      <div v-if="invoice.discountAmount > 0" class="receipt-row d-flex justify-content-between align-items-center py-1.5 text-success">
        <span class="fs-8 d-flex align-items-center gap-1">
          <i class="fa-solid fa-tag fs-9"></i>
          {{ isEnglish ? 'Voucher Discount:' : 'Giảm giá / Voucher:' }}
          <small v-if="invoice.voucherCode" class="badge bg-success bg-opacity-10 text-success rounded px-1.5 py-0 fs-9">{{ invoice.voucherCode }}</small>
        </span>
        <span class="fw-semibold fs-7">-{{ (invoice.discountAmount || 0).toLocaleString('vi-VN') }}đ</span>
      </div>

      <div v-if="invoice.depositDeducted > 0" class="receipt-row d-flex justify-content-between align-items-center py-1.5 text-primary">
        <span class="fs-8 d-flex align-items-center gap-1">
          <i class="fa-solid fa-shield-check fs-9"></i>
          {{ isEnglish ? 'Deposit Deducted:' : 'Đã cấn trừ tiền cọc:' }}
        </span>
        <span class="fw-semibold fs-7">-{{ (invoice.depositDeducted || 0).toLocaleString('vi-VN') }}đ</span>
      </div>

      <div v-if="invoice.taxAmount > 0" class="receipt-row d-flex justify-content-between align-items-center py-1.5">
        <span class="text-muted fs-8">{{ isEnglish ? `VAT Tax (${invoice.taxPercent}%):` : `Thuế VAT (${invoice.taxPercent}%):` }}</span>
        <span class="text-dark fw-semibold fs-7">+{{ (invoice.taxAmount || 0).toLocaleString('vi-VN') }}đ</span>
      </div>

      <!-- Dashed Separator -->
      <div class="receipt-divider my-2"></div>

      <!-- Total Paid Box -->
      <div class="d-flex justify-content-between align-items-center p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-20 mt-2">
        <div>
          <div class="fw-bold text-dark fs-7 lh-sm">
            {{ isEnglish ? 'Total Amount Paid' : 'Tổng Thanh Toán Thực Tế' }}
          </div>
          <small class="text-muted fs-8" style="font-size: 0.68rem;">
            {{ isEnglish ? 'Includes VAT & deposit deduction' : 'Đã bao gồm thuế & khấu trừ tiền cọc' }}
          </small>
        </div>
        <div class="text-end">
          <strong class="text-success fs-4 brand-font d-block lh-1">
            {{ (invoice.finalAmount || 0).toLocaleString('vi-VN') }}đ
          </strong>
        </div>
      </div>
    </div>

    <!-- Fallback when completed without invoice object -->
    <div v-else class="text-center py-3 text-success fw-semibold fs-7">
      <i class="fa-solid fa-circle-check me-1"></i>
      {{ isEnglish ? 'Booking completed and paid.' : 'Đơn đặt bàn đã dùng bữa và thanh toán hoàn tất.' }}
    </div>

    <!-- Receipt Footer Note -->
    <div class="text-center text-muted fs-8 mt-3 pt-2 border-top" style="font-size: 0.7rem;">
      <i class="fa-solid fa-heart text-danger me-1 fs-9"></i>
      {{ isEnglish ? 'Thank you for dining at 3 Miền Cua Restaurant!' : 'Cảm ơn quý khách đã dùng bữa tại Nhà Hàng 3 Miền Cua!' }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  invoice: {
    type: Object,
    default: null,
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

const formatPaymentMethod = (method) => {
  const map = {
    CASH: props.isEnglish ? "Cash" : "Tiền mặt",
    CARD: props.isEnglish ? "Card" : "Quẹt thẻ",
    BANK_TRANSFER: props.isEnglish ? "Bank Transfer" : "Chuyển khoản",
    VNPAY: "VNPay QR",
    MOMO: "MoMo QR",
  };
  return map[method] || method || (props.isEnglish ? "Direct Payment" : "Thanh toán trực tiếp");
};
</script>

<style scoped>
.receipt-card {
  border: 1px solid #e2e8f0 !important;
  background-color: #ffffff;
}

.receipt-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.receipt-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.receipt-body {
  background: #ffffff;
}

.receipt-row {
  border-bottom: 1px dashed #f1f5f9;
}

.receipt-divider {
  border-top: 1.5px dashed #cbd5e1;
}
</style>
