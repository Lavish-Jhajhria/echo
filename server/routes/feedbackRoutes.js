/**
 * Feedback API routes.
 */

const express = require('express');
const {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  deleteFeedback
} = require('../controllers/feedbackController');

const router = express.Router();

/**
 * POST /api/feedbacks - create feedback
 */
router.post('/api/feedbacks', createFeedback);

/**
 * GET /api/feedbacks - list feedback
 */
router.get('/api/feedbacks', getAllFeedbacks);

/**
 * GET /api/feedbacks/:id - get one feedback
 */
router.get('/api/feedbacks/:id', getFeedbackById);

/**
 * DELETE /api/feedbacks/:id - remove feedback
 */
router.delete('/api/feedbacks/:id', deleteFeedback);

module.exports = router;

