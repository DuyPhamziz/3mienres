<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content rounded-4 p-2 shadow">
        <div class="modal-header border-0 pb-1">
          <h6 class="modal-title fw-bold brand-font text-danger" style="font-size: 0.9rem">
            <i class="fa-solid fa-map-pin me-1"></i>Quản Lý Khu Vực
          </h6>
          <button @click="$emit('close')" type="button" class="btn-close btn-close-sm"></button>
        </div>
        <div class="modal-body py-1" style="font-size: 0.78rem">
          <div class="row g-2 mb-2">
            <div class="col-8">
              <input
                v-model="newAreaName"
                @keyup.enter="handleAdd"
                type="text"
                class="form-control form-control-sm"
                placeholder="Tên khu vực mới..."
                style="font-size: 0.75rem"
              />
            </div>
            <div class="col-4">
              <button @click="handleAdd" class="btn btn-danger btn-sm rounded-pill w-100 fw-bold" style="font-size: 0.72rem">
                Thêm
              </button>
            </div>
          </div>
          <div v-if="areas.length > 0">
            <div
              v-for="area in areas"
              :key="area._id"
              class="d-flex justify-content-between align-items-center py-1 border-bottom"
              style="font-size: 0.75rem"
            >
              <strong class="text-dark">{{ area.name }}</strong>
              <button
                @click="$emit('delete', area)"
                class="btn btn-outline-danger rounded-pill px-2 py-0"
                style="font-size: 0.6rem"
                title="Xóa khu vực"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
          <p v-else class="text-muted small text-center py-2 mb-0" style="font-size: 0.7rem">
            Chưa có khu vực nào
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  areas: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "add", "delete"]);

const newAreaName = ref("");

const handleAdd = () => {
  if (!newAreaName.value.trim()) return;
  emit("add", newAreaName.value.trim());
  newAreaName.value = "";
};
</script>
