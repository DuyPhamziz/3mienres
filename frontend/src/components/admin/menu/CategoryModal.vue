<template>
  <div class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-5 p-3 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold brand-font text-warning">
            <i class="fa-solid fa-layer-group me-2"></i>Quản Lý Danh Mục Món Ăn
          </h5>
          <button @click="$emit('close')" type="button" class="btn-close"></button>
        </div>
        <div class="modal-body">
          <div class="row g-2 mb-3">
            <div class="col-8">
              <input
                v-model="newCategoryName"
                @keyup.enter="handleAdd"
                type="text"
                class="form-control"
                placeholder="Tên danh mục mới..."
              />
            </div>
            <div class="col-4">
              <button @click="handleAdd" class="btn btn-warning rounded-pill w-100 fw-bold">
                Thêm Mới
              </button>
            </div>
          </div>
          <div v-if="categories.length > 0" class="category-list">
            <div
              v-for="cat in categories"
              :key="cat._id"
              class="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light mb-1"
            >
              <strong class="text-dark fs-7">{{ cat.name }}</strong>
              <button @click="$emit('delete', cat)" class="btn btn-outline-danger btn-sm rounded-pill px-2 py-0" title="Xóa danh mục">
                <i class="fa-solid fa-trash-can fs-8"></i>
              </button>
            </div>
          </div>
          <p v-else class="text-muted small text-center py-2 mb-0">Chưa có danh mục nào</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "add", "delete"]);

const newCategoryName = ref("");

const handleAdd = () => {
  if (!newCategoryName.value.trim()) return;
  emit("add", newCategoryName.value.trim());
  newCategoryName.value = "";
};
</script>

<style scoped>
.category-list {
  max-height: 250px;
  overflow-y: auto;
}
</style>
