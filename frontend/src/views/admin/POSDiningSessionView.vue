<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1">POS Quản Lý Bàn Ăn Thực Tế (Dining Sessions)</h2>
        <p class="text-muted small mb-0">Tiếp nhận khách Walk-in, Gọi món đợt 1 đợt 2, Cảnh báo quá giờ và Thanh toán xuất hóa đơn</p>
      </div>
      <div class="d-flex gap-2">
        <button @click="showWalkInModal = true" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
          <i class="fa-solid fa-person-walking-luggage me-1"></i> Tiếp Nhận Khách Walk-in
        </button>
        <button @click="sessionStore.fetchActiveSessions()" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Active Sessions Grid -->
    <div v-if="sessionStore.loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else-if="sessionStore.activeSessions.length > 0" class="row g-4 mb-4">
      <div v-for="session in sessionStore.activeSessions" :key="session._id" class="col-md-4">
        <div
          :class="[
            'glass-card p-4 rounded-4 position-relative border-2 h-100 d-flex flex-column',
            session.isOverTime ? 'border-warning bg-warning bg-opacity-10' : 'border-danger'
          ]"
        >
          <!-- Overtime Badge -->
          <span v-if="session.isOverTime" class="position-absolute top-0 end-0 m-3 badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
            <i class="fa-solid fa-triangle-exclamation me-1"></i> QUÁ GIỜ ({{ session.elapsedMinutes }} phút)
          </span>
          <span v-else class="position-absolute top-0 end-0 m-3 badge bg-danger rounded-pill px-3 py-2">
            ĐANG ĂN ({{ session.elapsedMinutes }} phút)
          </span>

          <h4 class="fw-bold brand-font mb-1 text-danger">
            Bàn {{ session.tables.map(t => t.tableNumber).join(' + ') }}
          </h4>
          <p class="text-muted small mb-2">Mã lượt dùng bữa: <strong>{{ session.sessionCode }}</strong> ({{ session.type }})</p>

          <div class="p-3 bg-white rounded-3 border mb-3 flex-grow-1">
            <div class="d-flex justify-content-between small mb-1">
              <span class="text-muted">Khách hàng:</span>
              <strong class="text-dark">{{ session.customerName }}</strong>
            </div>
            <div class="d-flex justify-content-between small mb-1">
              <span class="text-muted">Số người:</span>
              <strong class="text-dark">{{ session.actualGuestsCount }} người</strong>
            </div>
            <div class="d-flex justify-content-between small">
              <span class="text-muted">Giờ vào:</span>
              <strong class="text-secondary">{{ new Date(session.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}</strong>
            </div>
          </div>

          <div class="d-flex gap-2 mt-auto pt-2 border-top">
            <button @click="openOrderModal(session)" class="btn btn-outline-danger btn-sm rounded-pill flex-fill fw-bold">
              <i class="fa-solid fa-utensils me-1"></i> Gọi Món
            </button>
            <button @click="openCheckoutModal(session)" class="btn btn-success btn-sm rounded-pill flex-fill fw-bold">
              <i class="fa-solid fa-receipt me-1"></i> Thanh Toán
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="glass-card p-5 rounded-4 text-center">
      <i class="fa-solid fa-utensils display-3 text-secondary mb-3 d-block"></i>
      <h4 class="fw-bold">Hiện tại chưa có bàn nào đang dùng bữa</h4>
      <p class="text-muted small">Bấm nút "Tiếp Nhận Khách Walk-in" hoặc Check-in từ đơn đặt trước để mở bàn</p>
    </div>

    <!-- Walk-in Modal -->
    <div v-if="showWalkInModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">Tiếp Nhận Khách Walk-in</h5>
            <button @click="showWalkInModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Tên khách hàng</label>
              <input v-model="walkInForm.customerName" type="text" class="form-control" placeholder="Khách vãng lai" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Số lượng khách</label>
              <input v-model.number="walkInForm.guestsCount" type="number" min="1" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Nhập số bàn xếp cho khách (VD: B01, B02)</label>
              <input v-model="walkInForm.tableNumbers" type="text" class="form-control text-uppercase" placeholder="Ví dụ: B01" required />
            </div>
            <div v-if="modalError" class="alert alert-danger small rounded-3">{{ modalError }}</div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showWalkInModal = false" class="btn btn-light rounded-pill px-4">Hủy</button>
            <button @click="handleCreateWalkIn" class="btn btn-danger rounded-pill px-4 fw-bold">Mở Bàn Ngay</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Food Modal -->
    <div v-if="showOrderModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger">
              Gọi Món Cho Bàn {{ selectedSession?.tables?.map(t => t.tableNumber).join(' + ') }}
            </h5>
            <button @click="showOrderModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div v-for="dish in menuStore.dishes" :key="dish._id" class="col-md-6">
                <div class="p-3 border rounded-4 d-flex justify-content-between align-items-center">
                  <div>
                    <strong class="d-block text-dark">{{ dish.name }}</strong>
                    <small class="text-danger fw-bold">{{ dish.price.toLocaleString('vi-VN') }}đ</small>
                  </div>
                  <button @click="addDishToOrder(dish)" class="btn btn-outline-danger btn-sm rounded-circle">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Current Order Basket -->
            <div class="mt-4 p-3 bg-light rounded-4">
              <h6 class="fw-bold brand-font mb-2">Danh sách món vừa chọn:</h6>
              <div v-if="orderBasket.length > 0">
                <div v-for="(item, idx) in orderBasket" :key="idx" class="d-flex justify-content-between align-items-center mb-2 small">
                  <span>{{ item.dishName }} (x{{ item.quantity }})</span>
                  <span class="fw-bold text-danger">{{ (item.price * item.quantity).toLocaleString('vi-VN') }}đ</span>
                </div>
              </div>
              <span v-else class="text-muted small">Chưa chọn món nào</span>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showOrderModal = false" class="btn btn-light rounded-pill px-4">Hủy</button>
            <button @click="submitOrder" :disabled="orderBasket.length === 0" class="btn btn-danger rounded-pill px-4 fw-bold">
              Gửi Đơn Xuống Bếp
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout Invoice Modal -->
    <div v-if="showCheckoutModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-success">
              <i class="fa-solid fa-receipt me-2"></i>Thanh Toán Bàn {{ selectedSession?.tables?.map(t => t.tableNumber).join(' + ') }}
            </h5>
            <button @click="showCheckoutModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Phương thức thanh toán</label>
              <select v-model="checkoutForm.paymentMethod" class="form-select">
                <option value="CASH">Tiền mặt (CASH)</option>
                <option value="BANK_TRANSFER">Chuyển khoản (BANK_TRANSFER)</option>
                <option value="CARD">Quẹt thẻ (CARD)</option>
                <option value="MOMO">Ví MoMo</option>
                <option value="VNPAY">VNPay</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Tiền giảm giá (nếu có)</label>
              <input v-model.number="checkoutForm.discountAmount" type="number" min="0" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Thuế VAT (%)</label>
              <input v-model.number="checkoutForm.taxPercent" type="number" min="0" max="20" class="form-control" />
            </div>
            <div v-if="modalError" class="alert alert-danger small rounded-3">{{ modalError }}</div>
          </div>
          <div class="modal-footer border-0">
            <button @click="showCheckoutModal = false" class="btn btn-light rounded-pill px-4">Hủy</button>
            <button @click="submitCheckout" class="btn btn-success rounded-pill px-4 fw-bold">
              Xác Nhận Thanh Toán & Giải Phóng Bàn
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useSessionStore } from "../../stores/sessionStore";
import { useTableStore } from "../../stores/tableStore";
import { useMenuStore } from "../../stores/menuStore";

const sessionStore = useSessionStore();
const tableStore = useTableStore();
const menuStore = useMenuStore();

const showWalkInModal = ref(false);
const showOrderModal = ref(false);
const showCheckoutModal = ref(false);
const selectedSession = ref(null);
const modalError = ref("");
const orderBasket = ref([]);

const walkInForm = reactive({
  customerName: "Khách Walk-in",
  customerPhone: "",
  guestsCount: 2,
  tableNumbers: "B01",
});

const checkoutForm = reactive({
  paymentMethod: "CASH",
  discountAmount: 0,
  taxPercent: 8,
});

const handleCreateWalkIn = async () => {
  modalError.value = "";
  try {
    const numbers = walkInForm.tableNumbers.split(",").map(n => n.trim().toUpperCase());
    const tableIds = tableStore.tables.filter(t => numbers.includes(t.tableNumber)).map(t => t._id);
    
    if (tableIds.length === 0) {
      modalError.value = "Không tìm thấy số bàn tương ứng trên hệ thống!";
      return;
    }

    await sessionStore.createWalkInSession(
      walkInForm.customerName,
      walkInForm.customerPhone,
      walkInForm.guestsCount,
      tableIds,
      "Khách đi ngang vào ăn"
    );
    showWalkInModal.value = false;
  } catch (err) {
    modalError.value = err.message;
  }
};

const openOrderModal = (session) => {
  selectedSession.value = session;
  orderBasket.value = [];
  showOrderModal.value = true;
};

const addDishToOrder = (dish) => {
  const existing = orderBasket.value.find(i => i.dishId === dish._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    orderBasket.value.push({
      dishId: dish._id,
      dishName: dish.name,
      price: dish.price,
      quantity: 1,
    });
  }
};

const submitOrder = async () => {
  try {
    const items = orderBasket.value.map(i => ({ dish: i.dishId, quantity: i.quantity }));
    await sessionStore.createOrder(selectedSession.value._id, items, "Ghi nhận từ POS");
    alert("Đã gửi đơn gọi món xuống bếp!");
    showOrderModal.value = false;
  } catch (err) {
    alert("Lỗi gọi món: " + err.message);
  }
};

const openCheckoutModal = (session) => {
  selectedSession.value = session;
  showCheckoutModal.value = true;
};

const submitCheckout = async () => {
  modalError.value = "";
  try {
    await sessionStore.createInvoice(
      selectedSession.value._id,
      checkoutForm.paymentMethod,
      checkoutForm.discountAmount,
      checkoutForm.taxPercent,
      "Thanh toán tại quầy"
    );
    alert("Thanh toán thành công! Bàn ăn đã được tự động giải phóng về AVAILABLE.");
    showCheckoutModal.value = false;
  } catch (err) {
    modalError.value = err.message;
  }
};

onMounted(() => {
  sessionStore.fetchActiveSessions();
  tableStore.fetchTables();
  menuStore.fetchDishes();
});
</script>
