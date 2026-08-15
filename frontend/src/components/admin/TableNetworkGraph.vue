<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  tables: { type: Array, required: true },
  connections: { type: Array, required: true },
})

const STATUS_COLOR = { AVAILABLE: '#22c55e', RESERVED: '#f59e0b', OCCUPIED: '#ef4444', MAINTENANCE: '#6b7280' }
const STATUS_LABEL = { AVAILABLE: 'Trống', RESERVED: 'Đã đặt', OCCUPIED: 'Đang dùng', MAINTENANCE: 'Bảo trì' }
const R = 22, PAD = 50, CY = 85, MAX_H = 220

const hoveredNodeId = ref(null)

const graph = computed(() => {
  const { tables, connections } = props
  if (!connections.length) return null

  // Collect connected IDs & build adjacency
  const adj = {}
  const tableMap = Object.fromEntries(tables.map(t => [t._id, t]))
  const connectedIds = new Set()

  connections.forEach(c => {
    const a = c.tableA._id, b = c.tableB._id
    connectedIds.add(a); connectedIds.add(b)
    if (!tableMap[a]) tableMap[a] = { _id: a, tableNumber: c.tableA.tableNumber, capacity: c.tableA.capacity, status: 'AVAILABLE' }
    if (!tableMap[b]) tableMap[b] = { _id: b, tableNumber: c.tableB.tableNumber, capacity: c.tableB.capacity, status: 'AVAILABLE' }
    ;(adj[a] ||= []).push(b)
    ;(adj[b] ||= []).push(a)
  })

  // BFS connected components
  const visited = new Set()
  const clusters = []
  for (const id of connectedIds) {
    if (visited.has(id)) continue
    const queue = [id], comp = []
    visited.add(id)
    while (queue.length) {
      const cur = queue.shift()
      comp.push(cur)
      for (const nb of (adj[cur] || [])) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb) }
      }
    }
    clusters.push(comp)
  }

  // Layout clusters side-by-side, each in a circle
  const nodes = {}
  let offsetX = PAD
  const clusterBoxes = []

  clusters.forEach((comp, ci) => {
    const n = comp.length
    const clusterR = n === 1 ? 0 : Math.max(R * 1.8, (n * R * 1.2) / Math.PI)
    const cx = offsetX + clusterR + R
    let totalCap = 0

    comp.forEach((id, i) => {
      const angle = n === 1 ? 0 : (2 * Math.PI * i) / n - Math.PI / 2
      const t = tableMap[id] || { _id: id, tableNumber: '?', capacity: 0, status: 'AVAILABLE' }
      totalCap += t.capacity || 0
      nodes[id] = { ...t, x: cx + clusterR * Math.cos(angle), y: CY + clusterR * Math.sin(angle) }
    })

    const xs = comp.map(id => nodes[id].x)
    const ys = comp.map(id => nodes[id].y)
    const box = {
      x: Math.min(...xs) - R - 12, y: Math.min(...ys) - R - 22,
      w: Math.max(...xs) - Math.min(...xs) + 2 * R + 24,
      h: Math.max(...ys) - Math.min(...ys) + 2 * R + 44,
      label: `Cụm ${ci + 1} · ${totalCap} chỗ`,
    }
    clusterBoxes.push(box)
    offsetX = box.x + box.w + PAD
  })

  const edges = connections.map(c => ({
    id: c._id, a: c.tableA._id, b: c.tableB._id, note: c.note || '',
  }))

  const svgW = offsetX
  return { nodes, edges, clusterBoxes, svgW }
})

const adjSet = computed(() => {
  const s = {}
  if (!graph.value) return s
  graph.value.edges.forEach(e => {
    ;(s[e.a] ||= new Set()).add(e.b)
    ;(s[e.b] ||= new Set()).add(e.a)
  })
  return s
})

function nodeOpacity(id) {
  if (!hoveredNodeId.value) return 1
  if (id === hoveredNodeId.value) return 1
  return adjSet.value[hoveredNodeId.value]?.has(id) ? 1 : 0.2
}

function edgeOpacity(e) {
  if (!hoveredNodeId.value) return 0.45
  return (e.a === hoveredNodeId.value || e.b === hoveredNodeId.value) ? 0.9 : 0.1
}

function tooltip(n) {
  return `Bàn ${n.tableNumber} – ${n.capacity} chỗ – ${STATUS_LABEL[n.status] || n.status}`
}
</script>

<template>
  <div v-if="graph && Object.keys(graph.nodes).length" class="graph-container">
    <svg :width="graph.svgW" :height="MAX_H" :viewBox="`0 0 ${graph.svgW} ${MAX_H}`">
      <!-- cluster backgrounds -->
      <g v-for="(box, i) in graph.clusterBoxes" :key="'c' + i">
        <rect :x="box.x" :y="box.y" :width="box.w" :height="box.h"
              rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="5,4" stroke-width="1" />
        <text :x="box.x + box.w / 2" :y="box.y + 14" text-anchor="middle"
              font-size="11" fill="#64748b">{{ box.label }}</text>
      </g>

      <!-- edges -->
      <line v-for="e in graph.edges" :key="e.id"
            :x1="graph.nodes[e.a]?.x" :y1="graph.nodes[e.a]?.y"
            :x2="graph.nodes[e.b]?.x" :y2="graph.nodes[e.b]?.y"
            stroke="#94a3b8" :stroke-width="2" :opacity="edgeOpacity(e)">
        <title v-if="e.note">{{ e.note }}</title>
      </line>

      <!-- nodes -->
      <g v-for="n in graph.nodes" :key="n._id"
         :transform="`translate(${n.x},${n.y})`"
         :opacity="nodeOpacity(n._id)"
         style="cursor:pointer"
         @mouseenter="hoveredNodeId = n._id" @mouseleave="hoveredNodeId = null">
        <!-- glow ring -->
        <circle v-if="hoveredNodeId === n._id" :r="R + 5"
                :fill="STATUS_COLOR[n.status] || '#94a3b8'" opacity="0.18" />
        <circle :r="R" :fill="STATUS_COLOR[n.status] || '#94a3b8'" stroke="#fff" stroke-width="2" />
        <text text-anchor="middle" dy="-4" fill="#fff" font-size="12" font-weight="700">
          {{ n.tableNumber }}
        </text>
        <text text-anchor="middle" dy="11" fill="#fff" font-size="9" opacity="0.85">
          {{ n.capacity }} chỗ
        </text>
        <title>{{ tooltip(n) }}</title>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.graph-container {
  border-radius: 8px;
  background: #fafbfc;
  padding: 8px;
  overflow-x: auto;
}
</style>
