<template>
  <div class="py-5">
    <div class="container">
      <div v-if="menuStore.loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
      </div>

      <template v-else-if="dish">
        <div class="row g-5 align-items-center">
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
            <p class="fs-3 fw-bold text-danger mb-3">{{ dish.price.toLocaleString('vi-VN') }}đ</p>

            <!-- Đánh giá sao -->
            <div class="d-flex align-items-center gap-2 mb-4">
              <StarRating :value="dish.ratingAverage || 0" :readonly="true" />
              <span class="fw-bold text-warning">{{ dish.ratingAverage || 0 }}</span>
              <span class="text-muted small">({{ dish.ratingCount || 0 }} đánh giá)</span>
            </div>

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

        <!-- Đánh giá món ăn -->
        <div class="mt-5">
          <div class="row g-4">
            <!-- Form đánh giá -->
            <div class="col-lg-5">
              <div class="glass-card p-4 rounded-5 bg-white">
                <h5 class="fw-bold brand-font mb-3">
                  <i class="fa-solid fa-star text-warning me-1"></i> Đánh Giá Món Này
                </h5>
                <div v-if="authStore.isAuthenticated">
                  <div class="mb-3 text-center">
                    <StarRating v-model="reviewForm.rating" />
                  </div>
                  <textarea v-model="reviewForm.comment" class="form-control mb-3" rows="3" placeholder="Chia sẻ cảm nhận của bạn về món ăn..."></textarea>
                  <button @click="submitReview" :disabled="submitting" class="btn btn-primary-crab w-100 fw-bold">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="fa-solid fa-paper-plane me-2"></i> Gửi Đánh Giá
                  </button>
                </div>
                <div v-else class="text-center py-3">
                  <p class="text-muted small mb-3">Đăng nhập để gửi đánh giá của bạn</p>
                  <router-link to="/login" class="btn btn-outline-danger rounded-pill px-4">Đăng Nhập</router-link>
                </div>
              </div>
            </div>

            <!-- Danh sách đánh giá -->
            <div class="col-lg-7">
              <h5 class="fw-bold brand-font mb-3">Đánh Giá Từ Khách Hàng ({{ reviews.length }})</h5>
              <div v-if="reviews.length === 0" class="text-center text-muted py-4 glass-card rounded-4">
                <i class="fa-solid fa-comment-dots fs-2 d-block mb-2 opacity-50"></i>
                Chưa có đánh giá nào cho món này
              </div>
              <div v-for="review in reviews" :key="review._id" class="glass-card p-3 rounded-4 bg-white mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-circle-user text-danger fs-4"></i>
                    <strong class="small">{{ review.user?.name || 'Khách ẩn danh' }}</strong>
                  </div>
                  <StarRating :value="review.rating" :readonly="true" :size="'sm'" />
                </div>
                <p class="small text-muted mb-1">{{ review.comment }}</p>
                <small class="text-muted fs-8">{{ new Date(review.createdAt).toLocaleDateString('vi-VN') }}</small>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMenuStore } from "../../stores/menuStore";
import { useAuthStore } from "../../stores/authStore";
import api from "../../services/api";
import { toast } from "../../composables/useToast";
import StarRating from "../../components/common/StarRating.vue";

const route = useRoute();
const menuStore = useMenuStore();
const authStore = useAuthStore();

const dish = ref(null);
const reviews = ref([]);
const submitting = ref(false);
const reviewForm = reactive({ rating: 5, comment: "" });

const fetchReviews = async () => {
  try {
    const res = await api.get(`/reviews/dish/${dish.value._id}`);
    reviews.value = res.data.data.reviews;
  } catch (err) {
    console.error("Lỗi lấy đánh giá:", err);
  }
};

const submitReview = async () => {
  if (!reviewForm.comment.trim()) {
    toast.error("Vui lòng nhập nội dung đánh giá");
    return;
  }
  submitting.value = true;
  try {
    await api.post("/reviews", { dishId: dish.value._id, rating: reviewForm.rating, comment: reviewForm.comment });
    toast.success("Cảm ơn bạn đã gửi đánh giá!");
    reviewForm.comment = "";
    reviewForm.rating = 5;
    dish.value = await menuStore.fetchDishBySlug(route.params.slug);
    await fetchReviews();
  } catch (err) {
    toast.error(err.response?.data?.message || "Gửi đánh giá thất bại!");
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    dish.value = await menuStore.fetchDishBySlug(route.params.slug);
    await fetchReviews();
  } catch (err) {
    console.error("Lỗi xem món:", err);
  }
});
</script>
