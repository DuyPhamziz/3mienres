<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content rounded-4 p-2 shadow">
        <div class="modal-header border-0 pb-1">
          <h6 class="modal-title fw-bold brand-font text-danger" style="font-size: 0.9rem">
            <i class="fa-solid fa-puzzle-piece me-1"></i>Tạo Liên Kết Bàn
          </h6>
          <button @click="$emit('close')" type="button" class="btn-close btn-close-sm"></button>
        </div>
        <div class="modal-body py-1" style="font-size: 0.78rem">
          <div class="mb-2">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Bàn thứ nhất</label>
            <input v-model="form.tableA" type="text" class="form-control form-control-sm text-uppercase" placeholder="VD: B01" style="font-size: 0.75rem" />
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Bàn thứ hai (kề bàn 1)</label>
            <input v-model="form.tableB" type="text" class="form-control form-control-sm text-uppercase" placeholder="VD: B02" style="font-size: 0.75rem" />
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold mb-1" style="font-size: 0.72rem">Ghi chú vị trí</label>
            <input v-model="form.note" type="text" class="form-control form-control-sm" placeholder="VD: 2 bàn sát nhau dãy cửa sổ" style="font-size: 0.75rem" />
          </div>
          <div v-if="error" class="alert alert-danger small rounded-3 py-1 px-2 mb-0" style="font-size: 0.7rem">
            {{ error }}
          </div>
        </div>
        <div class="modal-footer border-0 pt-1">
          <button @click="$emit('close')" class="btn btn-light btn-sm rounded-pill px-3" style="font-size: 0.72rem">Hủy</button>
          <button @click="$emit('submit', form)" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold" style="font-size: 0.72rem">
            <i class="fa-solid fa-link me-1"></i>Tạo Liên Kết
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

defineProps({
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["close", "submit"]);

const form = reactive({
  tableA: "",
  tableB: "",
  note: "",
});
</script>
