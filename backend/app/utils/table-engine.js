const Reservation = require("../models/reservation.model");
const DiningSession = require("../models/dining-session.model");
const TableConnection = require("../models/table-connection.model");

// 1. Kiểm tra 2 khoảng thời gian có trùng lặp (Overlap) hay không
exports.isTimeOverlap = (startA, endA, startB, endB) => {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
};

// 2. Tìm tất cả các tableId đang bị chiếm dụng trong khung giờ [startAt, endAt]
exports.getOccupiedTableIds = async (startAt, endAt) => {
  const occupiedSet = new Set();
  const startTime = new Date(startAt);
  const endTime = new Date(endAt);

  // A. Kiểm tra các bàn đang có khách ngồi ăn thực tế (DiningSession ACTIVE)
  const activeSessions = await DiningSession.find({ status: "ACTIVE" });
  for (let session of activeSessions) {
    // Bàn đang có khách ngồi (ACTIVE): nếu thiếu expectedEndTime thì coi như vẫn đang chiếm (an toàn hơn)
    if (!session.expectedEndTime || session.expectedEndTime > startTime) {
      session.tables.forEach((tableId) => occupiedSet.add(tableId.toString()));
    }
  }

  // B. Kiểm tra các bàn đã được giữ trước cho Reservation trong cùng khung giờ
  const overlappingReservations = await Reservation.find({
    status: { $in: ["PENDING", "CONFIRMED", "ARRIVED"] },
    startAt: { $lt: endTime },
    endAt: { $gt: startTime },
  });

  for (let res of overlappingReservations) {
    if (res.tables && res.tables.length > 0) {
      res.tables.forEach((tableId) => occupiedSet.add(tableId.toString()));
    }
  }

  return occupiedSet;
};

// 3. Kiểm tra danh sách bàn có tạo thành cụm "kề nhau" (đồ thị liên thông) hay không
exports.validateMergeableTables = async (tableIds) => {
  const ids = (tableIds || []).map((id) => id.toString());
  if (ids.length <= 1) return { isValid: true, disconnected: [] };

  const connections = await TableConnection.find();
  const adj = new Map(ids.map((id) => [id, []]));

  connections.forEach((conn) => {
    const a = conn.tableA.toString();
    const b = conn.tableB.toString();
    if (adj.has(a) && adj.has(b)) {
      adj.get(a).push(b);
      adj.get(b).push(a);
    }
  });

  // BFS từ bàn đầu tiên
  const visited = new Set([ids[0]]);
  const queue = [ids[0]];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const neighbor of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  const disconnected = ids.filter((id) => !visited.has(id));
  return { isValid: disconnected.length === 0, disconnected };
};

// Helper: chọn tập con tối ưu (ít lãng phí chỗ nhất) trong 1 cụm bàn
function bestSubset(cluster, targetGuests) {
  const n = cluster.length;

  // Với cụm nhỏ (<= 6 bàn): duyệt mọi subset để tìm tổ hợp ít lãng phí nhất
  if (n <= 6) {
    let best = null;
    for (let mask = 1; mask < 1 << n; mask++) {
      let capacity = 0;
      let count = 0;
      const tables = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          capacity += cluster[i].capacity;
          count++;
          tables.push(cluster[i]);
        }
      }
      if (capacity >= targetGuests) {
        const waste = capacity - targetGuests;
        if (!best || waste < best.waste || (waste === best.waste && count < best.count)) {
          best = { waste, count, tables, totalCapacity: capacity };
        }
      }
    }
    if (best) return best;
  }

  // Fallback: greedy sắp sức chứa giảm dần, thêm tới khi đủ
  const sorted = [...cluster].sort((a, b) => b.capacity - a.capacity);
  const tables = [];
  let capacity = 0;
  for (const t of sorted) {
    tables.push(t);
    capacity += t.capacity;
    if (capacity >= targetGuests) break;
  }
  return { waste: capacity - targetGuests, count: tables.length, tables, totalCapacity: capacity };
}

// 4. Thuật toán tìm cụm bàn ghép hợp lệ (dựa trên đồ thị TableConnection) - tối ưu ít lãng phí chỗ
exports.findCombinations = async (availableTables, targetGuests) => {
  if (!availableTables || availableTables.length === 0) return [];

  const availableMap = new Map();
  availableTables.forEach((t) => availableMap.set(t._id.toString(), t));

  const connections = await TableConnection.find();

  // Xây dựng danh sách kề (Adjacency List)
  const adj = new Map();
  availableTables.forEach((t) => adj.set(t._id.toString(), []));

  connections.forEach((conn) => {
    const idA = conn.tableA.toString();
    const idB = conn.tableB.toString();
    if (availableMap.has(idA) && availableMap.has(idB)) {
      adj.get(idA).push(idB);
      adj.get(idB).push(idA);
    }
  });

  const validCombinations = [];
  const visited = new Set();

  for (let table of availableTables) {
    const startId = table._id.toString();
    if (visited.has(startId)) continue;

    // Duyệt cụm bàn liên thông bằng BFS
    const cluster = [];
    const queue = [startId];
    const clusterVisited = new Set([startId]);

    while (queue.length > 0) {
      const current = queue.shift();
      cluster.push(availableMap.get(current));

      for (let neighbor of adj.get(current) || []) {
        if (!clusterVisited.has(neighbor)) {
          clusterVisited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    clusterVisited.forEach((id) => visited.add(id));

    // Tính tổng sức chứa; nếu đủ thì chọn tập con tối ưu (ít lãng phí chỗ)
    const totalCapacity = cluster.reduce((sum, t) => sum + t.capacity, 0);
    if (totalCapacity >= targetGuests) {
      const subset = bestSubset(cluster, targetGuests);
      validCombinations.push({
        totalCapacity: subset.totalCapacity,
        tables: subset.tables,
      });
    }
  }

  return validCombinations;
};
