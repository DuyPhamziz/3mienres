import { defineStore } from "pinia";
import api from "../services/api";

export const useReservationStore = defineStore("reservation", {
  state: () => ({
    myReservations: [],
    allReservations: [],
    reservationMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
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
    async fetchAllReservations(params = {}) {
      try {
        const res = await api.get("/reservations", { params });
        this.allReservations = res.data.data.reservations;
        this.reservationMeta = {
          page: res.data.page || 1,
          limit: res.data.limit || 10,
          total: res.data.total || 0,
          totalPages: res.data.totalPages || 0,
        };
        return res.data;
      } catch (err) {
        console.error("Lỗi lấy danh sách đặt bàn:", err);
        return { data: { reservations: [] } };
      }
    },
    async confirmDeposit(reservationId) {
      try {
        const res = await api.patch(`/reservations/${reservationId}/confirm-deposit`);
        await this.fetchAllReservations();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Xác nhận cọc thất bại!");
      }
    },
    async demoConfirmDeposit(reservationId) {
      try {
        const res = await api.post(`/reservations/${reservationId}/demo-confirm-deposit`);
        await this.fetchMyReservations();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Giả lập nộp cọc thất bại!");
      }
    },
    async cancelReservation(reservationId, reason) {
      try {
        const res = await api.patch(`/reservations/${reservationId}/cancel`, { reason });
        this.trackedReservation = res.data.data.reservation;
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Hủy đơn thất bại!");
      }
    },
    async rescheduleReservation(reservationId, startAt) {
      try {
        const res = await api.patch(`/reservations/${reservationId}/reschedule`, { startAt });
        this.trackedReservation = res.data.data.reservation;
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Dời lịch thất bại!");
      }
    },
    async createDepositPaymentUrl(reservationId) {
      try {
        const res = await api.post("/payments/vnpay/deposit", { reservationId });
        return res.data.paymentUrl;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Tạo URL thanh toán cọc thất bại!");
      }
    },
    async createDepositPaymentUrlMomo(reservationId) {
      try {
        const res = await api.post("/payments/momo/deposit", { reservationId });
        return res.data.paymentUrl;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Tạo URL thanh toán MoMo thất bại!");
      }
    },
  },
});
