<template>
  <div v-if="show" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-dialog-custom">
      <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
        <!-- Header -->
        <div class="modal-header border-0 pb-1">
          <div>
            <h5 class="modal-title fw-bold brand-font text-danger mb-0">
              <i class="fa-solid fa-comments text-warning me-2"></i>
              {{ isEnglish ? 'Customer Feedback & Suggestions' : 'Góp Ý & Đóng Góp Ý Kiến' }}
            </h5>
            <small class="text-muted fs-8">
              {{ isEnglish ? 'Help us improve our food quality and service experience' : 'Ý kiến của bạn là động lực để Nhà hàng 3 Miền Cua nâng cao chất lượng' }}
            </small>
          </div>
          <button @click="$emit('close')" type="button" class="btn-close" :disabled="loading"></button>
        </div>

        <!-- Body / Form -->
        <div class="modal-body py-3">
          <form @submit.prevent="handleSubmit">
            <!-- Row 1: Name & Phone -->
            <div class="row g-2 mb-3">
              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark mb-1">
                  {{ isEnglish ? 'Your Name *' : 'Họ và tên *' }}
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control form-control-sm rounded-3"
                  :placeholder="isEnglish ? 'Enter your name' : 'Nhập họ và tên'"
                  required
                />
              </div>
              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark mb-1">
                  {{ isEnglish ? 'Phone Number *' : 'Số điện thoại *' }}
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="form-control form-control-sm rounded-3"
                  :placeholder="isEnglish ? 'E.g: 0901234567' : 'Ví dụ: 0901234567'"
                  required
                />
              </div>
            </div>

            <!-- Row 2: Category & Overall Rating -->
            <div class="row g-2 mb-3">
              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark mb-1">
                  {{ isEnglish ? 'Feedback Category' : 'Chủ đề góp ý' }}
                </label>
                <select v-model="form.category" class="form-select form-select-sm rounded-3">
                  <option value="SERVICE">{{ isEnglish ? 'Staff & Service' : 'Thái độ phục vụ & Nhân viên' }}</option>
                  <option value="FOOD">{{ isEnglish ? 'Food & Taste' : 'Chất lượng món ăn' }}</option>
                  <option value="ATMOSPHERE">{{ isEnglish ? 'Ambiance & Seating' : 'Không gian & Vệ sinh' }}</option>
                  <option value="PRICING">{{ isEnglish ? 'Pricing & Promotion' : 'Giá cả & Chương trình ưu đãi' }}</option>
                  <option value="OTHER">{{ isEnglish ? 'Other suggestions' : 'Góp ý khác' }}</option>
                </select>
              </div>
              <div class="col-sm-6">
                <label class="form-label small fw-semibold text-dark mb-1">
                  {{ isEnglish ? 'Overall Experience' : 'Mức độ hài lòng' }}
                </label>
                <div class="d-flex align-items-center gap-1 fs-5 pt-1">
                  <i
                    v-for="s in 5"
                    :key="s"
                    @click="form.rating = s"
                    :class="s <= form.rating ? 'fa-solid fa-star text-warning cursor-pointer' : 'fa-regular fa-star text-secondary cursor-pointer'"
                  ></i>
                  <span class="badge bg-warning text-dark ms-2 rounded-pill fs-9 fw-bold">
                    {{ form.rating }} / 5 ★
                  </span>
                </div>
              </div>
            </div>

            <!-- Row 3: Content -->
            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark mb-1">
                {{ isEnglish ? 'Your Message & Feedback *' : 'Nội dung phản hồi / đóng góp ý kiến *' }}
              </label>
              <textarea
                v-model="form.content"
                rows="4"
                class="form-control form-control-sm rounded-3"
                :placeholder="isEnglish ? 'Please share your detailed thoughts or suggestions...' : 'Hãy chia sẻ chi tiết trải nghiệm, cảm nhận hoặc điều bạn muốn nhà hàng cải thiện...'"
                required
              ></textarea>
            </div>

            <div v-if="errorMsg" class="alert alert-danger small py-2 rounded-3 mb-3">
              <i class="fa-solid fa-circle-exclamation me-1"></i>{{ errorMsg }}
            </div>

            <!-- Footer Buttons -->
            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
              <button
                type="button"
                @click="$emit('close')"
                class="btn btn-light rounded-pill px-4 btn-sm"
                :disabled="loading"
              >
                {{ isEnglish ? 'Cancel' : 'Đóng' }}
              </button>
              <button
                type="submit"
                class="btn btn-danger rounded-pill px-4 fw-bold btn-sm shadow-sm"
                :disabled="loading || !form.name.trim() || !form.phone.trim() || !form.content.trim()"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-1.5" role="status"></span>
                <i v-else class="fa-solid fa-paper-plane me-1.5"></i>
                {{ isEnglish ? 'Send Feedback' : 'Gửi Ý Kiến' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { useReviewStore } from "../../stores/reviewStore";
import { toast } from "../../composables/useToast";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  isEnglish: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submitted"]);

const authStore = useAuthStore();
const reviewStore = useReviewStore();

const loading = ref(false);
const errorMsg = ref("");

const form = reactive({
  name: "",
  phone: "",
  email: "",
  category: "SERVICE",
  rating: 5,
  content: "",
});

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name || "";
    form.phone = authStore.user.phone || "";
    form.email = authStore.user.email || "";
  }
});

const handleSubmit = async () => {
  errorMsg.value = "";
  loading.value = true;
  try {
    const res = await reviewStore.submitFeedback({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email ? form.email.trim() : undefined,
      category: form.category,
      rating: form.rating,
      content: form.content.trim(),
    });
    toast.success(res.message || (props.isEnglish ? "Feedback submitted successfully!" : "Gửi góp ý thành công!"));
    form.content = "";
    emit("submitted");
    emit("close");
  } catch (err) {
    errorMsg.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-dialog-custom {
  max-width: 520px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
