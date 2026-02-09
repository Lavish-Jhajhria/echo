/**
 * Admin Reports page - list, feedback preview, analytics, and review.
 */

import React, { useState, useEffect } from 'react';
import { Flag, AlertTriangle, Eye, Check, X, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const reasonLabels = {
  spam: 'Spam',
  offensive: 'Offensive',
  inappropriate: 'Inappropriate',
  harassment: 'Harassment',
  other: 'Other'
};

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-600">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function ReportDetailModal({ report, onClose, onAction, onRefresh }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Report Details</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Report Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Report ID</p>
                    <p className="font-medium text-slate-900">{report.reportId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Reason</p>
                    <p className="font-medium text-slate-900">{report.reason}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Reported By</p>
                    <p className="font-medium text-slate-900">{report.reportedBy?.userName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Feedback Author</p>
                    <p className="font-medium text-slate-900">{report.feedbackAuthor?.userName}</p>
                  </div>
                </div>
                {report.details && (
                  <div className="mt-4">
                    <p className="text-slate-600 text-sm">Additional Details</p>
                    <p className="text-slate-900 mt-1">{report.details}</p>
                  </div>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Reported Feedback Message
                </h3>
                <p className="text-slate-900 leading-relaxed">{report.feedbackMessage || 'Unable to load message.'}</p>
              </div>

              {report.status === 'pending' && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onAction(report.reportId, 'content_removed');
                      onClose();
                    }}
                    className="flex-1 min-w-[140px] px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Remove Content
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAction(report.reportId, 'user_suspended');
                      onClose();
                    }}
                    className="flex-1 min-w-[140px] px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                  >
                    Suspend User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAction(report.reportId, 'none');
                      onClose();
                    }}
                    className="flex-1 min-w-[140px] px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium"
                  >
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`${API_BASE_URL}/api/reports${params}`);
      if (response.data.success) {
        const reportsWithFeedback = await Promise.all(
          response.data.data.map(async (report) => {
            try {
              const id = report.feedbackId?._id ?? report.feedbackId;
              const feedbackRes = await axios.get(`${API_BASE_URL}/api/feedbacks/${id}`);
              return {
                ...report,
                feedbackMessage: feedbackRes.data?.data?.message ?? 'Feedback not found'
              };
            } catch {
              return { ...report, feedbackMessage: 'Unable to load feedback' };
            }
          })
        );
        setReports(reportsWithFeedback);
      }
    } catch (err) {
      console.error('Fetch reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleTakeAction = async (reportId, action) => {
    if (!window.confirm(`Take action: ${action}?`)) return;
    try {
      const response = await axios.put(`${API_BASE_URL}/api/reports/${reportId}/review`, {
        status: 'reviewed',
        action
      });
      if (response.data.success) {
        window.alert('Action taken successfully');
        fetchReports();
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to take action');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'dismissed': return 'bg-slate-100 text-slate-700';
      case 'action_taken': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'spam': return 'bg-orange-100 text-orange-700';
      case 'offensive': return 'bg-red-100 text-red-700';
      case 'harassment': return 'bg-red-100 text-red-700';
      case 'inappropriate': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const analytics = {
    spam: reports.filter((r) => r.reason === 'spam').length,
    offensive: reports.filter((r) => r.reason === 'offensive').length,
    inappropriate: reports.filter((r) => r.reason === 'inappropriate').length,
    harassment: reports.filter((r) => r.reason === 'harassment').length,
    other: reports.filter((r) => r.reason === 'other').length
  };

  const chartData = [
    { name: 'Spam', value: analytics.spam, color: '#f59e0b' },
    { name: 'Harassment', value: analytics.harassment, color: '#ef4444' },
    { name: 'Offensive', value: analytics.offensive, color: '#dc2626' },
    { name: 'Inappropriate', value: analytics.inappropriate, color: '#a855f7' },
    { name: 'Other', value: analytics.other, color: '#64748b' }
  ].filter((d) => d.value > 0);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports Management</h1>
        <p className="text-slate-600">Review and moderate reported feedback</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reports"
          value={reports.length}
          icon={<Flag className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Pending Review"
          value={reports.filter((r) => r.status === 'pending').length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Reviewed"
          value={reports.filter((r) => r.status === 'reviewed').length}
          icon={<Check className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Action Taken"
          value={reports.filter((r) => r.status === 'action_taken').length}
          icon={<Flag className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Report Types Distribution</h3>
          <p className="text-sm text-slate-600 mb-6">Breakdown of report categories</p>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full sm:w-auto space-y-3">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <label className="block text-sm font-medium text-slate-700">Filter by status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
          <option value="action_taken">Action Taken</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Report ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reported By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Feedback Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Message Preview</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No reports found</td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id || report.reportId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{report.reportId}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReasonColor(report.reason)}`}>
                        {reasonLabels[report.reason] || report.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{report.reportedBy?.userName}</td>
                    <td className="px-4 py-3 text-slate-600">{report.feedbackAuthor?.userName}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-slate-600 truncate">
                          {report.feedbackMessage ? `${report.feedbackMessage.substring(0, 50)}...` : '—'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailModal(true);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View full message
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {report.status === 'pending' && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleTakeAction(report.reportId, 'content_removed')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Remove Content
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTakeAction(report.reportId, 'none')}
                            className="px-3 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setShowDetailModal(false)}
          onAction={handleTakeAction}
          onRefresh={fetchReports}
        />
      )}
    </div>
  );
}
