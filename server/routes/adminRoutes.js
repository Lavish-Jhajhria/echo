// Admin routes

const express = require('express');
const {
  getDashboardStats,
  getChartData,
  getFilteredFeedback,
  updateFeedbackStatus,
  bulkDeleteFeedbacks,
  getAuditLogs
} = require('../controllers/adminController');

const router = express.Router();

// Admin stats and management
router.get('/stats', getDashboardStats);
router.get('/feedbacks', getFilteredFeedback);
router.get('/feedbacks/chart-data', getChartData);
router.put('/feedbacks/:id/status', updateFeedbackStatus);
router.post('/feedbacks/bulk-delete', bulkDeleteFeedbacks);
router.get('/audit-log', getAuditLogs);

module.exports = router;

