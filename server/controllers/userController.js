/**
 * User management controller (admin).
 */

const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Report = require('../models/Report');
const { createAuditLog } = require('../utils/auditLog');

/**
 * Get all users with stats.
 * @param {Object} req
 * @param {Object} res
 */
const getAllUsers = async (req, res) => {
  try {
    const { status, riskLevel, search } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (riskLevel && riskLevel !== 'all') query.riskLevel = riskLevel;
    if (search && String(search).trim()) {
      const term = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { firstName: term },
        { lastName: term },
        { email: term },
        { userId: term }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const feedbackCount = await Feedback.countDocuments({ userId: user.userId });
        const reportsReceived = await Report.countDocuments({
          'feedbackAuthor.userId': user.userId
        });
        const obj = user.toObject ? user.toObject() : user;
        return {
          ...obj,
          feedbackCount,
          reportsReceived
        };
      })
    );

    const [totalUsers, activeUsers, suspendedUsers, bannedUsers, highRiskUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ status: 'banned' }),
      User.countDocuments({ riskLevel: 'high' })
    ]);

    res.status(200).json({
      success: true,
      data: usersWithStats,
      stats: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        banned: bannedUsers,
        highRisk: highRiskUsers
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

/**
 * Get single user details with feedbacks and reports.
 * @param {Object} req
 * @param {Object} res
 */
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const [feedbacks, reports] = await Promise.all([
      Feedback.find({ userId }).sort({ createdAt: -1 }),
      Report.find({ 'feedbackAuthor.userId': userId }).sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: user.toObject ? user.toObject() : user,
        feedbacks,
        reports
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user details'
    });
  }
};

/**
 * Update user status (suspend/ban/activate).
 * @param {Object} req
 * @param {Object} res
 */
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.status = status;
    if (status === 'suspended') {
      user.suspendedAt = new Date();
      user.suspensionReason = reason || '';
    } else if (status === 'banned') {
      user.bannedAt = new Date();
      user.suspensionReason = reason || '';
    } else if (status === 'active') {
      user.suspendedAt = null;
      user.bannedAt = null;
      user.suspensionReason = '';
    }

    await user.save();

    const auditAction = status === 'banned' ? 'ban' : status === 'suspended' ? 'suspend' : 'approve';
    createAuditLog({
      admin: 'Admin',
      action: auditAction,
      targetType: 'user',
      targetId: userId,
      details: reason ? `Reason: ${reason}` : `User set to ${status}`,
      severity: status === 'banned' ? 'high' : status === 'suspended' ? 'medium' : 'low'
    });

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${status} successfully`
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
};

/**
 * Update user risk level.
 * @param {Object} req
 * @param {Object} res
 */
const updateUserRiskLevel = async (req, res) => {
  try {
    const { userId } = req.params;
    const { riskLevel } = req.body;

    if (!['low', 'medium', 'high'].includes(riskLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid risk level'
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.riskLevel = riskLevel;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'Risk level updated'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update risk level error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update risk level'
    });
  }
};

/**
 * Delete user and all their feedback and reports.
 * @param {Object} req
 * @param {Object} res
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await Feedback.deleteMany({ userId });
    await Report.deleteMany({
      $or: [
        { 'reportedBy.userId': userId },
        { 'feedbackAuthor.userId': userId }
      ]
    });
    await User.deleteOne({ userId });

    createAuditLog({
      admin: 'Admin',
      action: 'delete',
      targetType: 'user',
      targetId: userId,
      details: `User and associated data deleted`,
      severity: 'high'
    });

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRiskLevel,
  deleteUser
};
