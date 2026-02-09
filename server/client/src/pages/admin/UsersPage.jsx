/**
 * Admin User Management page.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users as UsersIcon,
  Search,
  Ban,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'suspended':
      return 'bg-amber-100 text-amber-700';
    case 'banned':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const getRiskColor = (risk) => {
  switch (risk) {
    case 'low':
      return 'bg-emerald-100 text-emerald-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'high':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    cyan: 'bg-cyan-100 text-cyan-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{title}</span>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color] || colorClasses.cyan}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function UserDetailsModal({ data, onClose, onAction, onRefresh }) {
  if (!data || !data.user) return null;
  const { user, feedbacks = [], reports = [] } = data;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">User Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              aria-label="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">User Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">User ID</p>
                  <p className="font-medium text-slate-900">{user.userId}</p>
                </div>
                <div>
                  <p className="text-slate-500">Name</p>
                  <p className="font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      user.status || 'active'
                    )}`}
                  >
                    {user.status || 'active'}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500">Feedback count</p>
                  <p className="font-medium text-slate-900">{feedbacks.length}</p>
                </div>
                <div>
                  <p className="text-slate-500">Reports received</p>
                  <p className="font-medium text-slate-900">{reports.length}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {user.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      onAction(user.userId, 'suspended');
                      onClose();
                      onRefresh();
                    }}
                    className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
                  >
                    Suspend
                  </button>
                )}
                {user.status === 'suspended' && (
                  <button
                    type="button"
                    onClick={() => {
                      onAction(user.userId, 'active');
                      onClose();
                      onRefresh();
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                  >
                    Activate
                  </button>
                )}
                {user.status !== 'banned' && (
                  <button
                    type="button"
                    onClick={() => {
                      onAction(user.userId, 'banned');
                      onClose();
                      onRefresh();
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Ban
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onAction(user.userId, 'delete');
                    onClose();
                    onRefresh();
                  }}
                  className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm"
                >
                  Delete user
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    highRisk: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (riskFilter !== 'all') params.set('riskLevel', riskFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      const response = await axios.get(`${API_BASE_URL}/api/users?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data);
        setStats(response.data.stats || stats);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, riskFilter, searchQuery]);

  const handleUserAction = async (userId, action, reason = '') => {
    try {
      if (action === 'delete') {
        if (
          !window.confirm(
            'Delete this user and all their feedback? This cannot be undone.'
          )
        ) {
          return;
        }
        await axios.delete(`${API_BASE_URL}/api/users/${userId}`);
      } else {
        await axios.put(`${API_BASE_URL}/api/users/${userId}/status`, {
          status: action,
          reason
        });
      }
      fetchUsers();
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert(err.response?.data?.error || 'Action failed');
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
      if (response.data.success) {
        setSelectedUser(response.data.data);
        setShowUserModal(true);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('View user error:', err);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">User Management</h1>
        <p className="text-sm text-slate-600">Monitor and manage user accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={<UsersIcon className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Suspended"
          value={stats.suspended}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Banned"
          value={stats.banned}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="all">All risk</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Feedback
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Reports
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Risk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.userId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-medium">
                          {(user.firstName || '')[0]}
                          {(user.lastName || '')[0] || ''}
                        </div>
                        <span className="text-slate-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">{user.feedbackCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={user.reportsReceived > 0 ? 'text-red-600 font-medium' : ''}>
                        {user.reportsReceived ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(
                          user.riskLevel || 'low'
                        )}`}
                      >
                        {user.riskLevel || 'low'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                          user.status || 'active'
                        )}`}
                      >
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => viewUserDetails(user.userId)}
                          className="px-2 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs"
                        >
                          View
                        </button>
                        {user.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleUserAction(user.userId, 'suspended')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                            title="Suspend"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {user.status !== 'banned' && (
                          <button
                            type="button"
                            onClick={() => handleUserAction(user.userId, 'banned')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Ban"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUserAction(user.userId, 'delete')}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <UserDetailsModal
          data={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onAction={handleUserAction}
          onRefresh={fetchUsers}
        />
      )}
    </div>
  );
}
