<script setup>
import { computed } from 'vue'

const props = defineProps({
  table: { type: Object, required: true },
  connectedNumbers: { type: Array, default: () => [] },
  isDragSource: { type: Boolean, default: false },
  isDropTarget: { type: Boolean, default: false },
  dragSourceNumber: { type: String, default: '' },
})

const emit = defineEmits(['drag-start', 'drag-end', 'drag-over', 'drag-leave', 'drop', 'edit', 'delete'])

const statusColors = {
  AVAILABLE: '#22c55e',
  RESERVED: '#f59e0b',
  OCCUPIED: '#ef4444',
  MAINTENANCE: '#6b7280',
}

const isUpcoming = computed(() => !!props.table.upcomingReservation && props.table.status === 'AVAILABLE')

const borderClass = computed(() => {
  if (isUpcoming.value) return 'border-upcoming'
  const map = {
    AVAILABLE: 'border-available',
    RESERVED: 'border-reserved',
    OCCUPIED: 'border-occupied',
    MAINTENANCE: 'border-maintenance',
  }
  return map[props.table.status] || ''
})

const markerColor = computed(() => {
  if (isUpcoming.value) return '#f59e0b'
  return statusColors[props.table.status] || '#6b7280'
})

const upcomingTooltip = computed(() => {
  if (!props.table.upcomingReservation) return ''
  const u = props.table.upcomingReservation
  const timeStr = new Date(u.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return `Lịch đặt sắp tới: ${u.customerName} (${u.guestsCount} khách) lúc ${timeStr} - Mã ${u.reservationCode}`
})

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', props.table._id)
  e.dataTransfer.effectAllowed = 'link'
  emit('drag-start', props.table)
}

function onDragOver(e) {
  e.dataTransfer.dropEffect = 'link'
  emit('drag-over', props.table)
}
</script>

<template>
  <div
    class="compact-card position-relative"
    :class="[borderClass, { 'drag-source': isDragSource, 'drop-target': isDropTarget, 'upcoming-highlight': isUpcoming }]"
    :title="upcomingTooltip"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="emit('drag-end')"
    @dragover.prevent="onDragOver"
    @dragleave="emit('drag-leave', table)"
    @drop.prevent="emit('drop', table)"
  >
    <!-- Table marker badge -->
    <div class="table-marker" :style="{ backgroundColor: markerColor }">
      {{ table.tableNumber }}
    </div>

    <!-- Info text -->
    <div class="card-info" v-if="!isDropTarget">
      <div class="d-flex align-items-center justify-content-between gap-1">
        <span class="card-cap">{{ table.capacity }} chỗ</span>
        <span v-if="isUpcoming" class="upcoming-badge" :title="upcomingTooltip">
          <i class="fa-solid fa-clock me-0.5"></i>{{ new Date(table.upcomingReservation.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }}
        </span>
      </div>
      <span v-if="connectedNumbers.length" class="card-links" :title="`Ghép với: ${connectedNumbers.join(', ')}`">
        🔗 {{ connectedNumbers.join(', ') }}
      </span>
    </div>

    <!-- Drop target callout -->
    <div v-else class="card-info drop-hint text-warning fw-bold">
      <i class="fa-solid fa-link me-1"></i>Ghép với {{ dragSourceNumber || 'bàn' }}
    </div>

    <!-- Quick action buttons on hover -->
    <div class="card-actions" @click.stop>
      <button
        @click.stop="emit('edit', table)"
        class="action-btn text-primary"
        title="Chỉnh sửa bàn"
      >
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button
        @click.stop="emit('delete', table)"
        class="action-btn text-danger"
        title="Xóa bàn"
      >
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <div class="drag-handle" title="Kéo để ghép bàn">
      <i class="fa-solid fa-grip-vertical"></i>
    </div>
  </div>
</template>

<style scoped>
.compact-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  background: #fff;
  height: 48px;
  box-sizing: border-box;
  transition: all 0.18s ease;
}
.compact-card:hover {
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
.compact-card:active {
  cursor: grabbing;
}
.table-marker {
  width: 38px;
  height: 34px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 11px;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.25);
}
.card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.drop-hint {
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-cap {
  font-size: 12px;
  color: #374151;
  font-weight: 600;
}
.card-links {
  font-size: 10px;
  color: #d97706;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: none;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.compact-card:hover .card-actions {
  display: flex;
}
.action-btn {
  background: transparent;
  border: none;
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.15s, transform 0.15s;
}
.action-btn:hover {
  opacity: 1;
  transform: scale(1.15);
}

.drag-handle {
  font-size: 11px;
  color: #cbd5e1;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.compact-card:hover .drag-handle {
  color: #94a3b8;
}

.border-available { border-color: #86efac; }
.border-reserved { border-color: #fcd34d; }
.border-occupied { border-color: #fca5a5; }
.border-maintenance { border-color: #d1d5db; }
.border-upcoming { border-color: #f59e0b; }

.upcoming-highlight {
  background: #fffdf5;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.4);
}

.upcoming-badge {
  font-size: 9px;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  padding: 1px 4px;
  border-radius: 4px;
  white-space: nowrap;
}

.drag-source {
  opacity: 0.35;
  transform: scale(0.96);
  border-style: dashed;
}
.drop-target {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.35);
  background: #fffbeb !important;
  transform: scale(1.04);
}
</style>
