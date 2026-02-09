// Report schema

const mongoose = require('mongoose');

const { Schema } = mongoose;

const reportSchema = new Schema({
  reportId: {
    type: String,
    unique: true,
    sparse: true
  },
  feedbackId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Feedback'
  },
  reportedBy: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true }
  },
  feedbackAuthor: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true }
  },
  reason: {
    type: String,
    enum: ['spam', 'offensive', 'inappropriate', 'harassment', 'other'],
    required: true
  },
  details: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
    default: 'pending'
  },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  action: {
    type: String,
    enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned'],
    default: 'none'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.pre('save', async function setReportId(next) {
  if (this.isNew && !this.reportId) {
    const count = await mongoose.model('Report').countDocuments();
    this.reportId = `R-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
