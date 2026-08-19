<template>
  <div class="glass-card p-4 rounded-4 bg-white shadow-sm">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="fw-bold text-dark mb-0">
        <i class="fa-solid fa-list-check me-2 text-danger"></i>Danh Sách Đơn Đặt Bàn Gần Đây
      </h6>
      <span class="badge bg-light text-secondary border px-2.5 py-1.5 rounded-pill fs-8">
        Tổng: {{ meta.total || reservations.length }} đơn
      </span>
    </div>

    <!-- Table -->
    <div v-if="reservations.length > 0" class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr class="text-muted small bg-light">
            <th>Mã Đơn</th>
            <th>Khách Hàng</th>
            <th>Số Khách</th>
            <th>Giờ Đặt Bàn</th>
            <th>Bàn Dự Kiến</th>
            <th>Trạng Thái</th>
            <th>Tiền Cọc</th>
            <th>Mã QR</th>
            <th class="text-end">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="res in reservations"
            :key="res._id"
            :class="{ 'table-success border-2 border-success': activeReservationId === res._id }"
          >
            <td>
              <strong class="text-danger fs-6 brand-font">{{ res.reservationCode }}</strong>
            </td>
            <td>
              <strong class="d-block text-dark">{{ res.customerName }}</strong>
              <small class="text-muted">{{ res.customerPhone }}</small>
            </td>
            <td><span class="badge bg-secondary rounded-pill px-2.5 py-1">{{ res.guestsCount }} người</span></td>
            <td>
              <small class="fw-semibold text-danger d-block">{{ new Date(res.startAt).toLocaleString('vi-VN') }}</small>
              <div v-if="res.rescheduleRequest?.status === 'PENDING'" class="mt-1 p-1 bg-warning bg-opacity-15 border border-warning rounded-2 fs-9 text-dark">
                <strong>⏳ Xin dời sang:</strong><br />
                <span class="text-danger fw-bold">{{ new Date(res.rescheduleRequest.requestedStartAt).toLocaleString('vi-VN') }}</span>
              </div>
            </td>
            <td>
              <div v-if="res.tables && res.tables.length > 0" class="d-flex gap-1 flex-wrap">
                <span v-for="t in res.tables" :key="t._id" class="badge bg-danger rounded-pill">
                  Bàn {{ t.tableNumber }}
                </span>
              </div>
              <span v-else class="text-muted fs-8">Chưa gán bàn</span>
            </td>
            <td>
              <span
                :class="[
                  'badge px-2.5 py-1.5 rounded-pill fs-8',
                  res.rescheduleRequest?.status === 'PENDING' ? 'bg-warning text-dark border border-warning' :
                  res.status === 'CONFIRMED' ? 'bg-success' : 
                  res.status === 'ARRIVED' ? 'bg-primary' : 
                  res.status === 'NO_SHOW' ? 'bg-dark text-white' :
                  res.status === 'CANCELLED' ? 'bg-danger bg-opacity-10 text-danger' :
                  res.status === 'COMPLETED' ? 'bg-secondary' : 'bg-warning text-dark'
                ]"
              >
                {{ 
                  res.rescheduleRequest?.status === 'PENDING' ? '⏳ Chờ duyệt dời' :
                  res.status === 'CONFIRMED' ? 'Đã duyệt' : 
                  res.status === 'ARRIVED' ? 'Đã đến' : 
                  res.status === 'NO_SHOW' ? 'Vắng mặt (No-Show)' :
                  res.status === 'CANCELLED' ? 'Đã hủy' :
                  res.status === 'COMPLETED' ? 'Hoàn tất' : res.status 
                }}
              </span>
            </td>
            <td>
              <template v-if="res.depositAmount > 0">
                <strong class="d-block text-danger small">{{ res.depositAmount.toLocaleString('vi-VN') }}đ</strong>
                <span :class="['badge rounded-pill fs-8', res.depositStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark']">
                  {{ res.depositStatus === 'PAID' ? 'Đã nhận' : 'Chưa nhận' }}
                </span>
              </template>
              <span v-else class="text-muted fs-8">Không cọc</span>
            </td>
            <td>
              <button
                @click="$emit('open-qr', res)"
                class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-0.5 fs-8"
                title="Xem và tải thẻ QR của đơn này"
              >
                <i class="fa-solid fa-qrcode me-1"></i> QR
              </button>
            </td>
            <td class="text-end">
              <div class="d-flex gap-1.5 justify-content-end flex-wrap">
                <!-- Nút Duyệt / Từ chối dời lịch nếu khách có yêu cầu -->
                <template v-if="res.rescheduleRequest?.status === 'PENDING'">
                  <button
                    @click="$emit('approve-reschedule', res)"
                    class="btn btn-primary btn-sm rounded-pill px-2.5 py-1 fw-bold fs-8 shadow-2xs"
                    title="Xác nhận duyệt dời sang giờ mới"
                  >
                    <i class="fa-solid fa-calendar-check me-1"></i> Duyệt Dời
                  </button>
                  <button
                    @click="$emit('reject-reschedule', res)"
                    class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 fs-8"
                    title="Từ chối yêu cầu dời lịch"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </template>

                <button
                  v-if="res.depositAmount > 0 && res.depositStatus !== 'PAID' && (res.status === 'CONFIRMED' || res.status === 'PENDING')"
                  @click="$emit('confirm-deposit', res)"
                  class="btn btn-warning btn-sm rounded-pill px-2.5 py-1 fw-bold fs-8"
                >
                  <i class="fa-solid fa-money-bill-transfer me-1"></i> Nhận Cọc
                </button>
                <button
                  v-if="res.status === 'CONFIRMED' || res.status === 'PENDING'"
                  @click="$emit('check-in', res)"
                  class="btn btn-success btn-sm rounded-pill px-3 py-1 fw-bold fs-8 shadow-2xs"
                  title="Mở bàn ngay theo thông tin đã đặt"
                >
                  <i class="fa-solid fa-right-to-bracket me-1"></i> Check-in
                </button>
                <button
                  v-if="res.status === 'CONFIRMED' || res.status === 'PENDING'"
                  @click="$emit('custom-check-in', res)"
                  class="btn btn-outline-success btn-sm rounded-pill px-2.5 py-1 fs-8"
                  title="Tùy chỉnh số lượng khách hoặc đổi cụm bàn trước khi mở bàn"
                >
                  <i class="fa-solid fa-sliders"></i>
                </button>
                <button
                  v-if="res.status === 'CONFIRMED' || res.status === 'PENDING'"
                  @click="$emit('mark-no-show', res)"
                  class="btn btn-outline-dark btn-sm rounded-pill px-2.5 py-1 fs-8"
                  title="Đánh dấu khách không đến nhận bàn"
                >
                  <i class="fa-solid fa-user-xmark me-1"></i> No-Show
                </button>
                <span v-if="res.status === 'ARRIVED' || res.status === 'COMPLETED'" class="text-muted small fs-8">Đã vào bàn</span>
                <span v-if="res.status === 'NO_SHOW'" class="text-muted small fs-8">Quá giờ hủy bàn</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <p v-else class="text-muted small py-4 text-center mb-0">Không tìm thấy đơn đặt bàn khớp với từ khóa tìm kiếm</p>

    <!-- Phân trang -->
    <div v-if="meta.totalPages > 1" class="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
      <small class="text-muted">Trang {{ meta.page }}/{{ meta.totalPages }} · {{ meta.total }} đơn</small>
      <div class="d-flex gap-2">
        <button
          @click="$emit('page-change', meta.page - 1)"
          :disabled="meta.page <= 1"
          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
        >
          <i class="fa-solid fa-chevron-left me-1"></i> Trước
        </button>
        <button
          @click="$emit('page-change', meta.page + 1)"
          :disabled="meta.page >= meta.totalPages"
          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
        >
          Sau <i class="fa-solid fa-chevron-right ms-1"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reservations: {
    type: Array,
    default: () => [],
  },
  meta: {
    type: Object,
    default: () => ({ page: 1, totalPages: 1, total: 0 }),
  },
  activeReservationId: {
    type: String,
    default: "",
  },
});

defineEmits(["page-change", "open-qr", "check-in", "custom-check-in", "confirm-deposit", "mark-no-show"]);
</script>

<style scoped>
.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
