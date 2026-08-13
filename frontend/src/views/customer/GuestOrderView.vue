<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-4">
        <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-bold mb-2 fs-8">
          <i class="fa-solid fa-qrcode me-1"></i> {{ langStore.t('guestOrder.badge') }}
        </span>
        <h1 class="display-5 fw-bold brand-font text-dark">{{ langStore.t('guestOrder.title') }}</h1>
        <p class="text-muted small">
          Bàn: <strong class="text-danger">{{ sessionCode || '—' }}</strong>
        </p>
      </div>

      <div v-if="!sessionCode" class="max-w-xl mx-auto glass-card p-5 rounded-5 text-center">
        <i class="fa-solid fa-triangle-exclamation display-4 text-warning mb-3 d-block"></i>
        <h4 class="fw-bold">{{ langStore.t('guestOrder.missingTable') }}</h4>
        <p class="text-muted small">{{ langStore.t('guestOrder.missingTableHint') }}</p>
      </div>

      <div v-else class="row g-4">
        <!-- Danh sách món (kéo thả) -->
        <div class="col-lg-7">
          <div class="glass-card p-4 rounded-5 bg-white">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="fa-solid fa-hand-pointer text-danger"></i>
              <small class="text-muted">Kéo món thả vào giỏ bên cạnh, hoặc bấm nút + / −</small>
            </div>
            <div class="guest-dish-scroll pe-1">
              <VueDraggable
                v-model="dishList"
                :group="{ name: 'guest-order', pull: 'clone', put: false }"
                :sort="false"
                :clone="cloneDish"
                :animation="150"
                :filter="'.no-drag'"
                :prevent-on-filter="true"
                class="row g-2"
              >
                <div v-for="dish in dishList" :key="dish._id" class="col-12">
                  <DishCard
                    :dish="dish"
                    :quantity="getQty(dish._id)"
                    @increment="addDish(dish)"
                    @decrement="removeDish(dish._id)"
                  />
                </div>
              </VueDraggable>
            </div>
          </div>
        </div>

        <!-- Giỏ món (thả vào) -->
        <div class="col-lg-5">
          <div class="glass-card p-4 rounded-5 bg-white h-100 d-flex flex-column">
            <h5 class="fw-bold brand-font text-danger mb-2 d-flex align-items-center gap-2">
              <i class="fa-solid fa-cart-plus"></i> {{ langStore.t('guestOrder.basket') }}
              <span class="badge bg-danger rounded-pill ms-auto">{{ guestBasket.length }}</span>
            </h5>

            <VueDraggable
              v-model="guestBasket"
              :group="{ name: 'guest-order', put: true }"
              :sort="false"
              :animation="150"
              @add="onBasketAdd"
              class="guest-basket-list flex-grow-1"
            >
              <div
                v-for="item in guestBasket"
                :key="item.dishId"
                class="p-2 bg-light rounded-3 border mb-2 d-flex align-items-center justify-content-between"
              >
                <div class="min-w-0">
                  <strong class="d-block text-dark text-truncate fs-7">{{ item.name }}</strong>
                  <small class="text-danger fw-bold">{{ (item.price * item.quantity).toLocaleString('vi-VN') }}đ</small>
                </div>
                <div class="no-drag d-flex align-items-center gap-2 flex-shrink-0">
                  <button type="button" @click="removeDish(item.dishId)" class="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 26px; height: 26px;">
                    <i class="fa-solid fa-minus fs-8"></i>
                  </button>
                  <span class="fw-bold fs-7">x{{ item.quantity }}</span>
                  <button type="button" @click="addDish({ _id: item.dishId, name: item.name, price: item.price })" class="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 26px; height: 26px;">
                    <i class="fa-solid fa-plus fs-8"></i>
                  </button>
                </div>
              </div>
            </VueDraggable>

            <div v-if="guestBasket.length === 0" class="text-center text-muted small py-4">
              <i class="fa-solid fa-arrows-up-down fs-4 d-block mb-1 opacity-50"></i>
              Kéo món ăn vào đây
            </div>

            <div class="pt-3 border-top mt-3">
              <div class="d-flex justify-content-between mb-2 small">
                <span class="text-muted">Tổng tiền:</span>
                <strong class="text-danger">{{ totalAmount.toLocaleString('vi-VN') }}đ</strong>
              </div>
              <button @click="submitOrder" :disabled="guestBasket.length === 0 || submitting" class="btn btn-primary-crab w-100 py-3 fw-bold">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fa-solid fa-paper-plane me-2"></i> {{ langStore.t('guestOrder.submit') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useRoute } from "vue-router";
import api from "../../services/api";
import { useMenuStore } from "../../stores/menuStore";
import { useLangStore } from "../../stores/langStore";
import { toast } from "../../composables/useToast";
import DishCard from "../../components/customer/DishCard.vue";

const route = useRoute();
const menuStore = useMenuStore();
const langStore = useLangStore();

const sessionCode = ref(route.query.session || "");
const dishList = ref([]);
const guestBasket = ref([]);
const submitting = ref(false);

watch(
  () => menuStore.dishes,
  (dishes) => {
    dishList.value = dishes || [];
  },
  { immediate: true },
);

const cloneDish = (dish) => ({
  dishId: dish._id,
  name: dish.name,
  price: dish.price,
  image: dish.image,
  region: dish.region,
  quantity: 1,
});

const getQty = (dishId) => {
  const item = guestBasket.value.find((i) => i.dishId === dishId);
  return item ? item.quantity : 0;
};

const addDish = (dish) => {
  const existing = guestBasket.value.find((i) => i.dishId === dish._id);
  if (existing) existing.quantity += 1;
  else guestBasket.value.push({ dishId: dish._id, name: dish.name, price: dish.price, image: dish.image, region: dish.region, quantity: 1 });
};

const removeDish = (dishId) => {
  const idx = guestBasket.value.findIndex((i) => i.dishId === dishId);
  if (idx === -1) return;
  if (guestBasket.value[idx].quantity > 1) guestBasket.value[idx].quantity -= 1;
  else guestBasket.value.splice(idx, 1);
};

const onBasketAdd = (evt) => {
  const cloned = evt.clonedData || evt.data;
  if (!cloned || !cloned.dishId) return;
  const justAddedIndex = guestBasket.value.indexOf(cloned);
  const dupIndex = guestBasket.value.findIndex((it, i) => i !== justAddedIndex && it.dishId === cloned.dishId);
  if (dupIndex !== -1) {
    guestBasket.value[dupIndex].quantity += 1;
    if (justAddedIndex !== -1) guestBasket.value.splice(justAddedIndex, 1);
  }
};

const totalAmount = computed(() =>
  guestBasket.value.reduce((sum, it) => sum + it.price * it.quantity, 0),
);

const submitOrder = async () => {
  submitting.value = true;
  try {
    const items = guestBasket.value.map((it) => ({ dish: it.dishId, quantity: it.quantity }));
    await api.post("/orders/guest", { sessionCode: sessionCode.value, items });
    toast.success("Gửi món thành công! Nhà bếp sẽ chế biến ngay.");
    guestBasket.value = [];
  } catch (err) {
    toast.error(err.response?.data?.message || "Gửi món thất bại!");
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  menuStore.fetchDishes();
});
</script>

<style scoped>
.guest-dish-scroll {
  max-height: 480px;
  overflow-y: auto;
}
.guest-basket-list {
  min-height: 260px;
}
</style>
