/**
 * Feedback API routes.
 */

const express = require('express');
const {
  createFeedback,
  getAllFeedbacks,
  searchFeedbacks,
  getFeedbackById,
  deleteFeedback,
  toggleLike
} = require('../controllers/feedbackController');

const getUserIdentifier = require('../middleware/getUserIdentifier');

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
 * GET /api/feedbacks/search - keyword + date-range filtering
 */
router.get('/api/feedbacks/search', searchFeedbacks);

/**
 * GET /api/feedbacks/:id - get one feedback
 */
router.get('/api/feedbacks/:id', getFeedbackById);

/**
 * PUT /api/feedbacks/:id/like - toggle like
 */
router.put('/api/feedbacks/:id/like', getUserIdentifier, toggleLike);

/**
 * DELETE /api/feedbacks/:id - remove feedback
 */
router.delete('/api/feedbacks/:id', deleteFeedback);

module.exports = router;

