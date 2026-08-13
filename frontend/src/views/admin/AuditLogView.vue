<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold brand-font mb-1"><i class="fa-solid fa-clock-rotate-left text-danger me-2"></i>Nhật Ký Thao Tác</h2>
        <p class="text-muted small mb-0">Theo dõi các thao tác quan trọng của nhân viên trên hệ thống</p>
      </div>
      <button @click="fetchLogs" class="btn btn-outline-danger btn-sm rounded-pill px-3">
        <i class="fa-solid fa-rotate me-1"></i> Làm mới
      </button>
    </div>

    <div class="glass-card p-4 rounded-4 bg-white">
      <div v-if="logs.length === 0" class="text-center text-muted py-4">
        <i class="fa-solid fa-list fs-2 d-block mb-2 opacity-50"></i>
        Chưa có nhật ký nào
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>Thời gian</th>
              <th>Người thực hiện</th>
              <th>Vai trò</th>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log._id">
              <td><small>{{ new Date(log.createdAt).toLocaleString('vi-VN') }}</small></td>
              <td><strong class="text-dark">{{ log.userName || 'Hệ thống' }}</strong></td>
              <td><span class="badge bg-secondary rounded-pill">{{ log.userRole || '—' }}</span></td>
              <td><span class="badge bg-danger rounded-pill">{{ log.action }}</span></td>
              <td><small>{{ log.entity }} <span class="text-muted">{{ log.entityId }}</span></small></td>
              <td><small class="text-muted">{{ formatDetails(log.details) }}</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";
import { toast } from "../../composables/useToast";

const logs = ref([]);

const formatDetails = (details) => {
  if (!details) return "";
  return Object.entries(details)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
};

const fetchLogs = async () => {
  try {
    const res = await api.get("/audit-logs");
    logs.value = res.data.data.logs;
  } catch (err) {
    toast.error("Lỗi lấy nhật ký thao tác");
  }
};

onMounted(() => {
  fetchLogs();
});
</script>
