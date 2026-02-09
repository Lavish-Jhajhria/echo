/**
 * Admin overview page (KPIs + charts + recent activity).
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, MessageSquare, Users, Activity, Flag, Trash2, Lock, CheckCircle } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import KPICard from '../../components/admin/KPICard';
import { getDashboardStats } from '../../services/adminService';

const actionColors = {
  delete: 'text-red-600',
  ban: 'text-red-700',
  suspend: 'text-amber-600',
  approve: 'text-emerald-600',
  flag: 'text-yellow-600',
  status_change: 'text-blue-600',
  review_report: 'text-purple-600',
  other: 'text-slate-600'
};

const actionBgColors = {
  delete: 'bg-red-50 text-red-600',
  ban: 'bg-red-50 text-red-700',
  suspend: 'bg-amber-50 text-amber-600',
  approve: 'bg-emerald-50 text-emerald-600',
  flag: 'bg-yellow-50 text-yellow-600',
  status_change: 'bg-blue-50 text-blue-600',
  review_report: 'bg-purple-50 text-purple-600',
  other: 'bg-slate-50 text-slate-600'
};

const actionIcons = {
  delete: <Trash2 className="w-4 h-4" />,
  ban: <Lock className="w-4 h-4" />,
  suspend: <AlertTriangle className="w-4 h-4" />,
  approve: <CheckCircle className="w-4 h-4" />,
  flag: <Flag className="w-4 h-4" />,
  status_change: <Activity className="w-4 h-4" />,
  review_report: <AlertTriangle className="w-4 h-4" />,
  other: <Activity className="w-4 h-4" />
};

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const s = await getDashboardStats();
      setStats(s);
    } catch (e) {
      setError('Unable to load dashboard data. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const feedbackGrowth = stats?.counts?.feedbackGrowth ?? 0;
  const growthTrend = feedbackGrowth > 0 ? 'up' : feedbackGrowth < 0 ? 'down' : 'neutral';

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-600">Real-time dashboard metrics and recent moderation activity.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Feedback Volume Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Feedback Volume (Last 7 Days)</h2>
          <p className="text-sm text-slate-600">Daily feedback submissions</p>
        </div>
        <div className="h-[240px]">
          {stats?.feedbackVolume && stats.feedbackVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.feedbackVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value) => [value, '']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', stroke: '#fff', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Feedback"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">No data available</div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Top Row: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Feedback"
          value={stats?.counts?.totalFeedback ?? (loading ? '…' : 0)}
          change={feedbackGrowth}
          trend={growthTrend}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <KPICard
          title="Active Users (This Week)"
          value={stats?.counts?.activeUsersThisWeek ?? (loading ? '…' : 0)}
          icon={<Users className="w-5 h-5" />}
        />
        <KPICard
          title="New Feedback (This Week)"
          value={stats?.counts?.thisWeekCount ?? (loading ? '…' : 0)}
          icon={<Activity className="w-5 h-5" />}
        />
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">Moderation Queue</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats?.moderationQueue?.pending ?? (loading ? '…' : 0)}</div>
              <div className="text-xs text-red-600 font-medium">Pending Reports</div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xl font-bold text-slate-700">{stats?.moderationQueue?.flagged ?? (loading ? '…' : 0)}</div>
              <div className="text-xs text-amber-600 font-medium">Flagged Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Active Users Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Active Users (Last 7 Days)</h2>
            <p className="text-sm text-slate-600">Daily active users and new submissions.</p>
          </div>
          <div className="h-[300px]">
            {stats?.charts?.activity && stats.charts.activity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.charts.activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value) => [value, '']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    name="Active Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="newFeedbacks"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    name="New Feedback"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No data available</div>
            )}
          </div>
        </div>

        {/* Engagement Breakdown Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Engagement Breakdown (Last 7 Days)</h2>
            <p className="text-sm text-slate-600">Likes vs comments received.</p>
          </div>
          <div className="h-[300px]">
            {stats?.charts?.engagement && stats.charts.engagement.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.engagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value) => [value, '']}
                  />
                  <Legend />
                  <Bar dataKey="likes" fill="#f43f5e" name="Likes" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="comments" fill="#f59e0b" name="Comments" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-600">Latest moderation and admin actions.</p>
        </div>

        <div className="space-y-3">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${actionBgColors[activity.action] || actionBgColors.other}`}>
                  {actionIcons[activity.action] || actionIcons.other}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.admin} <span className="text-slate-500 font-normal">{activity.action.replace('_', ' ')}</span>
                    </p>
                    <span className="text-xs font-medium text-slate-500 flex-shrink-0">{activity.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {activity.targetType} {activity.targetId && `(${activity.targetId})`}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{activity.details}</p>
                  )}
                </div>
                {activity.severity && (
                  <div className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                    activity.severity === 'high' ? 'bg-red-100 text-red-700' :
                    activity.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {activity.severity}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

