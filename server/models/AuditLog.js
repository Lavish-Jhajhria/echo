/**
 * Audit log model for admin actions.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const auditLogSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  admin: { type: String, required: true, trim: true },
  action: {
    type: String,
    required: true,
    enum: ['delete', 'ban', 'suspend', 'approve', 'flag', 'status_change', 'review_report', 'other']
  },
  targetType: { type: String, required: true, trim: true },
  targetId: { type: String, default: '', trim: true },
  details: { type: String, default: '', maxlength: 1000 },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
