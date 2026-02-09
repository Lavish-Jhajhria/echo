/**
 * Admin Audit Log page - history of admin actions.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Trash2,
  Ban,
  Check,
  AlertTriangle,
  Clock,
  Download
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-600">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
      <p className={`text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-slate-500'}`}>{subtitle}</p>
    </div>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      const response = await axios.get(`${API_BASE_URL}/api/admin/audit-log?${params}`);
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, severityFilter]);

  const exportLogs = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'Target', 'Details', 'Severity'];
    const rows = logs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.admin,
      log.action,
      `${log.targetType} ${log.targetId}`,
      log.details,
      log.severity
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'delete': return <Trash2 className="w-4 h-4" />;
      case 'ban': return <Ban className="w-4 h-4" />;
      case 'suspend': return <Clock className="w-4 h-4" />;
      case 'approve': return <Check className="w-4 h-4" />;
      case 'flag': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const stats = {
    total: logs.length,
    today: logs.filter(
      (log) => new Date(log.timestamp).toDateString() === new Date().toDateString()
    ).length,
    admins: new Set(logs.map((log) => log.admin)).size,
    highSeverity: logs.filter((log) => log.severity === 'high').length
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Log</h1>
        <p className="text-slate-600">History of admin actions and system events</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Actions"
          value={stats.total.toLocaleString()}
          subtitle="In current view"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Today"
          value={stats.today}
          subtitle="Actions today"
          icon={<Shield className="w-5 h-5" />}
        />
        <StatCard
          title="Active Admins"
          value={stats.admins}
          subtitle="In current view"
          icon={<Shield className="w-5 h-5" />}
        />
        <StatCard
          title="High Severity"
          value={stats.highSeverity}
          subtitle="In current view"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="all">All Actions</option>
            <option value="delete">Delete</option>
            <option value="ban">Ban User</option>
            <option value="suspend">Suspend User</option>
            <option value="approve">Approve</option>
            <option value="flag">Flag Content</option>
            <option value="review_report">Review Report</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="button"
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log._id || index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                          {(log.admin || 'A').charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{log.admin || 'Admin'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-900">
                        {getActionIcon(log.action)}
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          {log.targetType}
                        </span>
                        <span className="ml-2 text-slate-600">{log.targetId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-md truncate">{log.details}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                          log.severity
                        )}`}
                      >
                        {log.severity}
                      </span>
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
