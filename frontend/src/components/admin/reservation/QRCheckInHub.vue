<template>
  <div class="glass-card p-4 rounded-4 mb-4 border border-danger border-opacity-40 bg-white shadow-sm">
    <!-- Header của Hub -->
    <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-danger bg-opacity-10 text-danger p-2 rounded-3">
          <i class="fa-solid fa-camera-retro fs-6"></i>
        </span>
        <div>
          <h5 class="fw-bold brand-font text-dark mb-0">Tiếp Nhận & Giải Mã Ảnh QR Check-in Tại Quầy</h5>
          <small class="text-muted">Tải ảnh QR hoặc thẻ check-in của khách để hệ thống tự động nhận diện và mở bàn</small>
        </div>
      </div>

      <div v-if="latestConfirmedReservation" class="d-flex align-items-center gap-2">
        <button
          @click="testWithSampleReservation(latestConfirmedReservation)"
          class="btn btn-sm btn-outline-warning text-dark fw-bold rounded-pill px-3"
          title="Tự động nạp mã QR của đơn gần nhất để chụp hình báo cáo demo"
        >
          <i class="fa-solid fa-wand-magic-sparkles me-1 text-warning"></i> [Demo] Dùng Đơn Mẫu Gần Nhất
        </button>
      </div>
    </div>

    <div class="row g-4 align-items-stretch">
      <!-- CỘT 1: KHUNG UPLOAD ẢNH MÃ QR -->
      <div class="col-lg-5 col-md-6">
        <div
          class="dropzone-area h-100 p-4 rounded-4 border-2 border-dashed text-center d-flex flex-column justify-content-center align-items-center position-relative transition-all"
          :class="{ 'dropzone-active': isDragging, 'has-file': uploadedImagePreview }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @paste="handlePaste"
          tabindex="0"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="d-none"
            @change="handleFileSelect"
          />

          <!-- Khi chưa có ảnh -->
          <div v-if="!uploadedImagePreview" class="py-3">
            <div class="scanner-icon-box mb-3 mx-auto">
              <i class="fa-solid fa-cloud-arrow-up display-5 text-danger"></i>
            </div>
            <h6 class="fw-bold text-dark mb-1">Kéo & Thả ảnh mã QR vào đây</h6>
            <p class="text-muted small mb-3" style="font-size: 0.8rem;">
              Hoặc bấm chọn file ảnh / Nhấn <strong>Ctrl + V</strong> để dán ảnh chụp
            </p>
            <button
              type="button"
              @click="triggerFileInput"
              class="btn btn-danger btn-sm rounded-pill px-3 py-1.5 fw-semibold shadow-sm"
              :disabled="decoding"
            >
              <i class="fa-solid fa-folder-open me-1"></i> Chọn Ảnh QR Khách Gửi
            </button>
          </div>

          <!-- Khi đã có ảnh upload -->
          <div v-else class="w-100 py-1">
            <div class="position-relative d-inline-block mb-2">
              <img
                :src="uploadedImagePreview"
                alt="Ảnh QR vừa tải"
                class="img-thumbnail rounded-3 shadow-sm"
                style="max-height: 180px; max-width: 220px; object-fit: contain; background: #fff;"
              />
              <div v-if="decoding" class="decode-scan-line"></div>
              <button
                @click="clearImage"
                class="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 translate-middle shadow"
                style="width: 26px; height: 26px; padding: 0;"
                title="Xóa ảnh"
              >
                <i class="fa-solid fa-xmark fs-8"></i>
              </button>
            </div>

            <div v-if="decoding" class="text-center text-danger small fw-semibold">
              <div class="spinner-border spinner-border-sm me-1" role="status"></div>
              Đang phân tích và giải mã QR...
            </div>
            <div v-else class="d-flex justify-content-center gap-2 mt-1">
              <button
                type="button"
                @click="triggerFileInput"
                class="btn btn-outline-secondary btn-sm rounded-pill px-2.5 py-0.5 fs-8"
              >
                <i class="fa-solid fa-arrows-rotate me-1"></i> Đổi ảnh khác
              </button>
            </div>
          </div>

          <!-- Fallback gõ mã tay -->
          <div class="mt-3 pt-2 border-top w-100">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light text-muted"><i class="fa-solid fa-keyboard"></i></span>
              <input
                v-model="manualCode"
                @input="handleManualInput"
                type="text"
                class="form-control text-uppercase fw-bold"
                placeholder="Hoặc gõ mã RES-XXXXXX..."
              />
              <button v-if="manualCode" @click="clearManualInput" class="btn btn-outline-secondary" type="button">Xóa</button>
            </div>
          </div>
        </div>
      </div>

      <!-- CỘT 2: KẾT QUẢ ĐỐI SOÁT & XÁC NHẬN CHECK-IN -->
      <div class="col-lg-7 col-md-6">
        <!-- Trạng thái 1: Chưa upload / Chưa quét -->
        <div
          v-if="!decodedCode && !matchedReservation"
          class="h-100 p-4 rounded-4 border bg-light d-flex flex-column justify-content-center align-items-center text-center"
        >
          <div class="p-3 bg-white rounded-circle shadow-2xs mb-3 text-secondary">
            <i class="fa-solid fa-id-card-clip fs-3"></i>
          </div>
          <h6 class="fw-bold text-dark mb-1">Chưa có thông tin nhận diện</h6>
          <p class="text-muted small mb-0" style="max-width: 320px;">
            Sau khi tải ảnh mã QR của khách lên, thông tin đơn đặt bàn và nút check-in sẽ tự động xuất hiện tại đây.
          </p>
        </div>

        <!-- Trạng thái 2: Đọc được mã nhưng không tìm thấy đơn trong hệ thống -->
        <div
          v-else-if="decodedCode && !matchedReservation"
          class="h-100 p-4 rounded-4 border border-warning bg-warning bg-opacity-10 d-flex flex-column justify-content-center align-items-center text-center"
        >
          <i class="fa-solid fa-triangle-exclamation fs-1 text-warning mb-2"></i>
          <h6 class="fw-bold text-dark mb-1">Đã đọc mã QR: <span class="text-danger">{{ decodedCode }}</span></h6>
          <p class="text-muted small mb-3">Không tìm thấy đơn đặt bàn khớp với mã này trên hệ thống.</p>
          <button @click="clearImage" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
            Thử lại với ảnh khác
          </button>
        </div>

        <!-- Trạng thái 3: Tìm thấy Đơn Khớp - Thẻ Đối Soát Check-in -->
        <div
          v-else-if="matchedReservation"
          class="h-100 p-3 p-lg-4 rounded-4 border border-2 border-success bg-white shadow-sm d-flex flex-column justify-content-between"
        >
          <div>
            <!-- Header đối soát -->
            <div class="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
              <div>
                <div class="badge bg-success px-3 py-1.5 rounded-pill fw-bold fs-8 mb-1">
                  <i class="fa-solid fa-circle-check me-1"></i> NHẬN DIỆN MÃ QR THÀNH CÔNG
                </div>
                <h4 class="fw-bold text-danger mb-0 brand-font">
                  {{ matchedReservation.reservationCode }}
                </h4>
              </div>
              <span
                :class="[
                  'badge px-3 py-1.5 rounded-pill fw-bold fs-8',
                  matchedReservation.status === 'CONFIRMED' ? 'bg-success' :
                  matchedReservation.status === 'ARRIVED' ? 'bg-primary' :
                  matchedReservation.status === 'COMPLETED' ? 'bg-secondary' : 'bg-warning text-dark'
                ]"
              >
                {{ matchedReservation.status === 'CONFIRMED' ? 'Đang Chờ Check-in' :
                   matchedReservation.status === 'ARRIVED' ? 'Đã Vào Bàn' :
                   matchedReservation.status === 'COMPLETED' ? 'Đã Hoàn Tất' : matchedReservation.status }}
              </span>
            </div>

            <!-- Thông tin chi tiết khách hàng -->
            <div class="row g-2 small text-secondary mb-3">
              <div class="col-6">
                <span class="d-block text-muted fs-8">Khách hàng:</span>
                <strong class="text-dark fs-6">{{ matchedReservation.customerName }}</strong>
              </div>
              <div class="col-6">
                <span class="d-block text-muted fs-8">Số điện thoại:</span>
                <strong class="text-dark">{{ matchedReservation.customerPhone }}</strong>
              </div>
              <div class="col-6">
                <span class="d-block text-muted fs-8">Giờ hẹn đặt bàn:</span>
                <strong class="text-danger">
                  {{ new Date(matchedReservation.startAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }}
                </strong>
              </div>
              <div class="col-6">
                <span class="d-block text-muted fs-8">Số lượng khách:</span>
                <strong class="text-dark">{{ matchedReservation.guestsCount }} người</strong>
              </div>
              <div class="col-6">
                <span class="d-block text-muted fs-8">Bàn dự kiến:</span>
                <div v-if="matchedReservation.tables && matchedReservation.tables.length" class="d-flex gap-1 flex-wrap">
                  <span v-for="t in matchedReservation.tables" :key="t._id" class="badge bg-danger rounded-pill px-2 py-1">
                    Bàn {{ t.tableNumber }}
                  </span>
                </div>
                <span v-else class="text-muted">Chưa chỉ định</span>
              </div>
              <div class="col-6">
                <span class="d-block text-muted fs-8">Tiền cọc:</span>
                <template v-if="matchedReservation.depositAmount > 0">
                  <strong class="text-danger">{{ matchedReservation.depositAmount.toLocaleString('vi-VN') }}đ</strong>
                  <span :class="['badge ms-1 rounded-pill fs-8', matchedReservation.depositStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark']">
                    {{ matchedReservation.depositStatus === 'PAID' ? 'Đã cọc' : 'Chưa cọc' }}
                  </span>
                </template>
                <span v-else class="text-muted">Không yêu cầu cọc</span>
              </div>
            </div>
          </div>

          <!-- Các nút bấm hành động -->
          <div class="pt-2 border-top">
            <div v-if="matchedReservation.status === 'CONFIRMED' || matchedReservation.status === 'PENDING'" class="d-flex gap-2 flex-wrap">
              <button
                v-if="matchedReservation.depositAmount > 0 && matchedReservation.depositStatus !== 'PAID'"
                @click="$emit('confirm-deposit', matchedReservation)"
                class="btn btn-warning rounded-pill px-3 py-2 fw-bold flex-grow-1 shadow-sm"
                :disabled="checkInLoading"
              >
                <i class="fa-solid fa-money-bill-transfer me-1"></i> Thu Cọc & Xác Nhận
              </button>
              <button
                @click="$emit('check-in', matchedReservation)"
                class="btn btn-success rounded-pill px-4 py-2 fw-bold flex-grow-1 shadow-sm"
                :disabled="checkInLoading"
              >
                <span v-if="checkInLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="fa-solid fa-right-to-bracket me-1.5"></i>
                Xác Nhận Check-in & Mở Bàn Ngay
              </button>
              <button
                @click="$emit('custom-check-in', matchedReservation)"
                class="btn btn-outline-success rounded-pill px-3 py-2 fw-bold shadow-sm"
                :disabled="checkInLoading"
                title="Tùy chỉnh số khách thực tế hoặc đổi cụm bàn trước khi mở bàn"
              >
                <i class="fa-solid fa-sliders me-1"></i> Tùy Chỉnh
              </button>
            </div>

            <div v-else-if="matchedReservation.status === 'ARRIVED'" class="alert alert-success py-2 px-3 rounded-pill mb-0 text-center small fw-bold">
              <i class="fa-solid fa-circle-check me-1"></i> Khách đã được Check-in vào bàn thành công!
            </div>

            <div v-else class="text-center text-muted small py-1">
              Đơn đặt bàn này đã hoàn tất.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { decodeQRFromImageFile, generateQRCodeDataUrl } from "../../../utils/qrHelper";
import { toast } from "../../../composables/useToast";

const props = defineProps({
  matchedReservation: {
    type: Object,
    default: null,
  },
  latestConfirmedReservation: {
    type: Object,
    default: null,
  },
  checkInLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["code-scanned", "check-in", "custom-check-in", "confirm-deposit", "clear"]);

const fileInputRef = ref(null);
const uploadedImagePreview = ref(null);
const decodedCode = ref("");
const manualCode = ref("");
const decoding = ref(false);
const isDragging = ref(false);

const triggerFileInput = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const handleFileSelect = async (e) => {
  const file = e.target.files?.[0];
  if (file) await processFile(file);
};

const handleDrop = async (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file && file.type.startsWith("image/")) {
    await processFile(file);
  } else {
    toast.error("Vui lòng thả file hình ảnh (PNG, JPG, WEBP...)");
  }
};

const handlePaste = async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        await processFile(file);
        break;
      }
    }
  }
};

const processFile = async (file) => {
  decoding.value = true;
  decodedCode.value = "";
  try {
    const res = await decodeQRFromImageFile(file);
    uploadedImagePreview.value = res.previewUrl;
    if (res.success && res.data) {
      decodedCode.value = res.data;
      manualCode.value = res.data;
      emit("code-scanned", res.data);
      toast.success(`Đã giải mã thành công: ${res.data}`);
    } else {
      toast.warning(res.message || "Không tìm thấy mã QR hợp lệ trong ảnh.");
    }
  } catch (err) {
    toast.error("Lỗi khi xử lý ảnh: " + err.message);
  } finally {
    decoding.value = false;
  }
};

const testWithSampleReservation = async (res) => {
  if (!res) return;
  decoding.value = true;
  try {
    const qrDataUrl = await generateQRCodeDataUrl(res.reservationCode, { width: 300 });
    uploadedImagePreview.value = qrDataUrl;
    decodedCode.value = res.reservationCode;
    manualCode.value = res.reservationCode;
    emit("code-scanned", res.reservationCode);
    toast.success(`[Demo] Đã nạp thành công mã QR mẫu: ${res.reservationCode}`);
  } catch (err) {
    toast.error("Lỗi demo: " + err.message);
  } finally {
    decoding.value = false;
  }
};

const handleManualInput = () => {
  decodedCode.value = manualCode.value.trim().toUpperCase();
  emit("code-scanned", decodedCode.value);
};

const clearManualInput = () => {
  manualCode.value = "";
  decodedCode.value = "";
  emit("code-scanned", "");
};

const clearImage = () => {
  uploadedImagePreview.value = null;
  decodedCode.value = "";
  manualCode.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
  emit("clear");
};
</script>

<style scoped>
.dropzone-area {
  background-color: #fafafa;
  border-color: #e2e8f0;
  cursor: pointer;
  min-height: 240px;
}

.dropzone-area:hover,
.dropzone-active {
  background-color: #fff1f2;
  border-color: #dc2626;
}

.dropzone-area.has-file {
  background-color: #ffffff;
  border-color: #cbd5e1;
}

.scanner-icon-box {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.decode-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #dc2626;
  box-shadow: 0 0 8px #dc2626;
  animation: scanAnim 1.5s infinite ease-in-out;
}

@keyframes scanAnim {
  0% { top: 0; }
  50% { top: 100%; }
  100% { top: 0; }
}

.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
