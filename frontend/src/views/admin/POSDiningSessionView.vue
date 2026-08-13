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
            <button @click="openQrModal(session)" class="btn btn-outline-secondary btn-sm rounded-pill fw-bold" title="QR cho khách tự gọi món">
              <i class="fa-solid fa-qrcode"></i>
            </button>
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
              <label class="form-label fw-semibold">Chọn bàn trống xếp cho khách</label>
              <div class="table-select-scroll border rounded-3 p-2 bg-light">
                <div v-for="table in availableTables" :key="table._id" class="form-check d-flex align-items-center gap-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`walkin-table-${table._id}`"
                    :value="table._id"
                    v-model="walkInForm.tableIds"
                  />
                  <label class="form-check-label small" :for="`walkin-table-${table._id}`">
                    Bàn {{ table.tableNumber }} ({{ table.capacity }} chỗ)
                  </label>
                </div>
                <div v-if="availableTables.length === 0" class="text-muted small text-center py-2">
                  <i class="fa-solid fa-circle-info me-1"></i>Không còn bàn trống
                </div>
              </div>
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

    <!-- QR Gọi Món Modal -->
    <div v-if="showQrModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-5 p-3">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold brand-font text-danger"><i class="fa-solid fa-qrcode me-2"></i>QR Gọi Món Tại Bàn</h5>
            <button @click="showQrModal = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body text-center">
            <p class="small text-muted">Đưa mã QR này cho khách quét để tự gọi món (không cần đăng nhập):</p>
            <img v-if="selfOrderQrUrl" :src="selfOrderQrUrl" class="img-fluid rounded-3 border p-2 bg-white mb-2" style="max-width: 240px;" alt="QR gọi món" />
            <div class="small text-secondary bg-light p-2 rounded-3 border text-break">{{ selfOrderUrl }}</div>
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
              <!-- Danh sách món (kéo thả) -->
              <div class="col-md-7">
                <div class="p-3 bg-light rounded-4 border">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="fa-solid fa-hand-pointer text-danger"></i>
                    <small class="text-muted">Kéo món thả vào giỏ bên cạnh, hoặc bấm +</small>
                  </div>
                  <div class="pos-dish-scroll pe-1">
                    <VueDraggable
                      v-model="orderDishList"
                      :group="{ name: 'order', pull: 'clone', put: false }"
                      :sort="false"
                      :clone="cloneDishToOrder"
                      :animation="150"
                      :filter="'.no-drag'"
                      :prevent-on-filter="true"
                      class="row g-2"
                    >
                      <div v-for="dish in orderDishList" :key="dish._id" class="col-12">
                        <div class="pos-dish-card p-2 border rounded-3 bg-white d-flex justify-content-between align-items-center">
                          <div class="min-w-0">
                            <strong class="d-block text-dark text-truncate fs-7">{{ dish.name }}</strong>
                            <small class="text-danger fw-bold">{{ dish.price.toLocaleString('vi-VN') }}đ</small>
                          </div>
                          <button type="button" @click="addDishToOrder(dish)" class="no-drag btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 30px; height: 30px;">
                            <i class="fa-solid fa-plus fs-8"></i>
                          </button>
                        </div>
                      </div>
                    </VueDraggable>
                  </div>
                </div>
              </div>

              <!-- Giỏ gọi món (thả vào) -->
              <div class="col-md-5">
                <div class="order-basket p-3 rounded-4 h-100 d-flex flex-column">
                  <h6 class="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
                    <i class="fa-solid fa-cart-shopping"></i> Món đã chọn
                    <span class="badge bg-danger rounded-pill ms-auto">{{ orderBasket.length }}</span>
                  </h6>
                  <VueDraggable
                    v-model="orderBasket"
                    :group="{ name: 'order', put: true }"
                    :sort="false"
                    :animation="150"
                    @add="onOrderBasketAdd"
                    class="order-basket-list flex-grow-1"
                  >
                    <div v-for="item in orderBasket" :key="item.dishId" class="p-2 bg-white rounded-3 border mb-2 d-flex align-items-center justify-content-between">
                      <div class="min-w-0">
                        <strong class="d-block text-dark text-truncate fs-7">{{ item.dishName }}</strong>
                        <small class="text-danger fw-bold">{{ (item.price * item.quantity).toLocaleString('vi-VN') }}đ</small>
                      </div>
                      <div class="no-drag d-flex align-items-center gap-2 flex-shrink-0">
                        <button type="button" @click="removeDishFromOrder(item.dishId)" class="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 26px; height: 26px;">
                          <i class="fa-solid fa-minus fs-8"></i>
                        </button>
                        <span class="fw-bold fs-7">x{{ item.quantity }}</span>
                      </div>
                    </div>
                  </VueDraggable>
                  <div v-if="orderBasket.length === 0" class="text-center text-muted small py-3">
                    <i class="fa-solid fa-arrows-up-down fs-4 d-block mb-1 opacity-50"></i>
                    Kéo món thả vào đây
                  </div>
                </div>
              </div>
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
              <label class="form-label fw-semibold">Mã voucher (nếu có)</label>
              <input v-model="checkoutForm.voucherCode" type="text" class="form-control text-uppercase" placeholder="VD: GIAM10" />
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
import { ref, reactive, computed, watch, onMounted } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useSessionStore } from "../../stores/sessionStore";
import { useTableStore } from "../../stores/tableStore";
import { useMenuStore } from "../../stores/menuStore";
import { toast } from "../../composables/useToast";

const sessionStore = useSessionStore();
const tableStore = useTableStore();
const menuStore = useMenuStore();

const showWalkInModal = ref(false);
const showOrderModal = ref(false);
const showCheckoutModal = ref(false);
const showQrModal = ref(false);
const qrSession = ref(null);
const selectedSession = ref(null);
const modalError = ref("");
const orderBasket = ref([]);
const orderDishList = ref([]);

watch(
  () => menuStore.dishes,
  (dishes) => {
    orderDishList.value = dishes || [];
  },
  { immediate: true },
);

const walkInForm = reactive({
  customerName: "Khách Walk-in",
  customerPhone: "",
  guestsCount: 2,
  tableIds: [],
});

const availableTables = computed(() =>
  tableStore.tables.filter((t) => t.status === "AVAILABLE"),
);

const checkoutForm = reactive({
  paymentMethod: "CASH",
  discountAmount: 0,
  taxPercent: 8,
  voucherCode: "",
});

const handleCreateWalkIn = async () => {
  modalError.value = "";
  try {
    if (!walkInForm.tableIds || walkInForm.tableIds.length === 0) {
      modalError.value = "Vui lòng chọn ít nhất 1 bàn trống để xếp cho khách!";
      return;
    }

    await sessionStore.createWalkInSession(
      walkInForm.customerName,
      walkInForm.customerPhone,
      walkInForm.guestsCount,
      walkInForm.tableIds,
      "Khách đi ngang vào ăn"
    );
    toast.success("Tiếp nhận khách Walk-in thành công!");
    walkInForm.tableIds = [];
    showWalkInModal.value = false;
  } catch (err) {
    modalError.value = err.message;
    toast.error(err.message);
  }
};

const openOrderModal = (session) => {
  selectedSession.value = session;
  orderBasket.value = [];
  showOrderModal.value = true;
};

const addDishToOrder = (dish) => {
  const existing = orderBasket.value.find((i) => i.dishId === dish._id);
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

const removeDishFromOrder = (dishId) => {
  const idx = orderBasket.value.findIndex((i) => i.dishId === dishId);
  if (idx === -1) return;
  if (orderBasket.value[idx].quantity > 1) {
    orderBasket.value[idx].quantity -= 1;
  } else {
    orderBasket.value.splice(idx, 1);
  }
};

// Clone dữ liệu khi kéo món vào giỏ gọi món
const cloneDishToOrder = (dish) => ({
  dishId: dish._id,
  dishName: dish.name,
  price: dish.price,
  quantity: 1,
});

const onOrderBasketAdd = (evt) => {
  const cloned = evt.clonedData || evt.data;
  if (!cloned || !cloned.dishId) return;
  const justAddedIndex = orderBasket.value.indexOf(cloned);
  const dupIndex = orderBasket.value.findIndex(
    (it, i) => i !== justAddedIndex && it.dishId === cloned.dishId,
  );
  if (dupIndex !== -1) {
    orderBasket.value[dupIndex].quantity += 1;
    if (justAddedIndex !== -1) orderBasket.value.splice(justAddedIndex, 1);
  }
};

const submitOrder = async () => {
  try {
    const items = orderBasket.value.map(i => ({ dish: i.dishId, quantity: i.quantity }));
    await sessionStore.createOrder(selectedSession.value._id, items, "Ghi nhận từ POS");
    toast.success("Đã gửi đơn gọi món xuống bếp!");
    showOrderModal.value = false;
  } catch (err) {
    toast.error("Lỗi gọi món: " + err.message);
  }
};

const openCheckoutModal = (session) => {
  selectedSession.value = session;
  showCheckoutModal.value = true;
};

const openQrModal = (session) => {
  qrSession.value = session;
  showQrModal.value = true;
};

const selfOrderUrl = computed(() => {
  if (!qrSession.value) return "";
  return `${window.location.origin}/goi-mon?session=${qrSession.value.sessionCode}`;
});

const selfOrderQrUrl = computed(() => {
  if (!selfOrderUrl.value) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selfOrderUrl.value)}`;
});

const submitCheckout = async () => {
  modalError.value = "";
  try {
    const result = await sessionStore.createInvoice(
      selectedSession.value._id,
      checkoutForm.paymentMethod,
      checkoutForm.discountAmount,
      checkoutForm.taxPercent,
      "Thanh toán tại quầy",
      checkoutForm.voucherCode
    );
    if (result.paymentUrl) {
      // VNPay: chuyển hướng sang cổng thanh toán
      showCheckoutModal.value = false;
      window.location.href = result.paymentUrl;
      return;
    }
    toast.success("Thanh toán thành công! Bàn ăn đã được tự động giải phóng.");
    showCheckoutModal.value = false;
    // Mở trang in hóa đơn
    window.open(`/admin/invoice/${selectedSession.value._id}`, "_blank");
  } catch (err) {
    modalError.value = err.message;
    toast.error(err.message);
  }
};

onMounted(() => {
  sessionStore.fetchActiveSessions();
  tableStore.fetchTables();
  menuStore.fetchDishes();
});
</script>

<style scoped>
.pos-dish-scroll {
  max-height: 320px;
  overflow-y: auto;
}
.pos-dish-card {
  cursor: grab;
  transition: box-shadow 0.2s ease;
}
.pos-dish-card:active {
  cursor: grabbing;
}
.pos-dish-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.order-basket {
  border: 2px dashed rgba(211, 47, 47, 0.5);
  background: rgba(211, 47, 47, 0.04);
}
.order-basket-list {
  min-height: 200px;
}
.table-select-scroll {
  max-height: 180px;
  overflow-y: auto;
}
</style>
