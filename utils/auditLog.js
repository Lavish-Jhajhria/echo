// Write audit logs (non-blocking)

const AuditLog = require('../models/AuditLog');

// Create audit log entry in background
function createAuditLog(options) {
  const { admin = 'Admin', action, targetType, targetId, details = '', severity = 'low' } = options;
  if (!action || !targetType) return;

  AuditLog.create({
    admin,
    action,
    targetType,
    targetId: targetId || '',
    details: String(details).slice(0, 1000),
    severity: ['low', 'medium', 'high'].includes(severity) ? severity : 'low'
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Audit log write failed:', err.message);
  });
}

module.exports = { createAuditLog };
