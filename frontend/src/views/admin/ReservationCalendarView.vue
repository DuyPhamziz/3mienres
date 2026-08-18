<template>
  <div class="reservation-calendar-view">
    <!-- ═══ 1. HEADER & CONTROLS ═══ -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2 class="fw-bold brand-font mb-1 text-dark">
          <i class="fa-solid fa-calendar-days text-danger me-2"></i>Cuốn Lịch Đặt Bàn (Reservation Calendar)
        </h2>
        <p class="text-muted small mb-0">
          Quan sát trực quan mật độ và lịch hẹn khách đặt bàn theo Ngày, Tuần và Toàn Tháng
        </p>
      </div>

      <!-- Navigation & Mode Switcher -->
      <div class="d-flex gap-2 align-items-center flex-wrap">
        <!-- View Mode Switcher: Month / Week / Day -->
        <div class="btn-group btn-group-sm p-1 bg-light border rounded-pill shadow-2xs">
          <button
            @click="currentViewMode = 'month'"
            :class="['btn rounded-pill px-3 fw-bold fs-8', currentViewMode === 'month' ? 'btn-danger text-white' : 'btn-light text-dark']"
          >
            <i class="fa-solid fa-calendar-days me-1"></i> Tháng
          </button>
          <button
            @click="currentViewMode = 'week'"
            :class="['btn rounded-pill px-3 fw-bold fs-8', currentViewMode === 'week' ? 'btn-danger text-white' : 'btn-light text-dark']"
          >
            <i class="fa-solid fa-calendar-week me-1"></i> Tuần
          </button>
          <button
            @click="currentViewMode = 'day'"
            :class="['btn rounded-pill px-3 fw-bold fs-8', currentViewMode === 'day' ? 'btn-danger text-white' : 'btn-light text-dark']"
          >
            <i class="fa-solid fa-calendar-day me-1"></i> Ngày
          </button>
        </div>

        <!-- Date Navigator (< Today >) -->
        <div class="d-flex align-items-center bg-white border rounded-pill p-1 shadow-2xs gap-1">
          <button @click="navigateDate(-1)" class="btn btn-sm btn-light rounded-circle px-2 py-1" title="Trước">
            <i class="fa-solid fa-chevron-left fs-8"></i>
          </button>
          <button @click="goToToday" class="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1 fw-bold fs-8">
            Hôm Nay
          </button>
          <button @click="navigateDate(1)" class="btn btn-sm btn-light rounded-circle px-2 py-1" title="Sau">
            <i class="fa-solid fa-chevron-right fs-8"></i>
          </button>
        </div>

        <router-link to="/admin/reservations" class="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-2xs">
          <i class="fa-solid fa-list me-1"></i> Dạng Danh Sách
        </router-link>
        <button @click="fetchReservations" class="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-2xs">
          <i class="fa-solid fa-rotate me-1"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- ═══ 2. PERIOD TITLE & FILTER BAR ═══ -->
    <div class="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded-4 border shadow-2xs flex-wrap gap-2">
      <!-- Title Period (e.g., Tháng 08/2026 or Tuần 34, 2026) -->
      <div class="d-flex align-items-center gap-2">
        <h4 class="fw-extrabold brand-font text-danger mb-0 fs-5">
          {{ periodTitle }}
        </h4>
        <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2.5 py-1 fs-8 fw-semibold">
          {{ filteredReservations.length }} lượt đặt
        </span>
      </div>

      <!-- Filters: Status & Area -->
      <div class="d-flex gap-2 align-items-center flex-wrap">
        <select v-model="filterStatus" class="form-select form-select-sm fs-8 fw-semibold" style="width: 150px;">
          <option value="">Tất cả trạng thái</option>
          <option value="CONFIRMED">Đã duyệt (Confirmed)</option>
          <option value="ARRIVED">Đang ăn (Arrived)</option>
          <option value="PENDING">Chờ duyệt (Pending)</option>
          <option value="NO_SHOW">Vắng mặt (No-Show)</option>
          <option value="COMPLETED">Hoàn tất (Completed)</option>
        </select>

        <select v-model="filterArea" class="form-select form-select-sm fs-8 fw-semibold" style="width: 160px;">
          <option value="">Tất cả khu vực</option>
          <option v-for="area in tableStore.areas" :key="area._id" :value="area._id">
            {{ area.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- ═══ 3. KPI SUMMARY STRIP ═══ -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="bg-white p-3 rounded-4 border shadow-2xs d-flex align-items-center gap-3">
          <div class="p-2.5 bg-danger bg-opacity-10 text-danger rounded-4">
            <i class="fa-solid fa-calendar-check fs-4"></i>
          </div>
          <div>
            <small class="text-muted fs-8 d-block">Tổng Lượt Đặt</small>
            <strong class="text-dark fs-5">{{ filteredReservations.length }}</strong>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="bg-white p-3 rounded-4 border shadow-2xs d-flex align-items-center gap-3">
          <div class="p-2.5 bg-warning bg-opacity-15 text-warning rounded-4">
            <i class="fa-solid fa-users fs-4"></i>
          </div>
          <div>
            <small class="text-muted fs-8 d-block">Tổng Khách Dự Kiến</small>
            <strong class="text-dark fs-5">{{ totalGuests }} người</strong>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="bg-white p-3 rounded-4 border shadow-2xs d-flex align-items-center gap-3">
          <div class="p-2.5 bg-success bg-opacity-10 text-success rounded-4">
            <i class="fa-solid fa-money-bill-wave fs-4"></i>
          </div>
          <div>
            <small class="text-muted fs-8 d-block">Tiền Cọc Thu Được</small>
            <strong class="text-success fs-5">{{ totalDeposit.toLocaleString('vi-VN') }}đ</strong>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="bg-white p-3 rounded-4 border shadow-2xs d-flex align-items-center gap-3">
          <div class="p-2.5 bg-primary bg-opacity-10 text-primary rounded-4">
            <i class="fa-solid fa-door-open fs-4"></i>
          </div>
          <div>
            <small class="text-muted fs-8 d-block">Đã Check-in / Đến Ăn</small>
            <strong class="text-primary fs-5">{{ countStatus('ARRIVED') + countStatus('COMPLETED') }} đơn</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 4. MAIN CALENDAR BODIES ═══ -->
    <div v-if="loading" class="text-center py-5 bg-white rounded-4 border">
      <div class="spinner-border text-danger" role="status"></div>
      <p class="text-muted small mt-2">Đang tải dữ liệu lịch đặt bàn...</p>
    </div>

    <!-- A. MONTH VIEW -->
    <div v-else-if="currentViewMode === 'month'" class="month-calendar-wrapper bg-white rounded-4 border shadow-2xs p-3">
      <!-- Weekday Headers -->
      <div class="row g-1 text-center fw-bold text-secondary mb-2" style="font-size: 0.78rem;">
        <div class="col py-2 rounded-3 bg-light">Thứ Hai</div>
        <div class="col py-2 rounded-3 bg-light">Thứ Ba</div>
        <div class="col py-2 rounded-3 bg-light">Thứ Tư</div>
        <div class="col py-2 rounded-3 bg-light">Thứ Năm</div>
        <div class="col py-2 rounded-3 bg-light">Thứ Sáu</div>
        <div class="col py-2 rounded-3 bg-light text-danger">Thứ Bảy</div>
        <div class="col py-2 rounded-3 bg-light text-danger">Chủ Nhật</div>
      </div>

      <!-- Month Day Grid -->
      <div class="row g-1">
        <div
          v-for="day in monthCalendarDays"
          :key="day.dateString"
          class="col month-day-cell p-1.5 rounded-3 border position-relative transition-all"
          :class="{
            'bg-light opacity-50': !day.isCurrentMonth,
            'border-danger bg-danger bg-opacity-5': day.isToday,
            'bg-white': day.isCurrentMonth && !day.isToday,
          }"
          @click="openDayDetail(day)"
        >
          <!-- Day Header -->
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span
              :class="[
                'day-number-badge fs-8 fw-bold',
                day.isToday ? 'bg-danger text-white rounded-circle' : (day.isCurrentMonth ? 'text-dark' : 'text-muted')
              ]"
            >
              {{ day.dayNumber }}
            </span>
            <span v-if="day.reservations.length > 0" class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-1.5 py-0.5 fs-9">
              {{ day.reservations.length }} đơn ({{ day.totalGuests }}k)
            </span>
          </div>

          <!-- Day Reservation Event Chips (Up to 3 chips) -->
          <div class="day-events-list d-flex flex-column gap-1">
            <div
              v-for="res in day.reservations.slice(0, 3)"
              :key="res._id"
              class="calendar-event-chip p-1 rounded-2 cursor-pointer transition-all shadow-2xs"
              :class="statusChipClass(res.status)"
              @click.stop="openReservationDetail(res)"
              :title="`${res.reservationCode} - ${res.customerName} (${res.guestsCount} khách)`"
            >
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold fs-9 text-truncate" style="max-width: 90px;">
                  {{ formatHour(res.startAt) }} {{ res.customerName }}
                </span>
                <span class="fs-9 opacity-85">{{ res.guestsCount }}k</span>
              </div>
            </div>

            <!-- If more than 3 events -->
            <span v-if="day.reservations.length > 3" class="fs-9 text-muted text-center fw-semibold mt-0.5">
              + {{ day.reservations.length - 3 }} đơn nữa...
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- B. WEEK VIEW -->
    <div v-else-if="currentViewMode === 'week'" class="week-calendar-wrapper bg-white rounded-4 border shadow-2xs p-3">
      <div class="row g-2">
        <div
          v-for="day in weekDays"
          :key="day.dateString"
          class="col-12 col-md week-day-column p-2 rounded-4 border bg-light"
          :class="{ 'border-danger bg-danger bg-opacity-5': day.isToday }"
        >
          <!-- Column Header -->
          <div class="text-center p-2 rounded-3 bg-white border mb-2 shadow-2xs">
            <span class="d-block fw-bold fs-8 text-secondary">{{ day.weekdayName }}</span>
            <strong :class="['fs-6 d-block', day.isToday ? 'text-danger fw-extrabold' : 'text-dark']">
              {{ day.formattedDate }}
            </strong>
            <span v-if="day.reservations.length > 0" class="badge bg-danger rounded-pill fs-9 mt-1">
              {{ day.reservations.length }} đơn · {{ day.totalGuests }} khách
            </span>
            <span v-else class="text-muted fs-9 d-block mt-1">Trống</span>
          </div>

          <!-- Events in Day Column -->
          <div class="week-events-list d-flex flex-column gap-2">
            <div
              v-for="res in day.reservations"
              :key="res._id"
              class="week-event-card p-2.5 rounded-3 bg-white border shadow-2xs cursor-pointer transition-all hover-lift"
              @click="openReservationDetail(res)"
            >
              <div class="d-flex justify-content-between align-items-start mb-1">
                <span class="badge bg-light text-danger border fs-9 fw-bold">{{ res.reservationCode }}</span>
                <span :class="['badge rounded-pill fs-9', statusBadgeClass(res.status)]">
                  {{ res.status }}
                </span>
              </div>
              <strong class="d-block text-dark fs-7 text-truncate mb-1">{{ res.customerName }}</strong>
              <div class="d-flex justify-content-between small text-muted fs-8">
                <span><i class="fa-solid fa-clock text-danger me-1"></i>{{ formatHour(res.startAt) }}</span>
                <span><i class="fa-solid fa-user text-muted me-1"></i>{{ res.guestsCount }} khách</span>
              </div>
              <div v-if="res.tables && res.tables.length > 0" class="mt-1 pt-1 border-top text-secondary fs-9">
                <i class="fa-solid fa-chair text-danger me-1"></i>Bàn:
                <strong>{{ res.tables.map(t => t.tableNumber || t).join(', ') }}</strong>
              </div>
            </div>

            <div v-if="day.reservations.length === 0" class="text-center py-4 text-muted fs-9 opacity-60">
              Không có đơn
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- C. DAY VIEW (Detailed Hour by Hour Timeline) -->
    <div v-else-if="currentViewMode === 'day'" class="day-calendar-wrapper bg-white rounded-4 border shadow-2xs p-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold brand-font text-dark mb-0 fs-6">
          <i class="fa-solid fa-clock text-danger me-1.5"></i>Lịch Trình Chi Tiết Ngày {{ formatDateVn(selectedDate) }}
        </h5>
        <span class="badge bg-danger rounded-pill px-3 py-1.5 fs-8">
          {{ dayViewReservations.length }} đơn đặt trong ngày
        </span>
      </div>

      <div class="table-responsive border rounded-4">
        <table class="table table-bordered align-middle mb-0" style="font-size: 0.78rem;">
          <thead class="bg-light text-center">
            <tr>
              <th style="width: 100px;">Khung Giờ</th>
              <th>Đơn Đặt Bàn Tiếp Nhận</th>
              <th style="width: 140px;">Số Khách</th>
              <th style="width: 140px;">Bàn Gán</th>
              <th style="width: 130px;">Trạng Thái</th>
              <th style="width: 100px;">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="res in dayViewReservations" :key="res._id" class="hover-row">
              <td class="text-center fw-bold text-danger bg-light-subtle">
                {{ formatHour(res.startAt) }} - {{ formatHour(res.endAt) }}
              </td>
              <td>
                <strong class="text-dark d-block">{{ res.customerName }}</strong>
                <small class="text-muted">{{ res.customerPhone }} · Mã: {{ res.reservationCode }}</small>
              </td>
              <td class="text-center">
                <span class="badge bg-secondary bg-opacity-10 text-dark rounded-pill px-2.5 py-1 fw-bold">
                  {{ res.guestsCount }} người
                </span>
              </td>
              <td class="text-center">
                <span v-if="res.tables && res.tables.length > 0" class="badge bg-danger rounded-3 px-2 py-1 text-white fw-bold">
                  {{ res.tables.map(t => t.tableNumber || t).join(', ') }}
                </span>
                <span v-else class="text-muted fs-8">Chưa gán</span>
              </td>
              <td class="text-center">
                <span :class="['badge rounded-pill px-2.5 py-1 fs-9', statusBadgeClass(res.status)]">
                  {{ res.status }}
                </span>
              </td>
              <td class="text-center">
                <button
                  @click="openReservationDetail(res)"
                  class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-0.5 fs-9"
                >
                  Chi tiết
                </button>
              </td>
            </tr>

            <tr v-if="dayViewReservations.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="fa-solid fa-calendar-xmark fs-2 text-secondary mb-2 d-block opacity-50"></i>
                Hôm nay không có lượt đặt bàn nào.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ 5. RESERVATION DETAIL MODAL ═══ -->
    <div v-if="selectedReservation" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-5 p-3 p-md-4 shadow-lg border-0">
          <div class="modal-header border-0 pb-2">
            <div>
              <span class="badge bg-danger rounded-pill px-3 py-1 fs-8 fw-bold me-2">
                {{ selectedReservation.reservationCode }}
              </span>
              <h5 class="modal-title fw-bold brand-font text-dark d-inline">
                Chi Tiết Đơn Đặt Bàn
              </h5>
            </div>
            <button @click="selectedReservation = null" type="button" class="btn-close"></button>
          </div>

          <div class="modal-body py-2">
            <div class="row g-3">
              <!-- Customer Info -->
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-4 border h-100">
                  <h6 class="fw-bold text-dark mb-2 fs-7">
                    <i class="fa-solid fa-user text-danger me-1.5"></i>Thông Tin Khách Hàng
                  </h6>
                  <div class="small text-secondary mb-1">
                    Họ tên: <strong class="text-dark">{{ selectedReservation.customerName }}</strong>
                  </div>
                  <div class="small text-secondary mb-1">
                    Số điện thoại: <strong class="text-dark">{{ selectedReservation.customerPhone }}</strong>
                  </div>
                  <div v-if="selectedReservation.customerEmail" class="small text-secondary mb-1">
                    Email: <span class="text-dark">{{ selectedReservation.customerEmail }}</span>
                  </div>
                  <div class="small text-secondary mb-1">
                    Số lượng khách: <span class="badge bg-danger rounded-pill">{{ selectedReservation.guestsCount }} người</span>
                  </div>
                  <div v-if="selectedReservation.notes" class="small text-muted mt-2 pt-2 border-top">
                    <em>Ghi chú: {{ selectedReservation.notes }}</em>
                  </div>
                </div>
              </div>

              <!-- Time & Table Info -->
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-4 border h-100">
                  <h6 class="fw-bold text-dark mb-2 fs-7">
                    <i class="fa-solid fa-chair text-danger me-1.5"></i>Bàn & Khung Giờ
                  </h6>
                  <div class="small text-secondary mb-1">
                    Khung giờ: <strong class="text-danger">{{ formatFullDateTime(selectedReservation.startAt) }}</strong>
                  </div>
                  <div class="small text-secondary mb-1">
                    Dự kiến kết thúc: <span class="text-dark">{{ formatHour(selectedReservation.endAt) }}</span>
                  </div>
                  <div class="small text-secondary mb-1">
                    Bàn gán:
                    <strong class="text-dark">
                      {{ (selectedReservation.tables || []).map(t => t.tableNumber || t).join(', ') || 'Chưa gán' }}
                    </strong>
                  </div>
                  <div class="small text-secondary mb-1">
                    Trạng thái cọc:
                    <strong :class="selectedReservation.depositStatus === 'PAID' ? 'text-success' : 'text-warning'">
                      {{ selectedReservation.depositAmount > 0 ? selectedReservation.depositAmount.toLocaleString('vi-VN') + 'đ (' + selectedReservation.depositStatus + ')' : 'Không cọc' }}
                    </strong>
                  </div>
                  <div class="small text-secondary mb-1">
                    Trạng thái đơn:
                    <span :class="['badge rounded-pill fs-9', statusBadgeClass(selectedReservation.status)]">
                      {{ selectedReservation.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Pre-order Dishes (if any) -->
              <div v-if="selectedReservation.preOrderDishes && selectedReservation.preOrderDishes.length > 0" class="col-12">
                <div class="p-3 bg-light rounded-4 border">
                  <h6 class="fw-bold text-dark mb-2 fs-7">
                    <i class="fa-solid fa-utensils text-danger me-1.5"></i>Món Đặt Trước (Pre-order)
                  </h6>
                  <div class="d-flex flex-wrap gap-2">
                    <span
                      v-for="(item, idx) in selectedReservation.preOrderDishes"
                      :key="idx"
                      class="badge bg-white text-dark border p-2 rounded-3 shadow-2xs"
                    >
                      {{ item.dish?.name || 'Món ăn' }} x <strong>{{ item.quantity }}</strong>
                      <span class="text-danger ms-1">({{ (item.priceAtBooking * item.quantity).toLocaleString('vi-VN') }}đ)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-0 pt-2">
            <button @click="selectedReservation = null" class="btn btn-secondary btn-sm rounded-pill px-4">
              Đóng
            </button>
            <button
              v-if="selectedReservation.status === 'CONFIRMED' || selectedReservation.status === 'PENDING'"
              @click="handleCheckInFromModal(selectedReservation)"
              class="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-sm"
            >
              <i class="fa-solid fa-right-to-bracket me-1"></i> Check-in Mở Bàn Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useReservationStore } from "../../stores/reservationStore";
import { useTableStore } from "../../stores/tableStore";
import { useSessionStore } from "../../stores/sessionStore";
import { toast } from "../../composables/useToast";
import api from "../../services/api";

const reservationStore = useReservationStore();
const tableStore = useTableStore();
const sessionStore = useSessionStore();

const loading = ref(false);
const currentViewMode = ref("month"); // 'month' | 'week' | 'day'
const selectedDate = ref(new Date());

const filterStatus = ref("");
const filterArea = ref("");
const selectedReservation = ref(null);

const rawReservations = ref([]);

// ═══ LẤY DỮ LIỆU ĐẶT BÀN ═══
const fetchReservations = async () => {
  loading.value = true;
  try {
    const res = await api.get("/reservations", {
      params: { limit: 500 },
    });
    rawReservations.value = res.data?.data?.reservations || [];
  } catch (err) {
    toast.error("Không tải được dữ liệu đặt bàn: " + err.message);
    rawReservations.value = [];
  } finally {
    loading.value = false;
  }
};

// ═══ LỌC DỮ LIỆU ═══
const filteredReservations = computed(() => {
  return rawReservations.value.filter((r) => {
    if (filterStatus.value && r.status !== filterStatus.value) return false;
    if (filterArea.value) {
      const hasArea = r.tables && r.tables.some((t) => {
        const areaId = (t.area?._id || t.area || t.areaId || "").toString();
        return areaId === filterArea.value.toString();
      });
      if (!hasArea) return false;
    }
    return true;
  });
});

// ═══ THỐNG KÊ KPI ═══
const totalGuests = computed(() => {
  return filteredReservations.value.reduce((sum, r) => sum + (r.guestsCount || 0), 0);
});

const totalDeposit = computed(() => {
  return filteredReservations.value
    .filter((r) => r.depositStatus === "PAID")
    .reduce((sum, r) => sum + (r.depositAmount || 0), 0);
});

const countStatus = (status) => {
  return filteredReservations.value.filter((r) => r.status === status).length;
};

// ═══ TIÊU ĐỀ KỲ ĐANG XEM ═══
const periodTitle = computed(() => {
  const d = selectedDate.value;
  if (currentViewMode.value === "month") {
    return `Tháng ${String(d.getMonth() + 1).padStart(2, "0")} / ${d.getFullYear()}`;
  } else if (currentViewMode.value === "week") {
    const startOfWeek = getStartOfWeek(d);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `Tuần từ ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}/${endOfWeek.getFullYear()}`;
  } else {
    return `Ngày ${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
  }
});

// ═══ HELPER LỊCH THÁNG (MONTH CALENDAR) ═══
const monthCalendarDays = computed(() => {
  const year = selectedDate.value.getFullYear();
  const month = selectedDate.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Thứ 2 = 0, Chủ nhật = 6 (theo chuẩn VN)
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const days = [];
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Ngày đệm tháng trước
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const dateString = d.toISOString().split("T")[0];
    days.push({
      dateString,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      reservations: getReservationsForDate(dateString),
      totalGuests: getGuestsForDate(dateString),
    });
  }

  // 2. Ngày trong tháng hiện tại
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateString,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      reservations: getReservationsForDate(dateString),
      totalGuests: getGuestsForDate(dateString),
    });
  }

  // 3. Ngày đệm tháng sau (đủ 35 hoặc 42 ô)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const dateString = d.toISOString().split("T")[0];
    days.push({
      dateString,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      reservations: getReservationsForDate(dateString),
      totalGuests: getGuestsForDate(dateString),
    });
  }

  return days;
});

// ═══ HELPER LỊCH TUẦN (WEEK CALENDAR) ═══
const weekDays = computed(() => {
  const start = getStartOfWeek(selectedDate.value);
  const weekdayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
  const days = [];
  const todayStr = new Date().toISOString().split("T")[0];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateString = d.toISOString().split("T")[0];
    days.push({
      dateString,
      weekdayName: weekdayNames[i],
      formattedDate: `${d.getDate()}/${d.getMonth() + 1}`,
      isToday: dateString === todayStr,
      reservations: getReservationsForDate(dateString),
      totalGuests: getGuestsForDate(dateString),
    });
  }
  return days;
});

// ═══ HELPER LỊCH NGÀY (DAY VIEW) ═══
const dayViewReservations = computed(() => {
  const dateString = selectedDate.value.toISOString().split("T")[0];
  return getReservationsForDate(dateString).sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
});

// ═══ DATE UTILS ═══
function getStartOfWeek(d) {
  const date = new Date(d);
  let day = date.getDay() - 1;
  if (day === -1) day = 6;
  date.setDate(date.getDate() - day);
  return date;
}

function getReservationsForDate(dateString) {
  return filteredReservations.value.filter((r) => {
    const rDate = new Date(r.startAt).toISOString().split("T")[0];
    return rDate === dateString;
  });
}

function getGuestsForDate(dateString) {
  return getReservationsForDate(dateString).reduce((sum, r) => sum + (r.guestsCount || 0), 0);
}

const navigateDate = (step) => {
  const d = new Date(selectedDate.value);
  if (currentViewMode.value === "month") {
    d.setMonth(d.getMonth() + step);
  } else if (currentViewMode.value === "week") {
    d.setDate(d.getDate() + step * 7);
  } else {
    d.setDate(d.getDate() + step);
  }
  selectedDate.value = d;
};

const goToToday = () => {
  selectedDate.value = new Date();
};

const openDayDetail = (day) => {
  selectedDate.value = new Date(day.dateString);
  currentViewMode.value = "day";
};

const openReservationDetail = (res) => {
  selectedReservation.value = res;
};

const handleCheckInFromModal = async (reservation) => {
  try {
    const tableIds = reservation.tables && reservation.tables.length > 0
      ? reservation.tables.map((t) => t._id || t)
      : [];
    await sessionStore.checkInReservation(reservation._id, reservation.guestsCount, tableIds);
    toast.success(`Check-in mở bàn thành công cho khách hàng ${reservation.customerName}!`);
    selectedReservation.value = null;
    await fetchReservations();
  } catch (err) {
    toast.error("Lỗi Check-in: " + err.message);
  }
};

const formatHour = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const formatDateVn = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatFullDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN')}`;
};

const statusChipClass = (status) => {
  switch (status) {
    case "CONFIRMED": return "bg-success text-white";
    case "ARRIVED": return "bg-primary text-white";
    case "NO_SHOW": return "bg-dark text-white";
    case "CANCELLED": return "bg-danger bg-opacity-25 text-danger";
    case "COMPLETED": return "bg-secondary text-white";
    default: return "bg-warning text-dark";
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case "CONFIRMED": return "bg-success text-white";
    case "ARRIVED": return "bg-primary text-white";
    case "NO_SHOW": return "bg-dark text-white";
    case "CANCELLED": return "bg-danger text-white";
    case "COMPLETED": return "bg-secondary text-white";
    default: return "bg-warning text-dark";
  }
};

onMounted(async () => {
  tableStore.fetchTables();
  tableStore.fetchAreas();
  await fetchReservations();
});
</script>

<style scoped>
.month-day-cell {
  min-height: 110px;
  cursor: pointer;
  background-color: #fff;
}
.month-day-cell:hover {
  border-color: #dc2626 !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
}
.day-number-badge {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.calendar-event-chip {
  font-size: 0.68rem;
  line-height: 1.15;
}
.calendar-event-chip:hover {
  transform: scale(1.03);
}
.week-day-column {
  min-height: 460px;
}
.hover-lift {
  transition: all 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}
.hover-row:hover {
  background-color: #fef2f2;
}
.shadow-2xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.fw-extrabold {
  font-weight: 800;
}
</style>
