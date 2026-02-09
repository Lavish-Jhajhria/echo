// Report controller

const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLog');

// Submit new report
const createReport = async (req, res) => {
  try {
    const { feedbackId, reportedBy, feedbackAuthor, reason, details } = req.body;

    if (!feedbackId || !reportedBy || !feedbackAuthor || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const reporterId = reportedBy.userId || reportedBy.user_id;
    const existingReport = await Report.findOne({
      feedbackId,
      'reportedBy.userId': reporterId
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        error: 'You have already reported this feedback'
      });
    }

    const report = await Report.create({
      feedbackId,
      reportedBy: {
        userId: reportedBy.userId || reportedBy.user_id,
        userName: reportedBy.userName || reportedBy.user_name,
        userEmail: reportedBy.userEmail || reportedBy.user_email
      },
      feedbackAuthor: {
        userId: feedbackAuthor.userId || feedbackAuthor.user_id || '',
        userName: feedbackAuthor.userName || feedbackAuthor.user_name || '',
        userEmail: feedbackAuthor.userEmail || feedbackAuthor.user_email || ''
      },
      reason,
      details: details ? String(details).slice(0, 500) : ''
    });

    const feedback = await Feedback.findById(feedbackId);
    if (feedback) {
      feedback.reportsCount = (feedback.reportsCount || 0) + 1;
      feedback.reportedBy = feedback.reportedBy || [];
      feedback.reportedBy.push({
        userId: report.reportedBy.userId,
        reportId: report.reportId,
        createdAt: new Date()
      });
      if (feedback.reportsCount >= 3) {
        feedback.status = 'flagged';
      }
      await feedback.save();
    }

    const authorUserId = feedbackAuthor.userId || feedbackAuthor.user_id;
    if (authorUserId) {
      const reportedUser = await User.findOne({ userId: authorUserId });
      if (reportedUser) {
        reportedUser.reportsReceived = (reportedUser.reportsReceived || 0) + 1;
        if (reportedUser.reportsReceived >= 10) {
          reportedUser.riskLevel = 'high';
        } else if (reportedUser.reportsReceived >= 5) {
          reportedUser.riskLevel = 'medium';
        }
        await reportedUser.save();
      }
    }

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report'
    });
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const reports = await Report.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
};

// Review and action report
const reviewReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, status } = req.body;

    const report = await Report.findOne({ reportId });
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    report.status = status || 'reviewed';
    report.action = action || 'none';
    report.reviewedBy = 'Admin';
    report.reviewedAt = new Date();
    await report.save();

    if (action === 'content_removed') {
      await Feedback.findByIdAndUpdate(report.feedbackId, {
        status: 'removed',
        isVisible: false
      });
    } else if (action === 'user_suspended') {
      await User.findOneAndUpdate(
        { userId: report.feedbackAuthor.userId },
        {
          status: 'suspended',
          suspendedAt: new Date(),
          suspensionReason: 'Multiple reports received'
        }
      );
    } else if (action === 'user_banned') {
      await User.findOneAndUpdate(
        { userId: report.feedbackAuthor.userId },
        {
          status: 'banned',
          bannedAt: new Date(),
          suspensionReason: 'Severe violations'
        }
      );
    }

    const severity = action === 'user_banned' ? 'high' : action === 'user_suspended' || action === 'content_removed' ? 'medium' : 'low';
    createAuditLog({
      admin: 'Admin',
      action: 'review_report',
      targetType: 'report',
      targetId: reportId,
      details: `Action: ${action}`,
      severity
    });

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report reviewed and action taken'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Review report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review report'
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  reviewReport
};
