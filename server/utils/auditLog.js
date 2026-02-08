/**
 * Helper to write audit log entries (non-blocking).
 */

const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry. Runs in background so it doesn't block the response.
 * @param {Object} options
 * @param {string} options.admin - Admin identifier
 * @param {string} options.action - delete, ban, suspend, approve, flag, review_report, etc.
 * @param {string} options.targetType - 'user', 'feedback', 'report'
 * @param {string} options.targetId - ID of the target
 * @param {string} [options.details] - Optional description
 * @param {string} [options.severity] - low, medium, high
 */
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
