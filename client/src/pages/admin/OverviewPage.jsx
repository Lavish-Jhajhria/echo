/**
 * Admin overview page (KPIs + last 7 days chart).
 */

import React, { useEffect, useState } from 'react';
import { MessageSquare, ShieldAlert, Users } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import KPICard from '../../components/admin/KPICard';
import { getChartData, getDashboardStats } from '../../services/adminService';

const formatShortDate = (value) => {
  if (typeof value !== 'string') return value;
  // YYYY-MM-DD -> MMM DD
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
};

/**
 * OverviewPage.
 * @returns {JSX.Element}
 */
const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [s, c] = await Promise.all([getDashboardStats(), getChartData()]);
      setStats(s);
      setChartData(c);
    } catch (e) {
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const feedbackGrowth = stats?.feedbackGrowth ?? 0;
  const growthTrend = feedbackGrowth > 0 ? 'up' : feedbackGrowth < 0 ? 'down' : 'neutral';

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-600">Key metrics and recent activity.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm text-slate-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Feedback"
          value={stats?.totalFeedback ?? (loading ? '…' : 0)}
          change={feedbackGrowth}
          trend={growthTrend}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <KPICard
          title="Active Users (This Week)"
          value={stats?.activeUsersThisWeek ?? (loading ? '…' : 0)}
          icon={<Users className="w-5 h-5" />}
        />
        <KPICard
          title="Comments (This Week)"
          value={stats?.thisWeekCount ?? (loading ? '…' : 0)}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <KPICard
          title="Flagged Items"
          value={stats?.flaggedCount ?? (loading ? '…' : 0)}
          icon={<ShieldAlert className="w-5 h-5" />}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Feedback Volume (Last 7 Days)</h2>
          <p className="text-sm text-slate-600">Daily feedback submissions.</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#64748b" />
              <YAxis stroke="#64748b" allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) => `Date: ${formatShortDate(label)}`}
                formatter={(value) => [`${value}`, 'Feedback']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

