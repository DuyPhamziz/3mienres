import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin" || state.user?.role === "manager",
    isStaff: (state) => ["staff", "manager", "admin"].includes(state.user?.role),
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/login", { email, password });
        this.token = res.data.token;
        this.user = res.data.data.user;

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        return res.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Đăng nhập thất bại!";
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/register", payload);
        this.token = res.data.token;
        this.user = res.data.data.user;

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        return res.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Đăng ký thất bại!";
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
