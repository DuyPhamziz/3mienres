<template>
  <div class="invoice-print-page bg-light min-vh-100 py-4">
    <div class="container">
      <div class="no-print d-flex justify-content-between align-items-center mb-3">
        <router-link to="/admin/pos" class="btn btn-outline-secondary rounded-pill px-3">
          <i class="fa-solid fa-arrow-left me-1"></i> Quay Lại
        </router-link>
        <button @click="printInvoice" class="btn btn-danger rounded-pill px-4 fw-bold">
          <i class="fa-solid fa-print me-1"></i> In Hóa Đơn
        </button>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger"></div>
      </div>

      <div v-else-if="invoice" class="invoice-sheet bg-white rounded-4 shadow-lg mx-auto p-4 p-md-5" style="max-width: 720px;">
        <!-- Header -->
        <div class="text-center border-bottom pb-3 mb-3">
          <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
            <i class="fa-solid fa-utensils text-danger fs-3"></i>
            <h3 class="fw-bold brand-font text-danger mb-0">NHÀ HÀNG 3 MIỀN CUA</h3>
          </div>
          <p class="small text-muted mb-1">Ẩm thực đặc sản Bắc – Trung – Nam</p>
          <p class="small text-muted mb-0">Hotline: 1900 1234</p>
        </div>

        <div class="d-flex justify-content-between mb-3">
          <div>
            <div class="small text-muted">HÓA ĐƠN THANH TOÁN</div>
            <strong class="text-danger fs-5">{{ invoice.invoiceCode }}</strong>
          </div>
          <div class="text-end">
            <div class="small text-muted">Ngày thanh toán</div>
            <strong>{{ invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('vi-VN') : 'Chưa thanh toán' }}</strong>
          </div>
        </div>

        <!-- Thông tin khách -->
        <div class="row g-2 mb-3 p-3 bg-light rounded-3">
          <div class="col-6">
            <span class="small text-muted d-block">Khách hàng</span>
            <strong>{{ invoice.diningSession?.customerName }}</strong>
          </div>
          <div class="col-6">
            <span class="small text-muted d-block">Bàn</span>
            <strong>{{ tableNumbers }}</strong>
          </div>
          <div class="col-6">
            <span class="small text-muted d-block">Mã phiên</span>
            <strong>{{ invoice.diningSession?.sessionCode }}</strong>
          </div>
          <div class="col-6">
            <span class="small text-muted d-block">Thu ngân</span>
            <strong>{{ invoice.cashier?.name || '—' }}</strong>
          </div>
        </div>

        <!-- Danh sách món -->
        <table class="table table-sm align-middle mb-3">
          <thead class="table-light">
            <tr class="small text-muted">
              <th>Món ăn</th>
              <th class="text-center">SL</th>
              <th class="text-end">Đơn giá</th>
              <th class="text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="order in invoice.orders" :key="order._id">
              <tr v-for="item in order.items" :key="item._id">
                <td>{{ item.dish?.name || 'Món' }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-end">{{ item.price.toLocaleString('vi-VN') }}đ</td>
                <td class="text-end fw-semibold">{{ (item.price * item.quantity).toLocaleString('vi-VN') }}đ</td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Tổng tiền -->
        <div class="border-top pt-3">
          <div class="d-flex justify-content-between small mb-1">
            <span class="text-muted">Tạm tính</span>
            <strong>{{ invoice.subtotal.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div v-if="invoice.discountAmount > 0" class="d-flex justify-content-between small mb-1">
            <span class="text-muted">Giảm giá</span>
            <strong class="text-success">-{{ invoice.discountAmount.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div v-if="invoice.taxAmount > 0" class="d-flex justify-content-between small mb-1">
            <span class="text-muted">Thuế VAT ({{ invoice.taxPercent }}%)</span>
            <strong>{{ invoice.taxAmount.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div v-if="invoice.depositDeducted > 0" class="d-flex justify-content-between small mb-1">
            <span class="text-muted">Trừ tiền cọc</span>
            <strong class="text-success">-{{ invoice.depositDeducted.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
            <strong>TỔNG THANH TOÁN</strong>
            <strong class="text-danger fs-4">{{ invoice.finalAmount.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div class="text-center small text-muted mt-2">
            Phương thức: {{ paymentMethodLabel }}
          </div>
        </div>

        <div class="text-center mt-4 pt-3 border-top">
          <p class="small text-muted mb-1">Cảm ơn quý khách đã dùng bữa tại 3 Miền Cua!</p>
          <p class="small text-muted mb-0">Hẹn gặp lại quý khách lần sau.</p>
        </div>
      </div>

      <div v-else class="text-center py-5 text-muted">Không tìm thấy hóa đơn</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const route = useRoute();
const invoice = ref(null);
const loading = ref(false);

const tableNumbers = computed(() => {
  const tables = invoice.value?.diningSession?.tables || [];
  return tables.map((t) => t.tableNumber).join(' + ') || '—';
});

const paymentMethodLabel = computed(() => {
  const map = {
    CASH: "Tiền mặt",
    CARD: "Thẻ",
    BANK_TRANSFER: "Chuyển khoản",
    MOMO: "Ví MoMo",
    VNPAY: "VNPay",
  };
  return map[invoice.value?.paymentMethod] || invoice.value?.paymentMethod;
});

const printInvoice = () => window.print();

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.get(`/invoices/session/${route.params.sessionId}`);
    invoice.value = res.data.data.invoice;
  } catch (err) {
    toast.error("Không tải được hóa đơn: " + err.message);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  .invoice-sheet {
    box-shadow: none !important;
    max-width: 100% !important;
  }
  body {
    background: #fff !important;
  }
}
</style>
