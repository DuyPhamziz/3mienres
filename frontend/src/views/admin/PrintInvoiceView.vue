<template>
  <div class="invoice-print-page bg-light min-vh-100 py-4">
    <div class="container">
      <div class="no-print d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <router-link to="/admin/pos" class="btn btn-outline-secondary rounded-pill px-3">
          <i class="fa-solid fa-arrow-left me-1"></i> Quay Lại POS
        </router-link>

        <div class="d-flex align-items-center gap-2">
          <!-- Chuyển đổi khổ in -->
          <div class="btn-group btn-group-sm rounded-pill border bg-white p-1">
            <button
              @click="paperFormat = 'A4'"
              :class="['btn rounded-pill px-3', paperFormat === 'A4' ? 'btn-danger' : 'btn-light border-0 text-secondary']"
            >
              Khổ Tiêu Chuẩn (A4/A5)
            </button>
            <button
              @click="paperFormat = 'K80'"
              :class="['btn rounded-pill px-3', paperFormat === 'K80' ? 'btn-danger' : 'btn-light border-0 text-secondary']"
            >
              🧾 Máy In Nhiệt K80 (80mm)
            </button>
          </div>

          <button @click="printInvoice" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm">
            <i class="fa-solid fa-print me-1"></i> In Hóa Đơn
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger"></div>
      </div>

      <!-- Khung Hóa Đơn -->
      <div
        v-else-if="invoice"
        :class="['invoice-sheet bg-white rounded-4 shadow-lg mx-auto p-4', paperFormat === 'K80' ? 'k80-format' : 'standard-format']"
      >
        <!-- Header -->
        <div class="text-center pb-3 mb-3 border-bottom" :class="paperFormat === 'K80' ? 'border-dashed' : ''">
          <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
            <i class="fa-solid fa-utensils text-danger" :class="paperFormat === 'K80' ? 'fs-5' : 'fs-3'"></i>
            <h4 class="fw-bold brand-font text-danger mb-0" :class="paperFormat === 'K80' ? 'fs-6' : ''">
              NHÀ HÀNG 3 MIỀN CUA
            </h4>
          </div>
          <p class="small text-muted mb-0" :style="paperFormat === 'K80' ? 'font-size: 0.72rem;' : ''">
            Đặc sản Hải Sản & Ẩm Thực 3 Miền
          </p>
          <p class="small text-muted mb-0" :style="paperFormat === 'K80' ? 'font-size: 0.72rem;' : ''">
            Hotline: 1900 1234 · 3miencua.vn
          </p>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div class="small text-muted" :style="paperFormat === 'K80' ? 'font-size: 0.7rem;' : ''">PHIẾU THANH TOÁN</div>
            <strong class="text-danger" :class="paperFormat === 'K80' ? 'fs-7' : 'fs-5'">{{ invoice.invoiceCode }}</strong>
          </div>
          <div class="text-end">
            <div class="small text-muted" :style="paperFormat === 'K80' ? 'font-size: 0.7rem;' : ''">Giờ in</div>
            <strong :style="paperFormat === 'K80' ? 'font-size: 0.75rem;' : ''">
              {{ invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN') }}
            </strong>
          </div>
        </div>

        <!-- Thông tin khách & Bàn -->
        <div class="p-2.5 bg-light rounded-3 mb-3" :style="paperFormat === 'K80' ? 'font-size: 0.75rem;' : ''">
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">Khách: <strong>{{ invoice.diningSession?.customerName }}</strong></span>
            <span class="text-muted">Bàn: <strong class="text-danger">{{ tableNumbers }}</strong></span>
          </div>
          <div class="d-flex justify-content-between">
            <span class="text-muted">Mã bàn: {{ invoice.diningSession?.sessionCode }}</span>
            <span class="text-muted">Thu ngân: {{ invoice.cashier?.name || 'Admin' }}</span>
          </div>
        </div>

        <!-- Danh sách món -->
        <table class="table table-sm align-middle mb-3" :style="paperFormat === 'K80' ? 'font-size: 0.75rem;' : ''">
          <thead class="table-light">
            <tr class="small text-muted">
              <th>Món</th>
              <th class="text-center">SL</th>
              <th class="text-end">Đơn Giá</th>
              <th class="text-end">T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="order in invoice.orders" :key="order._id">
              <tr v-for="item in order.items" :key="item._id">
                <td><strong class="text-dark">{{ item.dish?.name || 'Món' }}</strong></td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-end text-muted">{{ item.price.toLocaleString('vi-VN') }}</td>
                <td class="text-end fw-bold">{{ (item.price * item.quantity).toLocaleString('vi-VN') }}</td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Tổng tiền -->
        <div class="border-top pt-2" :class="paperFormat === 'K80' ? 'border-dashed' : ''" :style="paperFormat === 'K80' ? 'font-size: 0.78rem;' : ''">
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted">Tạm tính:</span>
            <strong>{{ invoice.subtotal.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div v-if="invoice.discountAmount > 0" class="d-flex justify-content-between mb-1 text-success">
            <span>Giảm giá:</span>
            <strong>-{{ invoice.discountAmount.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div v-if="invoice.taxAmount > 0" class="d-flex justify-content-between mb-1">
            <span class="text-muted">VAT ({{ invoice.taxPercent }}%):</span>
            <strong>+{{ invoice.taxAmount.toLocaleString('vi-VN') }}đ</strong>
          </div>
          <div v-if="invoice.depositDeducted > 0" class="d-flex justify-content-between mb-1 text-success">
            <span>Trừ cọc trước:</span>
            <strong>-{{ invoice.depositDeducted.toLocaleString('vi-VN') }}đ</strong>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top" :class="paperFormat === 'K80' ? 'border-dashed' : ''">
            <strong :class="paperFormat === 'K80' ? 'fs-7' : 'fs-6'">TỔNG THANH TOÁN:</strong>
            <strong class="text-danger" :class="paperFormat === 'K80' ? 'fs-5' : 'fs-4'">
              {{ invoice.finalAmount.toLocaleString('vi-VN') }}đ
            </strong>
          </div>
          <div class="text-center text-muted mt-2" :style="paperFormat === 'K80' ? 'font-size: 0.72rem;' : 'font-size: 0.85rem;'">
            Phương thức: <strong>{{ paymentMethodLabel }}</strong>
          </div>
        </div>

        <div class="text-center mt-4 pt-3 border-top" :class="paperFormat === 'K80' ? 'border-dashed' : ''">
          <p class="mb-1 fw-semibold text-dark" :style="paperFormat === 'K80' ? 'font-size: 0.75rem;' : 'font-size: 0.85rem;'">
            Cảm ơn quý khách đã dùng bữa tại 3 Miền Cua!
          </p>
          <p class="text-muted mb-0" :style="paperFormat === 'K80' ? 'font-size: 0.68rem;' : 'font-size: 0.8rem;'">
            Hân hạnh được đón tiếp quý khách lần sau.
          </p>
        </div>
      </div>

      <div v-else class="text-center py-5 text-muted">Không tìm thấy hóa đơn này</div>
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
const paperFormat = ref("K80"); // Mặc định máy in nhiệt K80

const tableNumbers = computed(() => {
  const tables = invoice.value?.diningSession?.tables || [];
  return tables.map((t) => t.tableNumber).join(" + ") || "—";
});

const paymentMethodLabel = computed(() => {
  const map = {
    CASH: "Tiền mặt tại quầy",
    CARD: "Thẻ POS",
    BANK_TRANSFER: "Chuyển khoản VietQR",
    TRANSFER: "Chuyển khoản VietQR",
    MOMO: "Ví MoMo",
    VNPAY: "VNPay",
  };
  return map[invoice.value?.paymentMethod] || invoice.value?.paymentMethod || "Tiền mặt";
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
.standard-format {
  max-width: 720px;
}
.k80-format {
  max-width: 380px;
  font-family: 'Courier New', Courier, monospace;
}
.border-dashed {
  border-style: dashed !important;
}

@media print {
  .no-print {
    display: none !important;
  }
  .invoice-sheet {
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 auto !important;
  }
  .k80-format {
    width: 80mm !important;
    max-width: 80mm !important;
    font-size: 11px !important;
  }
  body {
    background: #fff !important;
  }
}
</style>
