<template>
  <div class="wizard-panel">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="fw-bold text-danger brand-font mb-0 d-flex align-items-center gap-2">
          <i class="fa-solid fa-utensils"></i>
          {{ isEnglish ? 'Step 3: Pre-order Specialties' : 'Bước 3: Đặt Trước Món Ăn Đặc Sản 3 Miền' }}
        </h4>
        <small class="text-muted">
          {{ isEnglish ? 'Drag dishes into dining table or click (+) to add to pre-order bill.' : 'Kéo món ăn thả vào vùng bàn ăn bên phải hoặc bấm (+) để đặt trước' }}
        </small>
      </div>
    </div>

    <!-- MAIN INTERACTIVE DRAG & DROP SPLIT LAYOUT -->
    <div class="row g-4 mb-4">
      <!-- LEFT COLUMN: DISH MENU -->
      <div class="col-lg-6">
        <div class="glass-card p-3 p-md-4 rounded-4 border bg-white shadow-sm h-100 d-flex flex-column">
          <!-- Filter Tabs & Search -->
          <div class="mb-3">
            <div class="d-flex align-items-center gap-1.5 overflow-x-auto pb-2 mb-2">
              <button
                type="button"
                @click="selectedCategory = 'ALL'"
                :class="['btn btn-sm rounded-pill px-2.5 fw-semibold fs-8 text-nowrap', selectedCategory === 'ALL' ? 'btn-danger' : 'btn-light']"
              >
                {{ isEnglish ? 'All Dishes' : 'Tất Cả Món' }}
              </button>
              <button
                v-for="cat in menuCategories"
                :key="cat"
                type="button"
                @click="selectedCategory = cat"
                :class="['btn btn-sm rounded-pill px-2.5 fw-semibold fs-8 text-nowrap', selectedCategory === cat ? 'btn-danger' : 'btn-light']"
              >
                {{ cat }}
              </button>
            </div>
            <input
              v-model="dishSearchKeyword"
              type="text"
              class="form-control form-control-sm rounded-pill px-3"
              :placeholder="isEnglish ? 'Search dish name...' : 'Tìm kiếm tên món ăn...'"
            />
          </div>

          <!-- Dish List (Draggable Cards) -->
          <div class="dish-scroll-area flex-grow-1 space-y-2 pe-1">
            <div
              v-for="dish in filteredDishes"
              :key="dish._id"
              draggable="true"
              @dragstart="onDragStart($event, dish)"
              class="dish-draggable-card p-2.5 rounded-3 border bg-light d-flex align-items-center justify-content-between gap-2 transition-all hover-shadow"
            >
              <div class="d-flex align-items-center gap-2.5 min-w-0">
                <img
                  v-if="dish.image"
                  :src="getImageUrl(dish.image)"
                  :alt="dish.name"
                  class="rounded-3 object-fit-cover flex-shrink-0"
                  style="width: 44px; height: 44px;"
                  onerror="this.src='/images/dishes/default-dish.jpg'"
                />
                <div v-else class="p-2 bg-danger bg-opacity-10 text-danger rounded-3 text-center flex-shrink-0" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
                  <i class="fa-solid fa-utensils fs-6"></i>
                </div>

                <div class="min-w-0">
                  <strong class="text-dark fs-7 d-block text-truncate">{{ dish.name }}</strong>
                  <div class="d-flex align-items-center gap-2">
                    <small class="text-danger fw-bold fs-8">{{ dish.price.toLocaleString('vi-VN') }}đ</small>
                    <span v-if="dish.region" class="badge bg-secondary bg-opacity-15 text-dark fs-9 px-1.5 py-0.5">
                      {{ dish.region }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="d-flex align-items-center gap-1 flex-shrink-0">
                <small class="text-muted fs-9 d-none d-sm-inline opacity-75">
                  <i class="fa-solid fa-hand-pointer me-1"></i>Kéo
                </small>
                <button
                  type="button"
                  @click="$emit('update-qty', dish._id, 1)"
                  class="btn btn-danger btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm"
                  style="width: 30px; height: 30px;"
                  title="Thêm vào bàn"
                >
                  <i class="fa-solid fa-plus fs-8"></i>
                </button>
              </div>
            </div>

            <div v-if="filteredDishes.length === 0" class="text-center py-4 text-muted small">
              Không tìm thấy món ăn phù hợp
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: DINING TABLE DROPZONE -->
      <div class="col-lg-6">
        <div
          @dragover.prevent="isDraggingOver = true"
          @dragleave="isDraggingOver = false"
          @drop="onDrop"
          :class="[
            'glass-card p-3 p-md-4 rounded-4 border-2 h-100 d-flex flex-column justify-content-between transition-all bg-white shadow-sm',
            isDraggingOver ? 'border-danger bg-danger bg-opacity-5 shadow-lg' : 'border-danger border-dashed'
          ]"
        >
          <div>
            <!-- Dropzone Header -->
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h6 class="fw-bold brand-font text-danger mb-0 d-flex align-items-center gap-2">
                <i class="fa-solid fa-receipt"></i>
                {{ isEnglish ? 'Pre-order Bill Preview' : 'Vùng Bàn Ăn — Hóa Đơn Đặt Trước' }}
              </h6>
              <span class="badge bg-danger rounded-pill fs-8 fw-bold">
                {{ selectedDishesList.length }} {{ isEnglish ? 'dishes' : 'món' }}
              </span>
            </div>

            <!-- Selected Dishes List or Empty Placeholder -->
            <div v-if="selectedDishesList.length === 0" class="dropzone-empty-box text-center py-5 rounded-4 bg-light border border-dashed my-2">
              <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex mb-2">
                <i class="fa-solid fa-cloud-arrow-down fs-3"></i>
              </div>
              <h6 class="fw-bold text-dark mb-1 fs-7">Bàn Ăn Còn Trống Món</h6>
              <p class="text-muted fs-8 mb-0 px-3">
                Kéo món từ menu bên trái thả vào đây<br />hoặc nhấp dấu <strong>(+)</strong> để thêm vào hóa đơn
              </p>
            </div>

            <div v-else class="selected-dishes-scroll space-y-2 pe-1 mb-3">
              <div
                v-for="item in selectedDishesList"
                :key="item.dish._id"
                class="p-2.5 rounded-3 border bg-white d-flex align-items-center justify-content-between gap-2 shadow-2xs mb-2"
              >
                <div class="d-flex align-items-center gap-2 min-w-0">
                  <img
                    v-if="item.dish.image"
                    :src="getImageUrl(item.dish.image)"
                    :alt="item.dish.name"
                    class="rounded-2 object-fit-cover flex-shrink-0"
                    style="width: 38px; height: 38px;"
                    onerror="this.src='/images/dishes/default-dish.jpg'"
                  />
                  <div class="min-w-0">
                    <strong class="text-dark fs-7 d-block text-truncate">{{ item.dish.name }}</strong>
                    <small class="text-danger fw-bold fs-8">{{ (item.dish.price * item.quantity).toLocaleString('vi-VN') }}đ</small>
                  </div>
                </div>

                <!-- Quantity Modifier & Delete -->
                <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    @click="$emit('update-qty', item.dish._id, -1)"
                    class="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                    style="width: 26px; height: 26px;"
                  >
                    <i class="fa-solid fa-minus fs-9"></i>
                  </button>
                  <span class="fw-bold px-1 fs-7 text-dark">{{ item.quantity }}</span>
                  <button
                    type="button"
                    @click="$emit('update-qty', item.dish._id, 1)"
                    class="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                    style="width: 26px; height: 26px;"
                  >
                    <i class="fa-solid fa-plus fs-9"></i>
                  </button>
                  <button
                    type="button"
                    @click="$emit('remove-dish', item.dish._id)"
                    class="btn btn-light btn-sm text-danger rounded-circle p-0 ms-1 d-flex align-items-center justify-content-center"
                    style="width: 26px; height: 26px;"
                    title="Xóa món"
                  >
                    <i class="fa-solid fa-trash-can fs-9"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Calculation Summary Box -->
          <div class="p-3 bg-danger bg-opacity-10 rounded-4 border border-danger border-opacity-25 mt-3">
            <div class="d-flex justify-content-between fs-8 mb-1 text-dark">
              <span>{{ isEnglish ? 'Pre-order dishes total:' : 'Tổng tiền món đặt trước:' }}</span>
              <strong>{{ preOrderTotal.toLocaleString('vi-VN') }}đ</strong>
            </div>
            <div class="d-flex justify-content-between fs-8 mb-1 text-dark">
              <span>{{ isEnglish ? 'Dish deposit (50%):' : 'Tiền cọc món ăn (50%):' }}</span>
              <strong>{{ (preOrderTotal * 0.5).toLocaleString('vi-VN') }}đ</strong>
            </div>
            <div class="d-flex justify-content-between fs-8 mb-1 text-dark">
              <span>{{ isEnglish ? 'Base table deposit:' : 'Tiền cọc giữ bàn (mặc định):' }}</span>
              <strong>{{ baseDeposit.toLocaleString('vi-VN') }}đ</strong>
            </div>
            <hr class="my-2" />
            <div class="d-flex justify-content-between text-danger fw-bold fs-7">
              <span>{{ isEnglish ? 'TOTAL DEPOSIT (VIETQR):' : 'TỔNG CỌC CẦN THANH TOÁN:' }}</span>
              <span class="fs-6">{{ totalDeposit.toLocaleString('vi-VN') }}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Actions -->
    <div class="d-flex justify-content-between align-items-center pt-3 border-top">
      <button type="button" @click="$emit('back')" class="btn btn-outline-secondary rounded-pill px-4 fw-bold">
        <i class="fa-solid fa-arrow-left me-2"></i> {{ isEnglish ? 'Back' : 'Quay Lại' }}
      </button>

      <div class="d-flex gap-2">
        <button
          v-if="selectedDishesList.length === 0"
          type="button"
          @click="$emit('next')"
          class="btn btn-outline-danger rounded-pill px-4 fw-semibold"
        >
          {{ isEnglish ? 'Skip Dish Pre-order' : 'Bỏ Qua Chọn Món & Tiếp Tục' }}
        </button>
        <button
          type="button"
          @click="$emit('next')"
          class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow-sm"
        >
          {{ isEnglish ? 'Next: Review & Confirm' : 'Tiếp Theo: Ghi Chú & Xác Nhận' }}
          <i class="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getImageUrl } from "../../../utils/imageHelper";

const props = defineProps({
  dishes: {
    type: Array,
    default: () => [],
  },
  preOrders: {
    type: Object,
    default: () => ({}),
  },
  guestsCount: {
    type: Number,
    default: 2,
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back", "next", "update-qty", "remove-dish", "drop-dish"]);

const selectedCategory = ref("ALL");
const dishSearchKeyword = ref("");
const isDraggingOver = ref(false);

const menuCategories = computed(() => {
  const set = new Set();
  props.dishes.forEach((d) => {
    if (d.category?.name) set.add(d.category.name);
    else if (d.category) set.add(d.category);
  });
  return Array.from(set);
});

const filteredDishes = computed(() => {
  return props.dishes.filter((d) => {
    const catName = d.category?.name || d.category || "";
    const matchCat = selectedCategory.value === "ALL" || catName === selectedCategory.value;
    const matchKeyword = !dishSearchKeyword.value || d.name.toLowerCase().includes(dishSearchKeyword.value.toLowerCase());
    return matchCat && matchKeyword && d.availability !== false;
  });
});

const selectedDishesList = computed(() => {
  const list = [];
  for (const [dishId, qty] of Object.entries(props.preOrders)) {
    if (qty > 0) {
      const dish = props.dishes.find((d) => d._id === dishId);
      if (dish) list.push({ dish, quantity: qty });
    }
  }
  return list;
});

const preOrderTotal = computed(() => {
  return selectedDishesList.value.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
});

const baseDeposit = computed(() => {
  return props.guestsCount >= 4 || preOrderTotal.value > 0 ? 100000 : 0;
});

const totalDeposit = computed(() => {
  return Math.round(preOrderTotal.value * 0.5) + baseDeposit.value;
});

const onDragStart = (evt, dish) => {
  evt.dataTransfer.setData("text/plain", dish._id);
};

const onDrop = (evt) => {
  isDraggingOver.value = false;
  const dishId = evt.dataTransfer.getData("text/plain");
  if (dishId) {
    emit("update-qty", dishId, 1);
  }
};
</script>

<style scoped>
.dish-scroll-area {
  max-height: 420px;
  overflow-y: auto;
}
.selected-dishes-scroll {
  max-height: 280px;
  overflow-y: auto;
}
.dish-draggable-card {
  cursor: grab;
}
</style>
