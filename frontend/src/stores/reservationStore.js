import { defineStore } from "pinia";
import api from "../services/api";

export const useReservationStore = defineStore("reservation", {
  state: () => ({
    myReservations: [],
    trackedReservation: null,
    depositInfo: null,
    loading: false,
    error: null,
  }),
  actions: {
    async createReservation(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/reservations", payload);
        this.depositInfo = res.data.deposit;
        return res.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Đặt bàn thất bại!";
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    async trackReservation(code, phone) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get(`/reservations/track/${code}`, {
          params: { phone },
        });
        this.trackedReservation = res.data.data.reservation;
        this.depositInfo = res.data.deposit;
        return res.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Không tìm thấy đơn đặt bàn!";
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    async fetchMyReservations() {
      this.loading = true;
      try {
        const res = await api.get("/reservations/my-history");
        this.myReservations = res.data.data.reservations;
      } catch (err) {
        console.error("Lỗi lấy lịch sử đặt bàn:", err);
      } finally {
        this.loading = false;
      }
    },
  },
});
