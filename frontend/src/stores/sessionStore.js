import { defineStore } from "pinia";
import api from "../services/api";

export const useSessionStore = defineStore("session", {
  state: () => ({
    activeSessions: [],
    currentSession: null,
    orders: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchActiveSessions() {
      this.loading = true;
      try {
        const res = await api.get("/dining-sessions/active");
        this.activeSessions = res.data.data.activeSessions;
      } catch (err) {
        console.error("Lỗi lấy danh sách bàn đang dùng bữa:", err);
      } finally {
        this.loading = false;
      }
    },
    async checkInReservation(reservationId, actualGuestsCount, tableIds) {
      try {
        const res = await api.post("/dining-sessions/check-in", {
          reservationId,
          actualGuestsCount,
          tableIds,
        });
        await this.fetchActiveSessions();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Check-in thất bại!");
      }
    },
    async createWalkInSession(customerName, customerPhone, guestsCount, tableIds, notes) {
      try {
        const res = await api.post("/dining-sessions/walk-in", {
          customerName,
          customerPhone,
          guestsCount,
          tableIds,
          notes,
        });
        await this.fetchActiveSessions();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Tiếp nhận khách Walk-in thất bại!");
      }
    },
    async createOrder(diningSessionId, items, notes) {
      try {
        const res = await api.post("/orders", { diningSessionId, items, notes });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Ghi nhận đợt gọi món thất bại!");
      }
    },
    async createInvoice(diningSessionId, paymentMethod, discountAmount, taxPercent, notes) {
      try {
        const res = await api.post("/invoices", {
          diningSessionId,
          paymentMethod,
          discountAmount,
          taxPercent,
          notes,
        });
        await this.fetchActiveSessions();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Thanh toán thất bại!");
      }
    },
  },
});
