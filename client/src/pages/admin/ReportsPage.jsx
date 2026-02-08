/**
 * Admin Reports page - list and review reports.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const reasonLabels = {
  spam: 'Spam',
  offensive: 'Offensive',
  inappropriate: 'Inappropriate',
  harassment: 'Harassment',
  other: 'Other'
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-slate-100 text-slate-700',
  dismissed: 'bg-slate-100 text-slate-500',
  action_taken: 'bg-emerald-100 text-emerald-700'
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`${API_BASE_URL}/api/reports${params}`);
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Fetch reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleReview = async (reportId, action) => {
    try {
      await axios.put(`${API_BASE_URL}/api/reports/${reportId}/review`, {
        status: 'reviewed',
        action
      });
      fetchReports();
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert(err.response?.data?.error || 'Failed to update report');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Reports</h1>
        <p className="text-sm text-slate-600">Review and take action on reported feedback</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
          <option value="action_taken">Action taken</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Report ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Reported by
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Feedback author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id || r.reportId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.reportId}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {reasonLabels[r.reason] || r.reason}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.reportedBy?.userName} ({r.reportedBy?.userEmail})
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.feedbackAuthor?.userName} ({r.feedbackAuthor?.userEmail})
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          statusColors[r.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' ? (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const action = e.target.value;
                            if (action) handleReview(r.reportId, action);
                            e.target.value = '';
                          }}
                          className="text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-900"
                        >
                          <option value="" disabled>
                            Take action...
                          </option>
                          <option value="none">None</option>
                          <option value="warning">Warning</option>
                          <option value="content_removed">Remove content</option>
                          <option value="user_suspended">Suspend user</option>
                          <option value="user_banned">Ban user</option>
                        </select>
                      ) : (
                        <span className="text-slate-500 text-xs">{r.action || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
