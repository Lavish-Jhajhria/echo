// Report routes

const express = require('express');
const {
  createReport,
  getAllReports,
  reviewReport
} = require('../controllers/reportController');

const router = express.Router();

router.post('/', createReport);
router.get('/', getAllReports);
router.put('/:reportId/review', reviewReport);

module.exports = router;
