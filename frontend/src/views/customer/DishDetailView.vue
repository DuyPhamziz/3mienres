<template>
  <div class="py-5">
    <div class="container">
      <div v-if="menuStore.loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
      </div>

      <div v-else-if="dish" class="row g-5 align-items-center">
        <div class="col-lg-6">
          <div class="glass-card p-3 rounded-5 overflow-hidden">
            <img
              :src="dish.image || 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80'"
              :alt="dish.name"
              class="w-100 rounded-4 shadow"
              style="max-height: 450px; object-fit: cover;"
            />
          </div>
        </div>

        <div class="col-lg-6">
          <div class="mb-3">
            <span
              :class="[
                'badge rounded-pill px-3 py-2 fs-7 me-2',
                dish.region === 'Bắc' ? 'badge-region-bac' : dish.region === 'Trung' ? 'badge-region-trung' : 'badge-region-nam'
              ]"
            >
              Đặc sản Miền {{ dish.region }}
            </span>
            <span v-if="dish.category" class="badge bg-secondary rounded-pill px-3 py-2 fs-7">
              {{ dish.category.name }}
            </span>
          </div>

          <h1 class="display-5 fw-bold brand-font mb-3">{{ dish.name }}</h1>
          <p class="fs-3 fw-bold text-danger mb-4">{{ dish.price.toLocaleString('vi-VN') }}đ</p>

          <div class="mb-4">
            <h5 class="fw-bold brand-font text-secondary">Mô tả đặc sản:</h5>
            <p class="text-muted leading-relaxed">{{ dish.description }}</p>
          </div>

          <div class="p-3 bg-white rounded-3 border mb-4">
            <div class="d-flex align-items-center gap-3">
              <i class="fa-solid fa-shield-halved text-success fs-3"></i>
              <div>
                <strong class="d-block">Cam kết chất lượng 3 Miền Cua</strong>
                <small class="text-muted">Nguyên liệu tươi sống chế biến trong ngày, cam kết chuẩn vị đặc sản.</small>
              </div>
            </div>
          </div>

          <div class="d-flex gap-3">
            <router-link to="/dat-ban" class="btn btn-primary-crab btn-lg px-4 py-3">
              <i class="fa-solid fa-calendar-check me-2"></i> Đặt Bàn Ngay & Chọn Món Này
            </router-link>
            <router-link to="/thuc-don" class="btn btn-outline-secondary btn-lg px-4 py-3 rounded-pill">
              Quay Lại Thực Đơn
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMenuStore } from "../../stores/menuStore";

const route = useRoute();
const menuStore = useMenuStore();
const dish = ref(null);

onMounted(async () => {
  try {
    dish.value = await menuStore.fetchDishBySlug(route.params.slug);
  } catch (err) {
    console.error("Lỗi xem món:", err);
  }
});
</script>
