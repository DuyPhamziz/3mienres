const Reservation = require("../models/reservation.model");
const DiningSession = require("../models/dining-session.model");
const TableConnection = require("../models/table-connection.model");
// Thuật toán kiểm tra xung đột giờ và tìm cụm bàn ghép

// 1. Kiểm tra 2 khoảng thời gian có trùng lặp (overlap) hay không
exports.isTimeOverlap = (startA, endA, startB, endB) => {
    return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
};
// 2. Tìm tất cả các TableId đang bị chiếm dụng trong khung giò (startAt, endAt)
exports.getOccupiedTableIds = async (startAt, endAt) => {
    const occupiedSet = new Set();
    const startTime = new Date(startAt);
    const endTime = new Date(endAt);

    // A. Kiểm tra các bàn đang có khách ngồi ăn thực tế (DiningSession ACTIVE)
    const activeSession = await DiningSession.find( { status: "ACTIVE" });
    for(let session of activeSession) {
        // Nếu khách đang ngồi và giờ dự kiến kết thúc của họ đè lên khung giờ khách mới muốn đặt
        if(session.expectedEndTime > startTime) {
            session.tables.forEach((tableId) => occupiedSet.add(tableId.toString()));
        }
    }
    // B. Kiểm tra các bàn đã được giữ trước cho Reservation trong cùng khung giò
    const overlappingReservations = await Reservation.find({
        status: { $in: ["PENDING", "CONFIRMED", "ARRIVED"]},
        startAt: { $lt: endTime},
        endAt: { $gt: startTime},
    });

    for(let res of overlappingReservations) {
        if (res.tables && res.tables.length > 0) {
            res.tables.forEach((tableId) => occupiedSet.add(tableId.toString()));
        }
    }

    return occupiedSet;
};

// 3. Thuật toán tìm kiếm cụm bàn ghép hợp lệ (dựa trên đồ thị TableConnection)
exports.findCombinations = async (availableTables, targetGuests) => {
    if (!availableTables || availableTables.length ===0) return [];

    const availableMap = new Map();
    availableTable.forEach((t) => availableMap.set(t._id.toString(), t));
    javascript


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
    // Nếu khách đang ngồi và giờ dự kiến kết thúc của họ đè lên khung giờ khách mới muốn đặt
    if (session.expectedEndTime > startTime) {
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
  // Tìm kiếm tổ hợp bàn liên thông bằng thuật toán BFS/DFS
  const visited = new Set();
  for (let table of availableTables) {
    const startId = table._id.toString();
    if (visited.has(startId)) continue;
    // Duyệt cụm bàn liên thông
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
    // Đánh dấu đã xét cụm này
    clusterVisited.forEach((id) => visited.add(id));
    // Tính tổng sức chứa của cụm bàn này
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
}