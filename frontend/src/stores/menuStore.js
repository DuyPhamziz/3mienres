import { defineStore } from "pinia";
import api from "../services/api";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    categories: [],
    dishes: [],
    dishesMeta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    currentDish: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchCategories() {
      try {
        const res = await api.get("/categories");
        this.categories = res.data.data.categories;
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    },
    async fetchDishes(params = {}) {
      this.loading = true;
      try {
        const res = await api.get("/dishes", { params });
        this.dishes = res.data.data.dishes;
        this.dishesMeta = {
          page: res.data.page || 1,
          limit: res.data.limit || 100,
          total: res.data.total || 0,
          totalPages: res.data.totalPages || 0,
        };
        return res.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Lỗi tải danh sách món ăn";
      } finally {
        this.loading = false;
      }
    },
    async fetchDishBySlug(slug) {
      this.loading = true;
      try {
        const res = await api.get(`/dishes/slug/${slug}`);
        this.currentDish = res.data.data.dish;
        return res.data.data.dish;
      } catch (err) {
        this.error = err.response?.data?.message || "Không tìm thấy món ăn";
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
  },
});
