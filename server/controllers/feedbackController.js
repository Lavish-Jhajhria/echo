/**
 * Handlers for feedback CRUD.
 */

const Feedback = require('../models/Feedback');

/**
 * Create a new feedback entry.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const createFeedback = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    // Quick required-field check before hitting Mongoose
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    const feedback = await Feedback.create({
      name,
      email,
      message
    });

    return res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    // Let the error middleware handle this
    return next(error);
  }
};

/**
 * Get all feedback entries (newest first).
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a single feedback entry by id.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete a feedback entry by id.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await feedback.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  deleteFeedback
};


