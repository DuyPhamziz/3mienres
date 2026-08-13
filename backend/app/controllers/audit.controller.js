const AuditLog = require("../models/audit-log.model");

// Lấy danh sách nhật ký thao tác (Admin / Manager)
exports.getAllLogs = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.status(200).json({ status: "success", results: logs.length, data: { logs } });
  } catch (error) {
    next(error);
  }
};
