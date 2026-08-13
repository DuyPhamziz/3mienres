import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin" || state.user?.role === "manager",
    isStaff: (state) => ["staff", "manager", "admin"].includes(state.user?.role),
  },
  actions: {
    setAuth(res) {
      this.token = res.token;
      this.refreshToken = res.refreshToken;
      this.user = res.data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("refreshToken", this.refreshToken);
      localStorage.setItem("user", JSON.stringify(this.user));
    },
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/login", { email, password });
        this.setAuth(res.data);
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
        this.setAuth(res.data);
        return res.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Đăng ký thất bại!";
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await api.post("/auth/logout");
      } catch {
        // Bỏ qua lỗi khi logout (token có thể đã hết hạn)
      } finally {
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    },
  },
});
