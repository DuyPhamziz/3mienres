<template>
  <div class="glass-card p-4 p-md-5 rounded-5 bg-white border shadow-sm mt-4">
    <!-- Tiêu đề khu vực đánh giá -->
    <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom flex-wrap gap-2">
      <div>
        <h4 class="fw-bold brand-font text-dark mb-1">
          <i class="fa-solid fa-star text-warning me-2"></i>{{ isEnglish ? 'Customer Reviews & Ratings' : 'Đánh Giá & Nhận Xét Của Thực Khách' }}
        </h4>
        <small class="text-muted fs-8">
          {{ isEnglish ? 'Feedback from real guests who enjoyed this dish' : 'Cảm nhận chân thực từ khách hàng đã thưởng thức món ăn này' }}
        </small>
      </div>
      <span class="badge bg-warning bg-opacity-20 text-warning px-3 py-1.5 rounded-pill fw-bold fs-8">
        {{ reviews.length }} {{ isEnglish ? 'Reviews' : 'Lượt Đánh Giá' }}
      </span>
    </div>

    <!-- Rating Summary Cards -->
    <div class="row g-4 mb-4 align-items-center">
      <!-- Cột Điểm Trung Bình -->
      <div class="col-md-4 text-center border-end-md">
        <div class="display-4 fw-bold text-dark brand-font mb-1">{{ averageRating }}</div>
        <div class="d-flex justify-content-center gap-1 text-warning fs-5 mb-2">
          <i v-for="star in 5" :key="star" :class="star <= Math.round(averageRating) ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
        </div>
        <small class="text-muted fs-8">
          {{ isEnglish ? `Based on ${reviews.length} reviews` : `Dựa trên ${reviews.length} lượt đánh giá thực tế` }}
        </small>
      </div>

      <!-- Cột Phân Bố Sao -->
      <div class="col-md-8">
        <div class="d-flex flex-column gap-1.5 max-w-md">
          <div
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            @click="selectedStarFilter = selectedStarFilter === star ? 0 : star"
            class="d-flex align-items-center gap-2 small cursor-pointer py-0.5 rounded px-2"
            :class="{ 'bg-warning bg-opacity-10': selectedStarFilter === star }"
          >
            <span class="text-muted fw-semibold" style="width: 45px;">{{ star }} <i class="fa-solid fa-star text-warning fs-9"></i></span>
            <div class="progress flex-grow-1 rounded-pill" style="height: 7px;">
              <div
                class="progress-bar bg-warning"
                :style="{ width: getStarPercent(star) + '%' }"
              ></div>
            </div>
            <span class="text-muted fs-9 text-end" style="width: 30px;">{{ countStar(star) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Viết Đánh Giá -->
    <div class="p-3.5 p-md-4 rounded-4 bg-light border mb-4">
      <h6 class="fw-bold text-dark mb-2">
        <i class="fa-solid fa-pen-to-square text-danger me-1.5"></i>
        {{ isEnglish ? 'Leave Your Review' : 'Chia Sẻ Cảm Nhận Của Bạn Về Món Ăn' }}
      </h6>

      <div v-if="!isAuthenticated" class="text-center py-3">
        <p class="text-muted small mb-2">
          {{ isEnglish ? 'Please log in to submit your rating and review.' : 'Vui lòng đăng nhập tài khoản để gửi đánh giá món ăn.' }}
        </p>
        <router-link to="/login" class="btn btn-danger btn-sm rounded-pill px-4 fw-bold shadow-sm">
          <i class="fa-solid fa-right-to-bracket me-1.5"></i>{{ isEnglish ? 'Login to Review' : 'Đăng Nhập Ngay' }}
        </router-link>
      </div>

      <form v-else @submit.prevent="submitReview">
        <!-- Interactive Star Selector -->
        <div class="mb-3">
          <label class="form-label small fw-semibold text-muted d-block mb-1">
            {{ isEnglish ? 'Select Rating:' : 'Đánh giá mức độ hài lòng:' }}
          </label>
          <div class="d-flex align-items-center gap-1 fs-4 cursor-pointer">
            <i
              v-for="s in 5"
              :key="s"
              @click="reviewForm.rating = s"
              @mouseover="hoverRating = s"
              @mouseleave="hoverRating = 0"
              :class="[
                'cursor-pointer transition-all',
                (hoverRating ? s <= hoverRating : s <= reviewForm.rating) ? 'fa-solid fa-star text-warning' : 'fa-regular fa-star text-secondary'
              ]"
            ></i>
            <span class="badge bg-warning text-dark ms-3 rounded-pill fs-8 fw-bold">
              {{ starText(hoverRating || reviewForm.rating) }}
            </span>
          </div>
        </div>

        <!-- Comment Textarea -->
        <div class="mb-3">
          <textarea
            v-model="reviewForm.comment"
            rows="3"
            class="form-control fs-7 rounded-3"
            :placeholder="isEnglish ? 'Describe the taste, freshness, and your dining experience...' : 'Hãy mô tả hương vị, độ tươi ngon và cảm nhận của bạn khi thưởng thức món ăn này...'"
            required
          ></textarea>
        </div>

        <div class="d-flex justify-content-end">
          <button
            type="button"
            @click="submitReview"
            class="btn btn-danger rounded-pill px-4 py-2 fw-bold shadow-sm"
            :disabled="submitting || !reviewForm.comment.trim()"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fa-solid fa-paper-plane me-1.5"></i>
            {{ isEnglish ? 'Submit Review' : 'Gửi Đánh Giá' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Bộ Lọc Đánh Giá -->
    <div v-if="reviews.length > 0" class="d-flex align-items-center gap-2 mb-3 flex-wrap">
      <span class="small fw-bold text-muted me-1">{{ isEnglish ? 'Filter:' : 'Lọc:' }}</span>
      <button
        @click="selectedStarFilter = 0"
        :class="['btn btn-sm rounded-pill px-3 fs-8', selectedStarFilter === 0 ? 'btn-danger' : 'btn-light']"
      >
        {{ isEnglish ? 'All' : 'Tất cả' }} ({{ reviews.length }})
      </button>
      <button
        v-for="s in [5, 4, 3, 2, 1]"
        :key="s"
        @click="selectedStarFilter = s"
        :class="['btn btn-sm rounded-pill px-3 fs-8', selectedStarFilter === s ? 'btn-danger' : 'btn-light']"
      >
        {{ s }} <i class="fa-solid fa-star text-warning fs-9"></i> ({{ countStar(s) }})
      </button>
    </div>

    <!-- Danh Sách Đánh Giá Đã Có -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-danger" role="status"></div>
    </div>

    <div v-else-if="filteredReviews.length === 0" class="text-center py-4 text-muted">
      <i class="fa-regular fa-comment-dots display-6 opacity-40 mb-2 d-block"></i>
      <p class="small mb-0">
        {{ isEnglish ? 'No reviews found in this filter.' : 'Chưa có đánh giá nào phù hợp với bộ lọc.' }}
      </p>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <div
        v-for="r in filteredReviews"
        :key="r._id"
        class="p-3.5 rounded-4 border bg-white shadow-2xs hover-border-danger transition-all"
      >
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="d-flex align-items-center gap-2.5">
            <div class="p-2 bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
              <i class="fa-solid fa-user fs-7"></i>
            </div>
            <div>
              <strong class="text-dark fs-7 d-block">{{ r.user?.name || (isEnglish ? 'Customer' : 'Khách Hàng') }}</strong>
              <small class="text-muted fs-9">
                <i class="fa-solid fa-calendar-day me-1"></i>
                {{ new Date(r.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) }}
              </small>
            </div>
          </div>

          <div class="d-flex gap-1 text-warning fs-8">
            <i v-for="star in 5" :key="star" :class="star <= r.rating ? 'fa-solid fa-star' : 'fa-regular fa-star text-muted opacity-40'"></i>
          </div>
        </div>

        <p class="text-secondary small mb-2 ps-md-5" style="line-height: 1.6;">
          {{ r.comment }}
        </p>

        <!-- ═══ PHẢN HỒI CHÍNH THỨC TỪ NHÀ HÀNG (NẾU CÓ) ═══ -->
        <div v-if="r.reply && r.reply.comment" class="ms-md-5 mt-2.5 p-3 rounded-3 bg-light border-start border-4 border-danger">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-danger text-white rounded-pill px-2.5 py-1 fs-9 fw-bold d-inline-flex align-items-center gap-1">
              <i class="fa-solid fa-crown text-warning"></i>
              {{ isEnglish ? '3 Miền Cua Restaurant Reply' : 'Phản Hồi Từ Nhà Hàng 3 Miền Cua' }}
            </span>
            <small class="text-muted fs-9" v-if="r.reply.repliedAt">
              {{ new Date(r.reply.repliedAt).toLocaleDateString('vi-VN') }}
            </small>
          </div>
          <p class="small text-dark mb-0 fst-italic" style="line-height: 1.5;">
            "{{ r.reply.comment }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const props = defineProps({
  dishId: {
    type: String,
    required: true,
  },
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["review-added"]);

const reviews = ref([]);
const loading = ref(false);
const submitting = ref(false);
const hoverRating = ref(0);
const selectedStarFilter = ref(0);

const reviewForm = reactive({
  rating: 5,
  comment: "",
});

const averageRating = computed(() => {
  if (reviews.value.length === 0) return "5.0";
  const sum = reviews.value.reduce((acc, r) => acc + (r.rating || 5), 0);
  return (sum / reviews.value.length).toFixed(1);
});

const countStar = (star) => {
  return reviews.value.filter((r) => r.rating === star).length;
};

const getStarPercent = (star) => {
  if (reviews.value.length === 0) return 0;
  return (countStar(star) / reviews.value.length) * 100;
};

const filteredReviews = computed(() => {
  if (selectedStarFilter.value === 0) return reviews.value;
  return reviews.value.filter((r) => r.rating === selectedStarFilter.value);
});

const starText = (rating) => {
  const mapVi = {
    5: "5 Sao — Tuyệt đỉnh xuất sắc!",
    4: "4 Sao — Rất ngon và hài lòng",
    3: "3 Sao — Tương đối ổn",
    2: "2 Sao — Cần cải thiện",
    1: "1 Sao — Chưa đạt yêu cầu",
  };
  const mapEn = {
    5: "5 Stars — Outstanding & Delicious!",
    4: "4 Stars — Very Good & Satisfying",
    3: "3 Stars — Average",
    2: "2 Stars — Needs Improvement",
    1: "1 Star — Poor Experience",
  };
  return (props.isEnglish ? mapEn : mapVi)[rating] || `${rating} Sao`;
};

const fetchReviews = async () => {
  if (!props.dishId) return;
  loading.value = true;
  try {
    const res = await api.get(`/reviews/dish/${props.dishId}`);
    reviews.value = res.data.data.reviews || [];
  } catch (err) {
    console.error("Lỗi lấy danh sách đánh giá:", err);
  } finally {
    loading.value = false;
  }
};

const submitReview = async () => {
  if (!reviewForm.comment.trim()) {
    toast.error(props.isEnglish ? "Please enter your review comment" : "Vui lòng nhập nội dung nhận xét");
    return;
  }
  submitting.value = true;
  try {
    await api.post("/reviews", {
      dishId: props.dishId,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    });
    toast.success(props.isEnglish ? "Thank you for your review!" : "Cảm ơn bạn đã gửi đánh giá món ăn!");
    reviewForm.comment = "";
    reviewForm.rating = 5;
    await fetchReviews();
    emit("review-added");
  } catch (err) {
    toast.error(err.response?.data?.message || (props.isEnglish ? "Failed to submit review" : "Gửi đánh giá thất bại"));
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchReviews();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px solid #dee2e6;
  }
}
</style>
