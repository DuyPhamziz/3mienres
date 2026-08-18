import { defineStore } from "pinia";
import api from "../services/api";

export const useReviewStore = defineStore("review", {
  state: () => ({
    allReviews: [],
    reviewMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    reviewStats: null,

    allFeedbacks: [],
    feedbackMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    feedbackStats: null,

    loading: false,
  }),

  actions: {
    // ═══ REVIEWS (ĐÁNH GIÁ MÓN ĂN) ═══
    async fetchDishReviews(dishId) {
      try {
        const res = await api.get(`/reviews/dish/${dishId}`);
        return res.data.data.reviews || [];
      } catch (err) {
        console.error("Lỗi tải đánh giá món ăn:", err);
        return [];
      }
    },

    async submitReview({ dishId, rating, comment }) {
      try {
        const res = await api.post("/reviews", { dishId, rating, comment });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Gửi đánh giá thất bại!");
      }
    },

    async fetchAllReviews(params = {}) {
      this.loading = true;
      try {
        const res = await api.get("/reviews", { params });
        this.allReviews = res.data.data.reviews || [];
        this.reviewMeta = {
          page: res.data.page || 1,
          limit: res.data.limit || 10,
          total: res.data.total || 0,
          totalPages: res.data.totalPages || 0,
        };
        return res.data;
      } catch (err) {
        console.error("Lỗi lấy danh sách đánh giá:", err);
        return { data: { reviews: [] } };
      } finally {
        this.loading = false;
      }
    },

    async fetchReviewStats() {
      try {
        const res = await api.get("/reviews/stats");
        this.reviewStats = res.data.data;
        return res.data.data;
      } catch (err) {
        console.error("Lỗi lấy thống kê đánh giá:", err);
      }
    },

    async replyReview(reviewId, replyComment) {
      try {
        const res = await api.patch(`/reviews/${reviewId}/reply`, { replyComment });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Phản hồi đánh giá thất bại!");
      }
    },

    async toggleReviewStatus(reviewId, status) {
      try {
        const res = await api.patch(`/reviews/${reviewId}/status`, { status });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Đổi trạng thái đánh giá thất bại!");
      }
    },

    async deleteReview(reviewId) {
      try {
        const res = await api.delete(`/reviews/${reviewId}`);
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Xóa đánh giá thất bại!");
      }
    },

    // ═══ FEEDBACKS (GÓP Ý & PHẢN HỒI DỊCH VỤ) ═══
    async submitFeedback(payload) {
      try {
        const res = await api.post("/feedbacks", payload);
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Gửi góp ý thất bại!");
      }
    },

    async fetchAllFeedbacks(params = {}) {
      this.loading = true;
      try {
        const res = await api.get("/feedbacks", { params });
        this.allFeedbacks = res.data.data.feedbacks || [];
        this.feedbackMeta = {
          page: res.data.page || 1,
          limit: res.data.limit || 10,
          total: res.data.total || 0,
          totalPages: res.data.totalPages || 0,
        };
        return res.data;
      } catch (err) {
        console.error("Lỗi lấy danh sách phản hồi:", err);
        return { data: { feedbacks: [] } };
      } finally {
        this.loading = false;
      }
    },

    async fetchFeedbackStats() {
      try {
        const res = await api.get("/feedbacks/stats");
        this.feedbackStats = res.data.data;
        return res.data.data;
      } catch (err) {
        console.error("Lỗi lấy thống kê phản hồi:", err);
      }
    },

    async updateFeedbackStatus(feedbackId, { status, adminNote }) {
      try {
        const res = await api.patch(`/feedbacks/${feedbackId}`, { status, adminNote });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Cập nhật phản hồi thất bại!");
      }
    },

    async deleteFeedback(feedbackId) {
      try {
        const res = await api.delete(`/feedbacks/${feedbackId}`);
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Xóa phản hồi thất bại!");
      }
    },
  },
});
