<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-success">
            <i class="fa-solid fa-receipt me-2"></i>Thanh Toán Bàn {{ session?.tables?.map(t => t.tableNumber).join(' + ') }}
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label fw-semibold">Phương thức thanh toán</label>
            <select v-model="form.paymentMethod" class="form-select">
              <option value="CASH">Tiền mặt (CASH)</option>
              <option value="BANK_TRANSFER">Chuyển khoản (BANK_TRANSFER)</option>
              <option value="CARD">Quẹt thẻ (CARD)</option>
              <option value="MOMO">Ví MoMo</option>
              <option value="VNPAY">VNPay</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Mã voucher (nếu có)</label>
            <input v-model="form.voucherCode" type="text" class="form-control text-uppercase" placeholder="VD: GIAM10" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Tiền giảm giá (nếu có)</label>
            <input v-model.number="form.discountAmount" type="number" min="0" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Thuế VAT (%)</label>
            <input v-model.number="form.taxPercent" type="number" min="0" max="20" class="form-control" />
          </div>
          <div v-if="error" class="alert alert-danger small rounded-3">{{ error }}</div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Hủy</button>
          <button @click="$emit('submit', form)" class="btn btn-success rounded-pill px-4 fw-bold">
            Xác Nhận Thanh Toán & Giải Phóng Bàn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["close", "submit"]);

const form = reactive({
  paymentMethod: "CASH",
  discountAmount: 0,
  taxPercent: 8,
  voucherCode: "",
});
</script>
