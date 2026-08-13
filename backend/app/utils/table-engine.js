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
    if (session.expectedEndTime && session.expectedEndTime > startTime) {
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

// 3. Thuật toán tìm kiếm cụm bàn ghép hợp lệ (dựa trên đồ thị TableConnection)
exports.findCombinations = async (availableTables, targetGuests) => {
  if (!availableTables || availableTables.length === 0) return [];

  const availableMap = new Map();
  availableTables.forEach((t) => availableMap.set(t._id.toString(), t));

  // Lấy danh sách các liên kết kề nhau trong database
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

    // Tính tổng sức chứa của cụm bàn ghép này
    const totalCapacity = cluster.reduce((sum, t) => sum + t.capacity, 0);
    if (totalCapacity >= targetGuests) {
      validCombinations.push({
        totalCapacity,
        tables: cluster,
      });
    }
  }

  return validCombinations;
};