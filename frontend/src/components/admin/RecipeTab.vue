<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h5 class="fw-bold brand-font mb-0"><i class="fa-solid fa-receipt text-danger me-2"></i>Công Thức Định Lượng Món Ăn</h5>
      <button @click="showForm = !showForm" class="btn btn-danger btn-sm rounded-pill px-3 fw-bold">
        <i class="fa-solid fa-plus me-1"></i> {{ showForm ? 'Đóng' : 'Thêm Công Thức' }}
      </button>
    </div>

    <!-- Form thêm / cập nhật công thức -->
    <div v-if="showForm" class="glass-card p-4 rounded-4 bg-white mb-4">
      <h6 class="fw-bold text-dark mb-3">Cấu Hình Công Thức Món</h6>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Chọn món ăn</label>
        <select v-model="form.dishId" class="form-select">
          <option value="" disabled>— Chọn món —</option>
          <option v-for="d in dishes" :key="d._id" :value="d._id">{{ d.name }}</option>
        </select>
      </div>

      <label class="form-label small fw-semibold">Nguyên liệu & định lượng</label>
      <div v-for="(row, idx) in form.ingredients" :key="idx" class="row g-2 mb-2">
        <div class="col-md-6">
          <select v-model="row.ingredient" class="form-select form-select-sm">
            <option value="" disabled>— Chọn nguyên liệu —</option>
            <option v-for="ing in ingredients" :key="ing._id" :value="ing._id">{{ ing.name }} ({{ ing.unit }})</option>
          </select>
        </div>
        <div class="col-md-4">
          <input v-model.number="row.quantityRequired" type="number" step="0.01" min="0.01" class="form-control form-control-sm" placeholder="Lượng dùng" />
        </div>
        <div class="col-md-2">
          <button @click="removeRow(idx)" class="btn btn-outline-danger btn-sm rounded-circle w-100" title="Xóa">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
      <button @click="addRow" class="btn btn-outline-danger btn-sm rounded-pill mb-3">
        <i class="fa-solid fa-plus me-1"></i> Thêm Nguyên Liệu
      </button>

      <div class="d-flex gap-2">
        <button @click="saveRecipe" :disabled="saving" class="btn btn-primary-crab px-4 fw-bold">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fa-solid fa-floppy-disk me-1"></i> Lưu Công Thức
        </button>
        <button @click="showForm = false" class="btn btn-light rounded-pill px-4">Hủy</button>
      </div>
    </div>

    <!-- Danh sách công thức -->
    <div v-if="loading" class="text-center py-4"><div class="spinner-border text-danger"></div></div>
    <div v-else-if="recipes.length === 0" class="text-center text-muted py-4">
      <i class="fa-solid fa-utensils fs-2 d-block mb-2 opacity-50"></i>
      Chưa có công thức định lượng nào
    </div>
    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr class="text-muted small">
            <th>Món ăn</th>
            <th>Nguyên liệu định lượng</th>
            <th class="text-end">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="recipe in recipes" :key="recipe._id">
            <td><strong class="text-dark">{{ recipe.dish?.name || 'Món ăn' }}</strong></td>
            <td>
              <span v-for="(line, i) in recipe.ingredients" :key="i" class="badge bg-light text-dark border me-1 mb-1">
                {{ line.ingredient?.name }}: {{ line.quantityRequired }}
              </span>
            </td>
            <td class="text-end">
              <button @click="deleteRecipe(recipe)" class="btn btn-outline-danger btn-sm rounded-pill">
                <i class="fa-solid fa-trash-can me-1"></i> Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :show="showRecipeConfirm"
      title="Xác nhận xóa công thức"
      :message="`Bạn có chắc chắn muốn xóa công thức chế biến của món '${targetRecipe?.dish?.name}'?`"
      confirm-text="Xóa công thức"
      cancel-text="Hủy"
      confirm-variant="danger"
      @cancel="showRecipeConfirm = false"
      @confirm="executeDeleteRecipe"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";
import { useMenuStore } from "../../stores/menuStore";
import { toast } from "../../composables/useToast";
import ConfirmModal from "../common/ConfirmModal.vue";

const menuStore = useMenuStore();

const recipes = ref([]);
const ingredients = ref([]);
const dishes = ref([]);
const showForm = ref(false);
const saving = ref(false);
const loading = ref(false);

const form = reactive({
  dishId: "",
  ingredients: [],
});

const addRow = () => {
  form.ingredients.push({ ingredient: "", quantityRequired: 1 });
};

const removeRow = (idx) => {
  form.ingredients.splice(idx, 1);
};

const fetchRecipes = async () => {
  loading.value = true;
  try {
    const res = await api.get("/recipes");
    recipes.value = res.data.data.recipes;
  } catch (err) {
    toast.error("Lỗi lấy danh sách công thức");
  } finally {
    loading.value = false;
  }
};

const fetchIngredients = async () => {
  try {
    const res = await api.get("/ingredients", { params: { limit: 100 } });
    ingredients.value = res.data.data.ingredients;
  } catch (err) {
    console.error("Lỗi lấy nguyên liệu:", err);
  }
};

const fetchDishes = async () => {
  try {
    await menuStore.fetchDishes({ limit: 100 });
    dishes.value = menuStore.dishes;
  } catch (err) {
    console.error("Lỗi lấy món ăn:", err);
  }
};

const saveRecipe = async () => {
  if (!form.dishId) {
    toast.error("Vui lòng chọn món ăn");
    return;
  }
  const valid = form.ingredients.filter((r) => r.ingredient && r.quantityRequired > 0);
  if (valid.length === 0) {
    toast.error("Vui lòng thêm ít nhất 1 nguyên liệu hợp lệ");
    return;
  }
  saving.value = true;
  try {
    await api.post("/recipes", {
      dishId: form.dishId,
      ingredients: valid.map((r) => ({ ingredient: r.ingredient, quantityRequired: r.quantityRequired })),
    });
    toast.success("Lưu công thức thành công!");
    showForm.value = false;
    form.dishId = "";
    form.ingredients = [];
    await fetchRecipes();
  } catch (err) {
    toast.error(err.response?.data?.message || "Lưu công thức thất bại!");
  } finally {
    saving.value = false;
  }
};

const showRecipeConfirm = ref(false);
const targetRecipe = ref(null);

const deleteRecipe = (recipe) => {
  targetRecipe.value = recipe;
  showRecipeConfirm.value = true;
};

const executeDeleteRecipe = async () => {
  if (!targetRecipe.value) return;
  try {
    await api.delete(`/recipes/${targetRecipe.value._id}`);
    toast.success("Đã xóa công thức");
    showRecipeConfirm.value = false;
    targetRecipe.value = null;
    await fetchRecipes();
  } catch (err) {
    toast.error(err.response?.data?.message || "Xóa công thức thất bại!");
  }
};

onMounted(() => {
  fetchRecipes();
  fetchIngredients();
  fetchDishes();
});
</script>
