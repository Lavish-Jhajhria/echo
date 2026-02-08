// Admin: feedback + stats

const Feedback = require('../models/Feedback');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');

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

// Relative timestamps (e.g., "2m ago")
const formatTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Dashboard stats with charts
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

    const [pendingReports, flaggedFeedbacks] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ status: 'flagged' })
    ]);

    // 7-day charts
    const activityChartData = [];
    const engagementChartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const uniqueUsers = await Feedback.distinct('email', { 
        createdAt: { $gte: dayStart, $lte: dayEnd } 
      }).then(emails => emails.length);
      
      const newFeedbacks = await Feedback.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });
      
      activityChartData.push({
        date: dateStr,
        activeUsers: uniqueUsers,
        newFeedbacks: newFeedbacks
      });
      
      // Engagement: sum likes and comments
      const engagement = await Feedback.aggregate([
        {
          $match: { createdAt: { $gte: dayStart, $lte: dayEnd } }
        },
        {
          $group: {
            _id: null,
            totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
            totalComments: { $sum: { $ifNull: ['$commentCount', 0] } }
          }
        }
      ]);
      
      const likes = engagement[0]?.totalLikes || 0;
      const comments = engagement[0]?.totalComments || 0;
      
      engagementChartData.push({
        date: dateStr,
        likes,
        comments
      });
    }

    // 7-day feedback volume
    // aggregate by day
    const fvStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const fvEnd = endOfDay(now);

    const fvBuckets = await Feedback.aggregate([
      { $match: { createdAt: { $gte: fvStart, $lte: fvEnd } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const fvByDate = new Map(fvBuckets.map((b) => [b._id, b.count]));

    const feedbackVolume = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(fvStart);
      d.setDate(fvStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      feedbackVolume.push({ date: label, count: fvByDate.get(key) || 0 });
    }

    // Recent Activity (last 5 audit logs)
    const auditLogs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();
    
    const recentActivity = auditLogs.map(log => ({
      id: log._id,
      admin: log.admin || 'System',
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      severity: log.severity,
      time: formatTimeAgo(new Date(log.timestamp))
    }));

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          totalFeedback,
          totalUniqueUsers,
          activeUsersThisWeek,
          thisWeekCount,
          flaggedCount,
          feedbackGrowth
        },
        moderationQueue: {
          pending: pendingReports,
          flagged: flaggedFeedbacks
        },
        charts: {
          activity: activityChartData,
          engagement: engagementChartData
        },
        feedbackVolume,
        recentActivity
      }
    });
  } catch (error) {
    return next(error);
  }
};

// Get 7-day chart data
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

// Get filtered feedbacks (pagination)
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

// Update feedback status
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

// Bulk delete feedbacks
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

// Get audit logs
const getAuditLogs = async (req, res, next) => {
  try {
    const { action = '', severity = '' } = req.query;
    const query = {};
    if (typeof action === 'string' && action.trim()) query.action = action.trim();
    if (typeof severity === 'string' && severity.trim()) query.severity = severity.trim();

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(500).lean();

    return res.status(200).json({
      success: true,
      data: logs
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
  bulkDeleteFeedbacks,
  getAuditLogs
};

