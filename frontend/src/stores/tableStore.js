import { defineStore } from "pinia";
import api from "../services/api";

export const useTableStore = defineStore("table", {
  state: () => ({
    tables: [],
    areas: [],
    connections: [],
    availabilityResult: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAreas() {
      try {
        const res = await api.get("/areas");
        this.areas = res.data.data.areas;
      } catch (err) {
        console.error("Lỗi lấy danh sách khu vực:", err);
      }
    },
    async fetchTables(params = {}) {
      this.loading = true;
      try {
        const res = await api.get("/tables", { params });
        this.tables = res.data.data.tables;
      } catch (err) {
        this.error = err.response?.data?.message || "Lỗi tải sơ đồ bàn";
      } finally {
        this.loading = false;
      }
    },
    async fetchConnections() {
      try {
        const res = await api.get("/table-connections");
        this.connections = res.data.data.connections;
      } catch (err) {
        console.error("Lỗi lấy danh sách liên kết ghép bàn:", err);
      }
    },
    async checkAvailability(startAt, endAt, guestsCount) {
      this.loading = true;
      try {
        const res = await api.get("/tables/availability", {
          params: { startAt, endAt, guestsCount },
        });
        this.availabilityResult = res.data.data;
        return res.data.data;
      } catch (err) {
        this.error = err.response?.data?.message || "Lỗi kiểm tra bàn trống";
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    async createTable(tableData) {
      try {
        const res = await api.post("/tables", tableData);
        await this.fetchTables();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Không thể tạo bàn mới!");
      }
    },
    async updateTable(tableId, tableData) {
      try {
        const res = await api.patch(`/tables/${tableId}`, tableData);
        await this.fetchTables();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Không thể cập nhật bàn ăn!");
      }
    },
    async deleteTable(tableId) {
      try {
        const res = await api.delete(`/tables/${tableId}`);
        await this.fetchTables();
        await this.fetchConnections();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Không thể xóa bàn ăn!");
      }
    },
    async createConnection(tableA, tableB, note) {
      try {
        const res = await api.post("/table-connections", { tableA, tableB, note });
        await this.fetchConnections();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Không thể tạo liên kết ghép bàn!");
      }
    },
    async deleteConnection(connectionId) {
      try {
        const res = await api.delete(`/table-connections/${connectionId}`);
        await this.fetchConnections();
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Không thể xóa liên kết ghép bàn!");
      }
    },
  },
});
