<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-danger">Tải Ảnh Lên Cho Món: {{ dish?.name }}</h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3 text-center">
            <input type="file" ref="fileInput" @change="handleFileSelected" class="form-control" accept="image/*" />
          </div>
          <div v-if="previewUrl" class="text-center my-3">
            <small class="text-muted d-block mb-2">Xem trước ảnh sắp tải lên:</small>
            <img :src="previewUrl" class="img-fluid rounded-4 shadow-sm border" style="max-height: 200px;" />
          </div>
          <div v-if="error" class="alert alert-danger small rounded-3">{{ error }}</div>
        </div>
        <div class="modal-footer border-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4">Hủy</button>
          <button @click="$emit('submit', selectedFile)" :disabled="!selectedFile || uploading" class="btn btn-danger rounded-pill px-4 fw-bold">
            <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
            Tải Ảnh Lên Server
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  dish: {
    type: Object,
    required: true,
  },
  uploading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["close", "submit"]);

const selectedFile = ref(null);
const previewUrl = ref(null);

const handleFileSelected = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};
</script>
