<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg border-0">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold brand-font text-danger">
            <i class="fa-solid fa-code-merge me-2"></i>Gộp Bàn & Gộp Hóa Đơn
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>

        <div class="modal-body">
          <div class="p-3 bg-light rounded-4 mb-3">
            <small class="text-muted d-block mb-1">Bàn Chính Giữ Lại (Target Table):</small>
            <div class="d-flex justify-content-between align-items-center">
              <strong class="text-danger fs-6">{{ targetSession.sessionCode }} · {{ tableNumbers(targetSession) }}</strong>
              <span class="badge bg-danger bg-opacity-15 text-danger rounded-pill px-2.5 py-1 fs-9 fw-bold">
                {{ targetSession.customerName }} ({{ targetSession.actualGuestsCount || 1 }} khách)
              </span>
            </div>
          </div>

          <label class="form-label small fw-semibold text-dark mb-1">
            Chọn bàn muốn gộp vào bàn chính trên:
          </label>
          <div v-if="otherSessions.length === 0" class="text-center py-4 text-muted small">
            Không có bàn nào khác đang hoạt động để gộp.
          </div>
          <div v-else class="list-group rounded-4 mb-3 border">
            <label
              v-for="s in otherSessions"
              :key="s._id"
              :class="['list-group-item list-group-item-action d-flex justify-content-between align-items-center p-2.5 border-0 border-bottom', selectedSourceId === s._id ? 'bg-danger bg-opacity-10' : '']"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-2">
                <input
                  type="radio"
                  name="sourceSession"
                  :value="s._id"
                  v-model="selectedSourceId"
                  class="form-check-input mt-0"
                />
                <div>
                  <strong class="text-dark d-block fs-8">{{ s.sessionCode }} · {{ tableNumbers(s) }}</strong>
                  <small class="text-muted fs-9">Khách: {{ s.customerName }} ({{ s.actualGuestsCount || 1 }} người)</small>
                </div>
              </div>
              <span class="badge bg-light text-dark border fs-9 rounded-pill">
                {{ s.elapsedMinutes || 0 }} phút
              </span>
            </label>
          </div>

          <div v-if="selectedSource" class="p-2.5 bg-warning bg-opacity-15 rounded-3 text-warning-emphasis small mb-2">
            <i class="fa-solid fa-triangle-exclamation me-1"></i>
            Tất cả món đã gọi của <strong>{{ selectedSource.sessionCode }}</strong> sẽ được chuyển sang <strong>{{ targetSession.sessionCode }}</strong>. Bàn <strong>{{ selectedSource.sessionCode }}</strong> sẽ được kết thúc và sáp nhập vào bàn chính!
          </div>

          <div v-if="error" class="alert alert-danger small rounded-3 mb-0">{{ error }}</div>
        </div>

        <div class="modal-footer border-0 pt-0">
          <button @click="$emit('close')" class="btn btn-light rounded-pill px-4 btn-sm" :disabled="loading">
            Hủy Bỏ
          </button>
          <button
            @click="submitMerge"
            :disabled="!selectedSourceId || loading"
            class="btn btn-danger rounded-pill px-4 fw-bold btn-sm shadow-sm"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-1.5"></span>
            <i v-else class="fa-solid fa-code-merge me-1.5"></i>
            Xác Nhận Gộp Bàn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  targetSession: {
    type: Object,
    required: true,
  },
  activeSessions: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const selectedSourceId = ref("");

const otherSessions = computed(() => {
  return props.activeSessions.filter((s) => s._id !== props.targetSession._id);
});

const selectedSource = computed(() => {
  return otherSessions.value.find((s) => s._id === selectedSourceId.value);
});

const tableNumbers = (session) => {
  const tables = session.tables || [];
  return tables.map((t) => t.tableNumber).join("+") || "Bàn";
};

const submitMerge = () => {
  if (selectedSourceId.value) {
    emit("submit", selectedSourceId.value);
  }
};
</script>
