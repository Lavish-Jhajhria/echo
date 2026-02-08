/**
 * Handlers for feedback CRUD.
 */

const Feedback = require('../models/Feedback');
const User = require('../models/User');

/**
 * Toggles like on a feedback entry.
 * @param {Object} req - Express request object (expects req.body.userIdentifier)
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware
 * @description If user already liked, removes like. Otherwise adds like.
 * @returns {Promise<void>}
 */
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userIdentifier = req.body?.userIdentifier || req.userIdentifier;

    if (!userIdentifier) {
      return res.status(400).json({
        success: false,
        error: 'userIdentifier is required to toggle likes'
      });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    const likedBy = Array.isArray(feedback.likedBy) ? feedback.likedBy : [];
    const alreadyLiked = likedBy.includes(userIdentifier);

    if (alreadyLiked) {
      feedback.likedBy = likedBy.filter((identifier) => identifier !== userIdentifier);
    } else {
      feedback.likedBy = [...likedBy, userIdentifier];
    }

    // Keep likes count in sync with likedBy
    feedback.likes = feedback.likedBy.length;

    const updated = await feedback.save();

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Searches and filters feedback entries.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware
 * @description Supports query params: keyword, startDate, endDate
 * @returns {Promise<void>}
 */
const searchFeedbacks = async (req, res, next) => {
  try {
    const { keyword = '', startDate = '', endDate = '' } = req.query;

    const query = {};

    if (typeof keyword === 'string' && keyword.trim()) {
      const safeKeyword = keyword.trim();
      query.$or = [
        { name: { $regex: safeKeyword, $options: 'i' } },
        { email: { $regex: safeKeyword, $options: 'i' } },
        { message: { $regex: safeKeyword, $options: 'i' } }
      ];
    }

    const createdAt = {};

    if (typeof startDate === 'string' && startDate.trim()) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        createdAt.$gte = start;
      }
    }

    if (typeof endDate === 'string' && endDate.trim()) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        // If user provided a date-only string (YYYY-MM-DD), make it inclusive.
        if (/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
          end.setHours(23, 59, 59, 999);
        }
        createdAt.$lte = end;
      }
    }

    if (Object.keys(createdAt).length > 0) {
      query.createdAt = createdAt;
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

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
 * Create a new feedback entry.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const createFeedback = async (req, res, next) => {
  try {
    const { userId, userName, userEmail, message } = req.body;

    // Quick required-field check before hitting Mongoose
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required. Please login first.'
      });
    }
    if (!userName) {
      return res.status(400).json({
        success: false,
        error: 'User name is required'
      });
    }
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'User email is required'
      });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Feedback message is required'
      });
    }
    if (String(message).length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot exceed 1000 characters'
      });
    }

    const author = await User.findOne({ userId });
    if (author && (author.status === 'suspended' || author.status === 'banned')) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been restricted. You cannot submit feedback.'
      });
    }

    const feedback = await Feedback.create({
      userId,
      userName,
      userEmail,
      // Backward compatible fields
      name: userName,
      email: userEmail,
      message: String(message).trim(),
      likes: 0,
      likedBy: [],
      commentCount: 0,
      status: 'normal',
      isVisible: true
    });

    return res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ') || 'Validation error'
      });
    }
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
 * Delete a feedback entry by id (only by author).
 * @param {Object} req - Express request (req.body.userId required)
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (feedback.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own feedback'
      });
    }

    await Feedback.findByIdAndDelete(id);

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
  deleteFeedback,
  toggleLike,
  searchFeedbacks
};


