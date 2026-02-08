// Feedback routes

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

// Create feedback
router.post('/api/feedbacks', createFeedback);

// List feedbacks
router.get('/api/feedbacks', getAllFeedbacks);

// Search feedbacks
router.get('/api/feedbacks/search', searchFeedbacks);

// Get one feedback
router.get('/api/feedbacks/:id', getFeedbackById);

// Toggle like
router.put('/api/feedbacks/:id/like', getUserIdentifier, toggleLike);

// Delete feedback
router.delete('/api/feedbacks/:id', deleteFeedback);

module.exports = router;

