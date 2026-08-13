<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-5">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-calendar-check me-1"></i> ĐẶT BÀN & ĐẶT MÓN TRƯỚC (PRE-ORDER)
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">Đặt Bàn & Gọi Món 3 Miền Cua</h1>
        <p class="text-muted small">Đặt trước món ăn để nhà hàng chuẩn bị sẵn sàng và thanh toán cọc giữ chỗ an toàn qua VietQR</p>
      </div>

      <!-- VÙNG BẮT BUỘC ĐĂNG NHẬP (AUTH CHECK) -->
      <div v-if="!authStore.isAuthenticated" class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center shadow-lg bg-white border-danger border-opacity-25">
        <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-block mb-3">
          <i class="fa-solid fa-user-lock display-4"></i>
        </div>
        <h3 class="fw-bold text-dark mb-2">Vui Lòng Đăng Nhập Để Đặt Bàn</h3>
        <p class="text-muted small mb-4">
          Nhà hàng 3 Miền Cua yêu cầu quý khách đăng nhập tài khoản thành viên để xác thực thông tin liên hệ và tích lũy điểm chi tiêu thăng hạng.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/login?redirect=/dat-ban" class="btn btn-primary-crab px-4 py-2.5 fw-bold">
            <i class="fa-solid fa-right-to-bracket me-2"></i> Đăng Nhập Ngay
          </router-link>
          <router-link to="/register" class="btn btn-outline-danger rounded-pill px-4 py-2.5 fw-bold">
            Đăng Ký Thành Viên
          </router-link>
        </div>
      </div>

      <!-- Result Success Box with VietQR Deposit Code -->
      <div v-else-if="successData" class="max-w-2xl mx-auto glass-card p-4 p-md-5 rounded-5 text-center mb-5 border-success shadow-lg bg-white">
        <div class="badge bg-success px-3 py-2 rounded-pill fs-7 mb-3">
          <i class="fa-solid fa-circle-check me-1"></i> ĐẶT BÀN THÀNH CÔNG
        </div>
        <h2 class="brand-font text-success mb-2">Mã Đặt Bàn: {{ successData.data.reservation.reservationCode }}</h2>
        <p class="text-muted mb-4">Nhà hàng 3 Miền Cua đã ghi nhận giữ chỗ cho Anh/Chị <strong>{{ successData.data.reservation.customerName }}</strong>!</p>

        <!-- Dynamic Combination Notice -->
        <div v-if="successData.isCombinedTable" class="alert alert-warning rounded-4 p-3 mb-4 text-start">
          <div class="d-flex align-items-center gap-3">
            <i class="fa-solid fa-puzzle-piece fs-3 text-warning"></i>
            <div>
              <strong class="d-block text-dark">Thông báo ghép bàn tự động:</strong>
              <small class="text-secondary">Vì đoàn {{ successData.data.reservation.guestsCount }} người khá đông, hệ thống đã tự động ghép cụm bàn kề nhau cho bạn!</small>
            </div>
          </div>
        </div>

        <!-- VietQR Deposit Payment Box -->
        <div v-if="successData.deposit && successData.deposit.amount > 0" class="p-4 bg-light rounded-4 border mb-4">
          <h5 class="fw-bold brand-font text-danger mb-2">
            <i class="fa-solid fa-qrcode me-2"></i>Thanh Toán Cọc Giữ Bàn & Món Ăn
          </h5>
          <p class="small text-muted mb-3">
            Vui lòng quét Mã QR bên dưới bằng ứng dụng Ngân hàng hoặc MoMo để nộp tiền cọc <strong>{{ successData.deposit.amount.toLocaleString('vi-VN') }}đ</strong> (Bao gồm 50% tiền món đặt trước + Tiền cọc giữ bàn. Số tiền này sẽ được tự động trừ trực tiếp vào hóa đơn khi bạn đến ăn).
          </p>
          
          <img
            v-if="successData.deposit.qrCodeUrl"
            :src="successData.deposit.qrCodeUrl"
            alt="Mã QR VietQR Đặt Cọc"
            class="img-fluid rounded-3 border shadow-sm mb-3"
            style="max-width: 260px;"
          />

          <div class="small text-secondary bg-white p-3 rounded-3 border text-start">
            <p class="mb-1"><strong>Ngân hàng nhận:</strong> {{ successData.deposit.bankInfo.bankId }} - {{ successData.deposit.bankInfo.accountName }}</p>
            <p class="mb-1"><strong>Số tài khoản:</strong> {{ successData.deposit.bankInfo.accountNo }}</p>
            <p class="mb-0"><strong>Nội dung chuyển khoản:</strong> <span class="text-danger fw-bold">COC {{ successData.data.reservation.reservationCode }}</span></p>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3">
          <router-link :to="`/tra-cuu?code=${successData.data.reservation.reservationCode}`" class="btn btn-outline-danger rounded-pill px-4">
            Xem Trạng Thái Đơn
          </router-link>
          <button @click="resetForm" class="btn btn-primary-crab px-4">
            Đặt Thêm Đơn Khác
          </button>
        </div>
      </div>

      <!-- Booking Form when Logged In -->
      <div v-else class="max-w-3xl mx-auto glass-card p-4 p-md-5 rounded-5 shadow-lg border-0 bg-white">
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: User Info -->
          <div class="mb-4 pb-3 border-bottom">
            <h5 class="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <span class="badge bg-danger rounded-circle p-2 fs-8">1</span> Thông Tin Khách Hàng (Tài khoản: {{ authStore.user?.name }})
            </h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Họ và tên người đặt <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.customerName" type="text" class="form-control py-2.5" placeholder="Ví dụ: Nguyễn Văn A" required />
                  <i class="fa-solid fa-user"></i>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Số điện thoại liên hệ <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.customerPhone" type="tel" class="form-control py-2.5" placeholder="Ví dụ: 0988776655" required />
                  <i class="fa-solid fa-phone"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Date & Guests -->
          <div class="mb-4 pb-3 border-bottom">
            <h5 class="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <span class="badge bg-danger rounded-circle p-2 fs-8">2</span> Thời Gian & Số Lượng Khách
            </h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Số lượng khách dùng bữa <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model.number="form.guestsCount" type="number" min="1" max="100" class="form-control py-2.5" required />
                  <i class="fa-solid fa-users"></i>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold fs-7 text-dark">Thời gian bắt đầu <span class="text-danger">*</span></label>
                <div class="form-control-icon">
                  <input v-model="form.startAt" type="datetime-local" class="form-control py-2.5" required />
                  <i class="fa-solid fa-clock"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Pre-order Dishes Menu Selection (Chống Boom Hàng) -->
          <div class="mb-4 pb-3 border-bottom">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold text-danger mb-0 d-flex align-items-center gap-2">
                <span class="badge bg-danger rounded-circle p-2 fs-8">3</span> Chọn Món Ăn Đặt Trước (Pre-order)
              </h5>
              <span class="badge bg-warning text-dark px-3 py-1 rounded-pill small fw-bold">Chống Boom Hàng: Cọc 50% tiền món</span>
            </div>

            <!-- Dishes Selector Grid -->
            <div class="row g-3 mb-3">
              <div v-for="dish in menuStore.dishes" :key="dish._id" class="col-md-6">
                <div class="p-3 border rounded-4 d-flex align-items-center justify-content-between bg-light">
                  <div>
                    <strong class="d-block text-dark fs-7">{{ dish.name }}</strong>
                    <small class="text-danger fw-bold">{{ dish.price.toLocaleString('vi-VN') }}đ</small>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      @click="updatePreOrderQuantity(dish._id, -1)"
                      class="btn btn-outline-secondary btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
                      style="width: 28px; height: 28px;"
                    >
                      <i class="fa-solid fa-minus fs-8"></i>
                    </button>
                    <span class="fw-bold px-1 fs-7">{{ getPreOrderQuantity(dish._id) }}</span>
                    <button
                      type="button"
                      @click="updatePreOrderQuantity(dish._id, 1)"
                      class="btn btn-outline-danger btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
                      style="width: 28px; height: 28px;"
                    >
                      <i class="fa-solid fa-plus fs-8"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Calculation Summary Box -->
            <div class="p-3 bg-danger bg-opacity-10 rounded-4 border border-danger border-opacity-25">
              <div class="d-flex justify-content-between small mb-1 text-dark">
                <span>Tổng tiền món ăn đặt trước:</span>
                <strong>{{ preOrderTotal.toLocaleString('vi-VN') }}đ</strong>
              </div>
              <div class="d-flex justify-content-between small mb-1 text-dark">
                <span>Tiền cọc món ăn (50%):</span>
                <strong>{{ (preOrderTotal * 0.5).toLocaleString('vi-VN') }}đ</strong>
              </div>
              <div class="d-flex justify-content-between small mb-1 text-dark">
                <span>Tiền cọc giữ bàn (mặc định):</span>
                <strong>{{ (form.guestsCount >= 4 || preOrderTotal > 0 ? 100000 : 0).toLocaleString('vi-VN') }}đ</strong>
              </div>
              <hr class="my-2" />
              <div class="d-flex justify-content-between text-danger fw-bold fs-6">
                <span>TỔNG TIỀN CỌC CẦN THANH TOÁN (VIETQR):</span>
                <span>{{ estimatedDeposit.toLocaleString('vi-VN') }}đ</span>
              </div>
            </div>
          </div>

          <!-- Step 4: Special Notes -->
          <div class="mb-4">
            <h5 class="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <span class="badge bg-danger rounded-circle p-2 fs-8">4</span> Ghi Chú Đặc Biệt
            </h5>
            <textarea v-model="form.notes" class="form-control rounded-3 p-3" rows="3" placeholder="Ví dụ: Cần bàn gần cửa sổ, có ghế trẻ em, tiệc sinh nhật..."></textarea>
          </div>

          <div v-if="errorMsg" class="alert alert-danger mb-4 p-3 rounded-3 small d-flex align-items-center gap-2">
            <i class="fa-solid fa-circle-exclamation fs-5"></i>
            <div>{{ errorMsg }}</div>
          </div>

          <div class="text-center pt-2">
            <button type="submit" :disabled="reservationStore.loading" class="btn btn-primary-crab btn-lg px-5 py-3 w-100 shadow-sm fw-bold">
              <span v-if="reservationStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else><i class="fa-solid fa-paper-plane me-2"></i> XÁC NHẬN ĐẶT BÀN & TẠO MÃ QR NỘP CỌC</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useReservationStore } from "../../stores/reservationStore";
import { useAuthStore } from "../../stores/authStore";
import { useMenuStore } from "../../stores/menuStore";

const reservationStore = useReservationStore();
const authStore = useAuthStore();
const menuStore = useMenuStore();

const errorMsg = ref("");
const successData = ref(null);
const preOrderDishesMap = reactive({}); // Map { dishId: quantity }

const form = reactive({
  customerName: authStore.user?.name || "",
  customerPhone: authStore.user?.phone || "",
  customerEmail: authStore.user?.email || "",
  guestsCount: 4,
  startAt: "",
  notes: "",
});

onMounted(() => {
  const nextHour = new Date();
  nextHour.setDate(nextHour.getDate() + 1);
  nextHour.setHours(19, 0, 0, 0);
  form.startAt = nextHour.toISOString().slice(0, 16);

  menuStore.fetchDishes();
});

const getPreOrderQuantity = (dishId) => {
  return preOrderDishesMap[dishId] || 0;
};

const updatePreOrderQuantity = (dishId, delta) => {
  const current = preOrderDishesMap[dishId] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) {
    delete preOrderDishesMap[dishId];
  } else {
    preOrderDishesMap[dishId] = next;
  }
};

// Tính tổng tiền món pre-order
const preOrderTotal = computed(() => {
  let sum = 0;
  for (const [dishId, qty] of Object.entries(preOrderDishesMap)) {
    const dish = menuStore.dishes.find((d) => d._id === dishId);
    if (dish) sum += dish.price * qty;
  }
  return sum;
});

// Tính tổng tiền cọc ước tính
const estimatedDeposit = computed(() => {
  const dishDeposit = Math.round(preOrderTotal.value * 0.5);
  const baseDeposit = form.guestsCount >= 4 || preOrderTotal.value > 0 ? 100000 : 0;
  return dishDeposit + baseDeposit;
});

const handleSubmit = async () => {
  errorMsg.value = "";
  try {
    // Chuyển map preOrderDishesMap sang mảng [{ dish, quantity }]
    const preOrderDishes = Object.entries(preOrderDishesMap).map(([dish, quantity]) => ({
      dish,
      quantity,
    }));

    const res = await reservationStore.createReservation({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      guestsCount: form.guestsCount,
      startAt: new Date(form.startAt).toISOString(),
      preOrderDishes,
      notes: form.notes,
    });
    successData.value = res;
  } catch (err) {
    errorMsg.value = err.message;
  }
};

const resetForm = () => {
  successData.value = null;
  form.notes = "";
  Object.keys(preOrderDishesMap).forEach((k) => delete preOrderDishesMap[k]);
};
</script>
