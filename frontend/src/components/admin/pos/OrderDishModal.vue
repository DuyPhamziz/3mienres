<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">
            Gọi Món Cho Bàn {{ tableNumbers }}
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
                  group="order"
                  :animation="150"
                  class="basket-dropzone flex-grow-1 border-2 rounded-3 p-2 bg-white mb-2"
                  style="min-height: 180px; max-height: 240px; overflow-y: auto;"
                >
                  <div v-if="basket.length === 0" class="text-center text-muted small py-4">
                    Kéo thả món vào đây<br />hoặc bấm nút (+)
                  </div>
                  <div
                    v-for="(item, idx) in basket"
                    :key="idx"
                    class="basket-item p-2 mb-1.5 border rounded-3 bg-light d-flex justify-content-between align-items-center"
                  >
                    <div class="min-w-0 me-2">
                      <strong class="d-block text-dark text-truncate fs-7">{{ item.name }}</strong>
                      <small class="text-muted">{{ (item.price * item.quantity).toLocaleString('vi-VN') }}đ</small>
                    </div>
                    <div class="d-flex align-items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        @click="updateQty(idx, -1)"
                        class="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style="width: 24px; height: 24px;"
                      >
                        -
                      </button>
                      <span class="fw-bold px-1 fs-7">{{ item.quantity }}</span>
                      <button
                        type="button"
                        @click="updateQty(idx, 1)"
                        class="btn btn-sm btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style="width: 24px; height: 24px;"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </VueDraggable>

                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span class="small text-muted">Tổng tạm tính:</span>
                  <strong class="text-danger fs-6">{{ basketTotal.toLocaleString('vi-VN') }}đ</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Hủy</button>
          <button
            @click="handleSubmit"
            :disabled="basket.length === 0"
            class="btn btn-danger rounded-pill px-4 fw-bold"
          >
            Gửi Bếp ({{ basket.length }} món)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
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

const emit = defineEmits(["close", "submit"]);

const dishList = ref([...props.dishes]);
const basket = ref([]);

const tableNumbers = computed(() => {
  const tables = props.session?.tables || [];
  return (
    tables
      .filter(Boolean)
      .map((t) => t.tableNumber || t)
      .join(" + ") || "—"
  );
});

watch(
  () => props.dishes,
  (newVal) => {
    dishList.value = [...newVal];
  },
);

const basketTotal = computed(() => {
  return basket.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const cloneDishToOrder = (dish) => {
  const existing = basket.value.find((b) => b.dishId === dish._id);
  if (existing) {
    existing.quantity += 1;
    return null;
  }
  return {
    dishId: dish._id,
    name: dish.name,
    price: dish.price,
    quantity: 1,
  };
};

const addDishToOrder = (dish) => {
  const existing = basket.value.find((b) => b.dishId === dish._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    basket.value.push({
      dishId: dish._id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
    });
  }
};

const updateQty = (idx, delta) => {
  const item = basket.value[idx];
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    basket.value.splice(idx, 1);
  }
};

const handleSubmit = () => {
  if (basket.value.length > 0) {
    emit("submit", basket.value);
  }
};
</script>

<style scoped>
.pos-dish-scroll {
  max-height: 280px;
  overflow-y: auto;
}
.basket-dropzone {
  border-style: dashed;
}
</style>
