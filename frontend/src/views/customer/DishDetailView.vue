<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <router-link to="/thuc-don" class="btn btn-outline-secondary btn-sm rounded-pill mb-4 px-3 fw-bold">
        <i class="fa-solid fa-arrow-left me-1"></i> {{ langStore.isEnglish ? 'Back to Menu' : 'Quay Lại Thực Đơn' }}
      </router-link>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
      </div>

      <div v-else-if="dish" class="glass-card p-4 p-md-5 rounded-5 shadow-lg bg-white">
        <div class="row g-5 align-items-center">
          <!-- Dish Image -->
          <div class="col-lg-6">
            <div class="position-relative rounded-5 overflow-hidden shadow-sm bg-light" style="height: 380px;">
              <img
                :src="dish.image && dish.image !== 'default-dish.jpg' && dish.image.startsWith('http') ? dish.image : (dish.image && dish.image !== 'default-dish.jpg' ? `http://localhost:3000/uploads/${dish.image}` : 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80')"
                :alt="dish.name"
                class="w-100 h-100 object-fit-cover"
              />
              <span
                :class="[
                  'badge position-absolute top-0 end-0 m-4 px-3 py-2 rounded-pill fs-7 shadow-sm',
                  dish.region === 'Bắc' ? 'bg-primary' : dish.region === 'Trung' ? 'bg-warning text-dark' : 'bg-success'
                ]"
              >
                {{ langStore.isEnglish ? 'Specialty Region ' : 'Đặc Sản Miền ' }}{{ dish.region }}
              </span>
            </div>
          </div>

          <!-- Dish Info -->
          <div class="col-lg-6">
            <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-1.5 rounded-pill fw-bold mb-2 fs-8 text-uppercase">
              <i class="fa-solid fa-fire me-1"></i> {{ dish.category?.name || (langStore.isEnglish ? 'Seafood Specialty' : 'Ẩm Thực Đặc Sản') }}
            </span>
            <h1 class="display-5 fw-bold brand-font text-dark mb-3">{{ dish.name }}</h1>

            <div class="mb-4">
              <span class="display-6 fw-bold text-danger brand-font">{{ dish.price.toLocaleString('vi-VN') }}đ</span>
              <span class="text-muted fs-7 ms-2">/ {{ langStore.isEnglish ? 'serving' : 'phần dùng' }}</span>
            </div>

            <p class="text-muted leading-relaxed mb-4 fs-6">{{ dish.description }}</p>

            <div class="p-4 bg-light rounded-4 border mb-4">
              <div class="d-flex align-items-center gap-3">
                <i class="fa-solid fa-shrimp fs-2 text-danger"></i>
                <div>
                  <strong class="d-block text-dark">{{ langStore.isEnglish ? 'Fresh & Authentic Ingredients' : 'Nguyên Liệu Tươi Sống Hàng Ngày' }}</strong>
                  <small class="text-secondary">
                    {{ langStore.isEnglish ? 'Processed fresh from seafood tanks by 3-Region master chefs' : 'Hải sản tươi bắt trực tiếp tại bể được chế biến bởi đầu bếp 3 miền chuyên nghiệp' }}
                  </small>
                </div>
              </div>
            </div>

            <div class="d-flex gap-3">
              <router-link to="/dat-ban" class="btn btn-primary-crab btn-lg px-4 py-3 fw-bold flex-grow-1 shadow">
                <i class="fa-solid fa-calendar-check me-2"></i> {{ langStore.isEnglish ? 'Pre-order & Book Table' : 'Đặt Bàn & Gọi Món Này' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../../services/api";
import { useLangStore } from "../../stores/langStore";

const route = useRoute();
const langStore = useLangStore();
const dish = ref(null);
const loading = ref(false);

const fetchDish = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/dishes/slug/${route.params.slug}`);
    dish.value = res.data.data.dish;
  } catch (err) {
    console.error("Lỗi lấy chi tiết món ăn:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDish();
});
</script>
