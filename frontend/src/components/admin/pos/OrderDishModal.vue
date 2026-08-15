<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">
            Gọi Món Cho Bàn {{ session?.tables?.map(t => t.tableNumber).join(' + ') }}
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <!-- Danh sách món -->
            <div class="col-md-7">
              <div class="p-3 bg-light rounded-4 border">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="fa-solid fa-hand-pointer text-danger"></i>
                  <small class="text-muted">Kéo món thả vào giỏ bên cạnh, hoặc bấm nút +</small>
                </div>
                <div class="pos-dish-scroll pe-1">
                  <VueDraggable
                    v-model="dishList"
                    :group="{ name: 'order', pull: 'clone', put: false }"
                    :sort="false"
                    :clone="cloneDishToOrder"
                    :animation="150"
                    :filter="'.no-drag'"
                    :prevent-on-filter="true"
                    class="row g-2"
                  >
                    <div v-for="dish in dishList" :key="dish._id" class="col-12">
                      <div class="pos-dish-card p-2 border rounded-3 bg-white d-flex justify-content-between align-items-center">
                        <div class="min-w-0">
                          <strong class="d-block text-dark text-truncate fs-7">{{ dish.name }}</strong>
                          <small class="text-danger fw-bold">{{ dish.price.toLocaleString('vi-VN') }}đ</small>
                        </div>
                        <button
                          type="button"
                          @click="addDishToOrder(dish)"
                          class="no-drag btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                          style="width: 30px; height: 30px;"
                        >
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
              <div class="order-basket p-3 rounded-4 h-100 d-flex flex-column border bg-light bg-opacity-50">
                <h6 class="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-cart-shopping"></i> Món đã chọn
                  <span class="badge bg-danger rounded-pill ms-auto">{{ basket.length }}</span>
                </h6>
                <VueDraggable
                  v-model="basket"
                  :group="{ name: 'order', put: true }"
                  :sort="false"
                  :animation="150"
                  @add="onBasketAdd"
                  class="order-basket-list flex-grow-1"
                >
                  <div v-for="item in basket" :key="item.dishId" class="p-2 bg-white rounded-3 border mb-2 d-flex align-items-center justify-content-between">
                    <div class="min-w-0">
                      <strong class="d-block text-dark text-truncate fs-7">{{ item.dishName }}</strong>
                      <small class="text-danger fw-bold">{{ (item.price * item.quantity).toLocaleString('vi-VN') }}đ</small>
                    </div>
                    <div class="no-drag d-flex align-items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        @click="removeDishFromOrder(item.dishId)"
                        class="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style="width: 26px; height: 26px;"
                      >
                        <i class="fa-solid fa-minus fs-8"></i>
                      </button>
                      <span class="fw-bold fs-7">x{{ item.quantity }}</span>
                    </div>
                  </div>
                </VueDraggable>
                <div v-if="basket.length === 0" class="text-center text-muted small py-3">
                  <i class="fa-solid fa-arrows-up-down fs-4 d-block mb-1 opacity-50"></i>
                  Kéo món thả vào đây
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Hủy</button>
          <button
            @click="$emit('submit', basket)"
            :disabled="basket.length === 0"
            class="btn btn-danger rounded-pill px-4 fw-bold"
          >
            Gửi Đơn Xuống Bếp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";

const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
  dishes: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["close", "submit"]);

const dishList = ref([]);
const basket = ref([]);

watch(
  () => props.dishes,
  (val) => {
    dishList.value = val ? [...val] : [];
  },
  { immediate: true },
);

const cloneDishToOrder = (dish) => ({
  dishId: dish._id,
  dishName: dish.name,
  price: dish.price,
  quantity: 1,
});

const addDishToOrder = (dish) => {
  const existing = basket.value.find((item) => item.dishId === dish._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    basket.value.push({
      dishId: dish._id,
      dishName: dish.name,
      price: dish.price,
      quantity: 1,
    });
  }
};

const removeDishFromOrder = (dishId) => {
  const idx = basket.value.findIndex((item) => item.dishId === dishId);
  if (idx > -1) {
    if (basket.value[idx].quantity > 1) {
      basket.value[idx].quantity -= 1;
    } else {
      basket.value.splice(idx, 1);
    }
  }
};

const onBasketAdd = (evt) => {
  const addedItem = basket.value[evt.newIndex];
  if (!addedItem) return;
  const duplicates = basket.value.filter((item) => item.dishId === addedItem.dishId);
  if (duplicates.length > 1) {
    duplicates[0].quantity += 1;
    basket.value.splice(evt.newIndex, 1);
  }
};
</script>

<style scoped>
.pos-dish-scroll {
  max-height: 380px;
  overflow-y: auto;
}
.order-basket-list {
  min-height: 200px;
  max-height: 340px;
  overflow-y: auto;
}
.pos-dish-card {
  cursor: grab;
  transition: all 0.15s;
}
.pos-dish-card:hover {
  border-color: #ef4444 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
</style>
