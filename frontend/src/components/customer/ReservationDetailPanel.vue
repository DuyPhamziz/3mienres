<template>
  <div class="border-top" style="background: #f8fafc;">
    <!-- ═══ 1. TIMELINE TRẠNG THÁI ═══ -->
    <div class="px-4 pt-3 pb-2 border-bottom bg-white">
      <div v-if="r.status === 'CANCELLED'" class="text-center text-danger fw-bold small py-2 bg-danger bg-opacity-10 rounded-3">
        <i class="fa-solid fa-ban me-1"></i>
        {{ isEnglish ? 'This booking was cancelled' : 'Đơn đặt bàn này đã bị hủy' }}
      </div>
      <div v-else class="d-flex align-items-start">
        <div v-for="(step, idx) in FLOW" :key="step" class="d-flex flex-column align-items-center position-relative flex-grow-1">
          <div class="d-flex align-items-center w-100">
            <div :class="[
              'rounded-circle d-flex align-items-center justify-content-center flex-shrink-0',
              idx < currentFlowIndex(r.status) || r.status === 'COMPLETED' ? 'bg-success text-white' :
              idx === currentFlowIndex(r.status) ? 'bg-danger text-white' : 'bg-light border text-muted'
            ]" style="width: 32px; height: 32px; font-weight: 700;">
              <i v-if="idx < currentFlowIndex(r.status) || (r.status === 'COMPLETED' && idx === 3)" class="fa-solid fa-check fs-8"></i>
              <i v-else-if="idx === currentFlowIndex(r.status)" class="fa-solid fa-location-dot fs-8"></i>
              <span v-else class="fs-8">{{ idx + 1 }}</span>
            </div>
            <div v-if="idx < FLOW.length - 1" :class="[
              'flex-grow-1 mx-1',
              idx < currentFlowIndex(r.status) || r.status === 'COMPLETED' ? 'bg-success' : 'bg-light'
            ]" style="height: 3px;"></div>
          </div>
          <small :class="[
            'mt-1 fs-8 text-center',
            idx < currentFlowIndex(r.status) || (r.status === 'COMPLETED' && idx === 3) ? 'text-success fw-bold' :
            idx === currentFlowIndex(r.status) ? 'text-danger fw-bold' : 'text-muted'
          ]">{{ flowStepLabel(step) }}</small>
        </div>
      </div>
    </div>

    <div class="row g-0">
      <!-- ═══ CỘT TRÁI: QR CHECK-IN & TIỀN CỌC ═══ -->
      <div class="col-md-5 p-3 p-md-4 border-bottom border-md-bottom-0 border-md-end">
        <!-- QR Check-in Pass Card Component -->
        <div class="mb-3">
          <CheckInQRCard
            :reservation="r"
            :isEnglish="isEnglish"
            :qrSize="130"
            :showDescription="false"
          />
        </div>

        <!-- Deposit Info -->
        <div v-if="r.depositAmount > 0" class="p-3 rounded-4 border mb-3"
             :class="r.depositStatus === 'PAID' ? 'bg-success bg-opacity-10 border-success' : 'bg-warning bg-opacity-10 border-warning'">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <span class="d-flex align-items-center gap-1.5 small text-dark fw-bold">
              <i :class="r.depositStatus === 'PAID' ? 'fa-solid fa-circle-check text-success' : 'fa-solid fa-hourglass-half text-warning'"></i>
              {{ isEnglish ? 'Deposit:' : 'Tiền cọc:' }}
            </span>
            <strong :class="r.depositStatus === 'PAID' ? 'text-success' : 'text-warning'">
              {{ (r.depositAmount || 0).toLocaleString('vi-VN') }}đ
            </strong>
          </div>
          <small :class="r.depositStatus === 'PAID' ? 'text-success' : 'text-warning'" class="fw-semibold d-block">
            {{ r.depositStatus === 'PAID'
                ? (isEnglish ? 'Deposit Confirmed' : 'Đã xác nhận nộp cọc')
                : (isEnglish ? 'Pending deposit confirmation' : 'Chờ xác nhận cọc') }}
          </small>
          <button
            v-if="r.depositStatus === 'UNPAID' && r.depositAmount > 0 && r.status !== 'CANCELLED'"
            @click="$emit('demo-deposit', r)"
            class="btn btn-warning btn-sm rounded-pill fw-bold w-100 mt-2 shadow-2xs text-dark"
            style="font-size: 0.72rem;"
          >
            <i class="fa-solid fa-bolt me-1"></i> [⚡ DEMO] Giả Lập Nộp Cọc
          </button>
        </div>

        <!-- Action Buttons -->
        <div v-if="r.status === 'CONFIRMED' || r.status === 'PENDING'" class="d-flex flex-column gap-2 mt-3">
          <button @click="$emit('reschedule', r)" class="btn btn-outline-primary rounded-pill fw-semibold btn-sm">
            <i class="fa-solid fa-calendar-days me-1"></i>
            {{ isEnglish ? 'Reschedule' : 'Dời Lịch' }}
          </button>
          <button @click="$emit('cancel', r)" class="btn btn-outline-danger rounded-pill fw-semibold btn-sm">
            <i class="fa-solid fa-ban me-1"></i>
            {{ isEnglish ? 'Cancel Booking' : 'Hủy Đặt Bàn' }}
          </button>
        </div>
      </div>

      <!-- ═══ CỘT PHẢI: THÔNG TIN, MÓN ĐẶT TRƯỚC, ORDER & HÓA ĐƠN ═══ -->
      <div class="col-md-7 p-3 p-md-4">
        <!-- 1. Thông Tin Đặt Bàn -->
        <h6 class="fw-bold text-dark mb-2.5">
          <i class="fa-solid fa-circle-info text-danger me-2"></i>
          {{ isEnglish ? 'Booking Details' : 'Thông Tin Đặt Bàn' }}
        </h6>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <div class="p-2.5 bg-white rounded-3 border">
              <small class="text-muted d-block fs-8">{{ isEnglish ? 'Guest Name' : 'Tên khách' }}</small>
              <strong class="text-dark fs-7">{{ r.customerName }}</strong>
            </div>
          </div>
          <div class="col-6">
            <div class="p-2.5 bg-white rounded-3 border">
              <small class="text-muted d-block fs-8">{{ isEnglish ? 'Phone' : 'Điện thoại' }}</small>
              <strong class="text-dark fs-7">{{ r.customerPhone }}</strong>
            </div>
          </div>
          <div class="col-6">
            <div class="p-2.5 bg-white rounded-3 border">
              <small class="text-muted d-block fs-8">{{ isEnglish ? 'Guests' : 'Số khách' }}</small>
              <strong class="text-dark fs-7">{{ r.guestsCount }} {{ isEnglish ? 'pax' : 'người' }}</strong>
            </div>
          </div>
          <div class="col-6" v-if="r.tables && r.tables.length">
            <div class="p-2.5 bg-white rounded-3 border">
              <small class="text-muted d-block fs-8">{{ isEnglish ? 'Tables' : 'Bàn đặt trước' }}</small>
              <strong class="text-dark fs-7">{{ r.tables.map(t => (isEnglish ? 'T.' : 'Bàn ') + t.tableNumber).join(' + ') }}</strong>
            </div>
          </div>
          <div class="col-12" v-if="r.specialRequest || r.notes">
            <div class="p-2.5 bg-white rounded-3 border">
              <small class="text-muted d-block fs-8">{{ isEnglish ? 'Special Request' : 'Ghi chú đặc biệt' }}</small>
              <small class="text-dark">{{ r.specialRequest || r.notes }}</small>
            </div>
          </div>
        </div>

        <!-- 2. Danh Sách Món Đặt Trước (Pre-order) -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-dark mb-0">
              <i class="fa-solid fa-utensils text-warning me-2"></i>
              {{ isEnglish ? 'Pre-ordered Dishes' : 'Món Đặt Trước (Pre-order)' }}
            </h6>
            <span v-if="r.preOrderDishes && r.preOrderDishes.length" class="badge bg-warning bg-opacity-10 text-warning-emphasis rounded-pill px-2.5 fs-8">
              {{ r.preOrderDishes.length }} {{ isEnglish ? 'dishes' : 'món' }}
            </span>
          </div>

          <div v-if="r.preOrderDishes && r.preOrderDishes.length > 0" class="bg-white rounded-4 border p-3 shadow-2xs">
            <div class="d-flex flex-column gap-2">
              <div v-for="(item, idx) in r.preOrderDishes" :key="idx"
                   class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light bg-opacity-50">
                <div class="d-flex align-items-center gap-2.5">
                  <img
                    :src="getImageUrl(item.dish?.image)"
                    :alt="item.dish?.name"
                    class="rounded-3 object-fit-cover flex-shrink-0"
                    style="width: 44px; height: 44px;"
                    onerror="this.src='/images/dishes/default-dish.jpg'"
                  />
                  <div>
                    <div class="fw-bold text-dark fs-7 lh-sm">{{ item.dish?.name || (isEnglish ? 'Dish' : 'Món ăn') }}</div>
                    <small class="text-muted fs-8">
                      {{ (item.priceAtBooking || item.dish?.price || 0).toLocaleString('vi-VN') }}đ × {{ item.quantity }}
                    </small>
                  </div>
                </div>
                <div class="text-end">
                  <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-0.5 fs-8 me-1">x{{ item.quantity }}</span>
                  <strong class="text-danger fs-7">
                    {{ ((item.priceAtBooking || item.dish?.price || 0) * item.quantity).toLocaleString('vi-VN') }}đ
                  </strong>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center pt-2.5 mt-2 border-top">
              <span class="text-muted small fw-semibold">{{ isEnglish ? 'Pre-order Subtotal:' : 'Tổng tiền món đặt trước:' }}</span>
              <span class="text-danger fw-bold fs-6">
                {{ r.preOrderDishes.reduce((sum, item) => sum + (item.priceAtBooking || item.dish?.price || 0) * item.quantity, 0).toLocaleString('vi-VN') }}đ
              </span>
            </div>
          </div>

          <div v-else class="bg-white rounded-4 border p-3 text-center text-muted small">
            <i class="fa-solid fa-circle-info me-1 text-secondary"></i>
            {{ isEnglish ? 'No pre-ordered dishes for this booking.' : 'Không có món đặt trước khi tạo đơn đặt bàn này.' }}
          </div>
        </div>

        <!-- 3. Danh Sách Món Gọi Tại Bàn (Dine-in Orders) -->
        <div v-if="r.orders && r.orders.length > 0" class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-dark mb-0">
              <i class="fa-solid fa-fire-burner text-danger me-2"></i>
              {{ isEnglish ? 'Dine-in Orders' : 'Món Đã Gọi Dùng Bữa Tại Bàn' }}
            </h6>
            <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2.5 fs-8">
              {{ r.orders.length }} {{ isEnglish ? 'order round(s)' : 'đợt gọi' }}
            </span>
          </div>

          <div class="d-flex flex-column gap-2">
            <div v-for="order in r.orders" :key="order._id" class="p-3 bg-white rounded-4 border shadow-2xs">
              <div class="d-flex justify-content-between align-items-center mb-2 pb-1.5 border-bottom">
                <span class="badge bg-light text-dark border fs-8 fw-semibold">
                  <i class="fa-solid fa-receipt me-1 text-muted"></i>{{ order.orderCode }}
                </span>
                <span :class="['badge rounded-pill fs-8 px-2.5 py-1', orderStatusClass(order.status)]">
                  <i class="fa-solid me-1" :class="order.status === 'SERVED' ? 'fa-circle-check' : order.status === 'PREPARING' ? 'fa-fire-burner' : 'fa-hourglass-half'"></i>
                  {{ orderStatusLabel(order.status) }}
                </span>
              </div>

              <div class="d-flex flex-column gap-1.5">
                <div v-for="(item, i) in order.items" :key="i" class="d-flex align-items-center justify-content-between py-1">
                  <div class="d-flex align-items-center gap-2">
                    <img
                      :src="getImageUrl(item.dish?.image)"
                      :alt="item.dish?.name"
                      class="rounded-2 object-fit-cover flex-shrink-0"
                      style="width: 32px; height: 32px;"
                      onerror="this.src='/images/dishes/default-dish.jpg'"
                    />
                    <span class="text-dark fs-7 fw-medium">{{ item.dish?.name || (isEnglish ? 'Dish' : 'Món') }}</span>
                  </div>
                  <div class="text-end">
                    <span class="text-muted fs-8 me-2">x{{ item.quantity }}</span>
                    <small class="text-dark fw-semibold">
                      {{ ((item.dish?.price || item.price || 0) * item.quantity).toLocaleString('vi-VN') }}đ
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Hóa Đơn Thanh Toán (Luxury E-Receipt) -->
        <ReservationReceipt
          v-if="r.invoice || r.status === 'COMPLETED'"
          :invoice="r.invoice"
          :isEnglish="isEnglish"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl } from "../../utils/imageHelper";
import CheckInQRCard from "./reservation/CheckInQRCard.vue";
import ReservationReceipt from "./ReservationReceipt.vue";

const props = defineProps({
  r: {
    type: Object,
    required: true,
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["demo-deposit", "reschedule", "cancel"]);

const FLOW = ["PENDING", "CONFIRMED", "ARRIVED", "COMPLETED"];

const flowStepLabel = (key) => ({
  PENDING: props.isEnglish ? "Pending" : "Chờ Xác Nhận",
  CONFIRMED: props.isEnglish ? "Confirmed" : "Đã Xác Nhận",
  ARRIVED: props.isEnglish ? "Seated" : "Đã Vào Bàn",
  COMPLETED: props.isEnglish ? "Paid" : "Đã Thanh Toán",
})[key];

const currentFlowIndex = (status) => {
  const idx = FLOW.indexOf(status);
  return idx === -1 ? 0 : idx;
};

const orderStatusClass = (s) => ({
  PENDING: "bg-warning text-dark",
  PREPARING: "bg-danger text-white",
  SERVED: "bg-success text-white",
  CANCELLED: "bg-secondary text-white",
})[s] || "bg-secondary text-white";

const orderStatusLabel = (s) => ({
  PENDING: props.isEnglish ? "Pending" : "Chờ Chế Biến",
  PREPARING: props.isEnglish ? "Preparing" : "Đang Chế Biến",
  SERVED: props.isEnglish ? "Served" : "Đã Phục Vụ",
  CANCELLED: props.isEnglish ? "Cancelled" : "Đã Hủy",
})[s] || s;
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
</style>
