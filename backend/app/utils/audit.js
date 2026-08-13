// Tiện ích ghi nhật ký thao tác (audit log) - fire-and-forget, không chặn luồng chính.
const AuditLog = require("../models/audit-log.model");

exports.logAction = (req, action, entity = "", entityId = "", details = {}) => {
  try {
    const user = req && req.user ? req.user : null;
    AuditLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : "",
      userRole: user ? user.role : "",
      action,
      entity,
      entityId: entityId ? String(entityId) : "",
      details,
    }).catch(() => {});
  } catch (err) {
    // Bỏ qua lỗi ghi log, không ảnh hưởng nghiệp vụ chính
  }
};
