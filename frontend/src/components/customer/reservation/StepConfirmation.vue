<template>
  <div class="wizard-panel">
    <h4 class="fw-bold text-danger brand-font mb-4 d-flex align-items-center gap-2">
      <i class="fa-solid fa-clipboard-check"></i>
      {{ isEnglish ? 'Step 4: Review Booking & Special Requests' : 'Bước 4: Xem Lại & Hoàn Tất Đơn Đặt Bàn' }}
    </h4>

    <div class="row g-4 mb-4">
      <!-- Left: Summary Info -->
      <div class="col-lg-7">
        <div class="p-4 bg-light rounded-4 border mb-4">
          <h6 class="fw-bold text-dark mb-3">
            <i class="fa-solid fa-circle-info text-danger me-2"></i>{{ isEnglish ? 'Reservation Overview' : 'Tóm Tắt Đơn Đặt Bàn' }}
          </h6>

          <div class="row g-2 mb-3">
            <div class="col-sm-6">
              <div class="p-2.5 bg-white rounded-3 border">
                <small class="text-muted d-block fs-8">{{ isEnglish ? 'Customer Name' : 'Tên người đặt' }}</small>
                <strong class="text-dark fs-7">{{ form.customerName }}</strong>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="p-2.5 bg-white rounded-3 border">
                <small class="text-muted d-block fs-8">{{ isEnglish ? 'Phone Number' : 'Số điện thoại' }}</small>
                <strong class="text-dark fs-7">{{ form.customerPhone }}</strong>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="p-2.5 bg-white rounded-3 border">
                <small class="text-muted d-block fs-8">{{ isEnglish ? 'Dining Time' : 'Thời gian dùng bữa' }}</small>
                <strong class="text-dark fs-7">{{ form.startAt ? new Date(form.startAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '---' }}</strong>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="p-2.5 bg-white rounded-3 border">
                <small class="text-muted d-block fs-8">{{ isEnglish ? 'Guests' : 'Số khách' }}</small>
                <strong class="text-dark fs-7">{{ form.guestsCount }} {{ isEnglish ? 'pax' : 'người' }}</strong>
              </div>
            </div>
            <div class="col-12" v-if="selectedTables.length > 0">
              <div class="p-2.5 bg-white rounded-3 border">
                <small class="text-muted d-block fs-8">{{ isEnglish ? 'Assigned Tables' : 'Bàn đã chọn' }}</small>
                <strong class="text-danger fs-7">{{ selectedTables.map(t => 'Bàn ' + t.tableNumber).join(' + ') }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Special Request / Notes -->
        <div class="mb-4">
          <label class="form-label fw-semibold fs-7 text-dark">
            <i class="fa-solid fa-comment-dots text-danger me-1"></i>
            {{ isEnglish ? 'Special Request / Notes' : 'Ghi chú đặc biệt (Trang trí tiệc, ghế trẻ em, dị ứng...)' }}
          </label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="form-control fs-7 rounded-3"
            :placeholder="isEnglish ? 'E.g: Birthday decor, baby chair, window seat...' : 'Ví dụ: Cần ghế trẻ em, trang trí sinh nhật, bàn gần cửa sổ...'"
          ></textarea>
        </div>
      </div>

      <!-- Right: Deposit Breakdown Box -->
      <div class="col-lg-5">
        <div class="p-4 rounded-4 border bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
          <div>
            <h6 class="fw-bold text-danger mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <i class="fa-solid fa-shield-halved"></i>
              {{ isEnglish ? 'Deposit Payment Calculation' : 'Tính Toán Tiền Cọc Giữ Bàn' }}
            </h6>

            <div class="space-y-2 mb-3">
              <div class="d-flex justify-content-between fs-8 text-muted py-1">
                <span>{{ isEnglish ? 'Table deposit base:' : 'Tiền cọc giữ bàn:' }}</span>
                <span class="text-dark fw-semibold">{{ baseDeposit.toLocaleString('vi-VN') }}đ</span>
              </div>
              <div v-if="preOrderTotal > 0" class="d-flex justify-content-between fs-8 text-muted py-1">
                <span>{{ isEnglish ? 'Pre-order deposit (50%):' : 'Cọc món ăn trước (50%):' }}</span>
                <span class="text-dark fw-semibold">{{ (preOrderTotal * 0.5).toLocaleString('vi-VN') }}đ</span>
              </div>
              <div class="d-flex justify-content-between fs-8 text-muted py-1 border-top pt-2">
                <span class="fw-bold text-dark">{{ isEnglish ? 'Total deposit required:' : 'Tổng tiền cọc VietQR:' }}</span>
                <strong class="text-danger fs-6">{{ totalDeposit.toLocaleString('vi-VN') }}đ</strong>
              </div>
            </div>

            <div class="alert alert-info rounded-3 p-2.5 small mb-0 fs-8">
              <i class="fa-solid fa-circle-info me-1"></i>
              {{ isEnglish ? 'Deposit will be 100% deducted from your final bill during checkout.' : 'Tiền cọc sẽ được cấn trừ 100% vào hóa đơn thanh toán khi bạn dùng bữa xong tại nhà hàng.' }}
            </div>
          </div>

          <div v-if="error" class="alert alert-danger py-2 px-3 rounded-3 small mt-3 mb-0">
            <i class="fa-solid fa-circle-exclamation me-1"></i>{{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="d-flex justify-content-between align-items-center pt-3 border-top">
      <button type="button" @click="$emit('back')" class="btn btn-outline-secondary rounded-pill px-4 fw-bold">
        <i class="fa-solid fa-arrow-left me-2"></i> {{ isEnglish ? 'Back' : 'Quay Lại' }}
      </button>

      <button
        type="button"
        @click="$emit('submit')"
        :disabled="loading"
        class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="fa-solid fa-calendar-check me-2"></i>
        {{ isEnglish ? 'Confirm Booking Now' : 'Xác Nhận & Đặt Bàn Ngay' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  tables: {
    type: Array,
    default: () => [],
  },
  preOrders: {
    type: Object,
    default: () => ({}),
  },
  dishes: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["back", "submit"]);

const selectedTables = computed(() => {
  const ids = new Set(props.form.tableIds || []);
  return props.tables.filter((t) => ids.has(t._id));
});

const preOrderTotal = computed(() => {
  let total = 0;
  for (const [dishId, qty] of Object.entries(props.preOrders)) {
    if (qty > 0) {
      const dish = props.dishes.find((d) => d._id === dishId);
      if (dish) total += dish.price * qty;
    }
  }
  return total;
});

const baseDeposit = computed(() => {
  return props.form.guestsCount >= 4 || preOrderTotal.value > 0 ? 100000 : 0;
});

const totalDeposit = computed(() => {
  return Math.round(preOrderTotal.value * 0.5) + baseDeposit.value;
});
</script>
