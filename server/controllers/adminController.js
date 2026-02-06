/**
 * Admin handlers for managing feedback + dashboard stats.
 */

const Feedback = require('../models/Feedback');

const VALID_STATUSES = ['normal', 'flagged', 'hidden', 'removed', 'review'];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get admin dashboard stats.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);

    const prevWeekStart = new Date(now);
    prevWeekStart.setDate(now.getDate() - 14);

    const [totalFeedback, flaggedCount, thisWeekCount, prevWeekCount] = await Promise.all([
      Feedback.countDocuments({}),
      Feedback.countDocuments({ status: 'flagged' }),
      Feedback.countDocuments({ createdAt: { $gte: thisWeekStart } }),
      Feedback.countDocuments({ createdAt: { $gte: prevWeekStart, $lt: thisWeekStart } })
    ]);

    const [totalUniqueUsers, activeUsersThisWeek] = await Promise.all([
      Feedback.distinct('email').then((emails) => emails.length),
      Feedback.distinct('email', { createdAt: { $gte: thisWeekStart } }).then((emails) => emails.length)
    ]);

    const feedbackGrowth =
      prevWeekCount === 0 ? (thisWeekCount > 0 ? 100 : 0) : Math.round(((thisWeekCount - prevWeekCount) / prevWeekCount) * 100);

    return res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        totalUniqueUsers,
        activeUsersThisWeek,
        thisWeekCount,
        flaggedCount,
        feedbackGrowth
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get chart data for feedback volume over last 7 days.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const getChartData = async (req, res, next) => {
  try {
    const now = new Date();
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const end = endOfDay(now);

    const buckets = await Feedback.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const byDate = new Map(buckets.map((b) => [b._id, b.count]));

    const chartData = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      chartData.push({ date: key, count: byDate.get(key) || 0 });
    }

    return res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get feedback with filters + pagination.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const getFilteredFeedback = async (req, res, next) => {
  try {
    const {
      status = 'all',
      startDate = '',
      endDate = '',
      keyword = '',
      limit = '20',
      skip = '0'
    } = req.query;

    const query = {};

    if (typeof status === 'string' && status !== 'all' && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

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
      if (!Number.isNaN(start.getTime())) createdAt.$gte = startOfDay(start);
    }
    if (typeof endDate === 'string' && endDate.trim()) {
      const endD = new Date(endDate);
      if (!Number.isNaN(endD.getTime())) createdAt.$lte = endOfDay(endD);
    }
    if (Object.keys(createdAt).length > 0) {
      query.createdAt = createdAt;
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedSkip = Math.max(parseInt(skip, 10) || 0, 0);

    const [total, feedbacks] = await Promise.all([
      Feedback.countDocuments(query),
      Feedback.find(query).sort({ createdAt: -1 }).skip(parsedSkip).limit(parsedLimit)
    ]);

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      pagination: {
        limit: parsedLimit,
        skip: parsedSkip
      },
      data: feedbacks
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update feedback status.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const isVisible = !(status === 'hidden' || status === 'removed');

    const updated = await Feedback.findByIdAndUpdate(
      id,
      { status, isVisible },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Bulk delete feedbacks.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const bulkDeleteFeedbacks = async (req, res, next) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ids array is required'
      });
    }

    const result = await Feedback.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount || 0
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
  getChartData,
  getFilteredFeedback,
  updateFeedbackStatus,
  bulkDeleteFeedbacks
};

