/**
 * Feedback management page (filters + bulk actions + table).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Flag, Trash2 } from 'lucide-react';
import FeedbackTable from '../../components/admin/FeedbackTable';
import { bulkDeleteFeedbacks, getFilteredFeedbacks, updateFeedbackStatus } from '../../services/adminService';

const statusOptions = ['all', 'normal', 'flagged', 'hidden', 'removed', 'review'];

/**
 * @param {Object} props
 * @param {string} props.globalSearch
 * @returns {JSX.Element}
 */
const FeedbackManagementPage = ({ globalSearch }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const effectiveSearch = useMemo(() => (searchQuery || globalSearch || '').trim(), [searchQuery, globalSearch]);

  const load = async (opts = {}) => {
    try {
      setLoading(true);
      setError('');
      const skip = (opts.page ?? page) * (opts.limit ?? limit);
      const result = await getFilteredFeedbacks({
        status: statusFilter,
        keyword: effectiveSearch,
        startDate,
        endDate,
        limit: opts.limit ?? limit,
        skip
      });
      setFeedbacks(result.data);
      setTotal(result.total || 0);
    } catch (e) {
      setError('Unable to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to first page when filters change
    setPage(0);
    setSelectedIds([]);
    const t = window.setTimeout(() => load({ page: 0 }), 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, effectiveSearch, startDate, endDate, limit]);

  const onToggleSelect = (id) => {
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const onToggleSelectAll = (ids) => {
    setSelectedIds((cur) => (cur.length === ids.length ? [] : ids));
  };

  const handleBulkDelete = async (ids) => {
    if (!ids || ids.length === 0) return;
    // simple confirm
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete ${ids.length} feedback item(s)? This cannot be undone.`);
    if (!ok) return;
    try {
      setLoading(true);
      setError('');
      await bulkDeleteFeedbacks(ids);
      setSelectedIds([]);
      await load();
    } catch (e) {
      setError('Bulk delete failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      setError('');
      await Promise.all(selectedIds.map((id) => updateFeedbackStatus(id, status)));
      setSelectedIds([]);
      await load();
    } catch (e) {
      setError('Bulk status update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setError('');
      const updated = await updateFeedbackStatus(id, status);
      setFeedbacks((cur) => cur.map((f) => (f._id === id ? updated : f)));
    } catch (e) {
      setError('Unable to update status. Please try again.');
    }
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const gotoPage = async (nextPage) => {
    const clamped = Math.max(0, Math.min(nextPage, totalPages - 1));
    setPage(clamped);
    await load({ page: clamped });
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Feedback Management</h1>
        <p className="text-sm text-slate-600">Filter, review, and moderate feedback.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, or message…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {globalSearch && !searchQuery && (
              <p className="mt-1 text-[11px] text-slate-500">
                Using header search: <span className="font-medium">{globalSearch}</span>
              </p>
            )}
          </div>

          <div className="w-full lg:w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All status' : s}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-44">
            <label className="block text-xs font-medium text-slate-600 mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="w-full lg:w-44">
            <label className="block text-xs font-medium text-slate-600 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="w-full lg:w-36">
            <label className="block text-xs font-medium text-slate-600 mb-1">Page size</label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm text-indigo-900 font-medium">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkDelete(selectedIds)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-red-50 text-sm text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete selected
            </button>

            <div className="inline-flex items-center gap-2">
              <Flag className="w-4 h-4 text-slate-500" />
              <select
                onChange={(e) => {
                  const next = e.target.value;
                  if (next) handleBulkStatus(next);
                  e.target.value = '';
                }}
                defaultValue=""
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-700"
              >
                <option value="" disabled>
                  Change status…
                </option>
                <option value="normal">normal</option>
                <option value="flagged">flagged</option>
                <option value="hidden">hidden</option>
                <option value="removed">removed</option>
                <option value="review">review</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-sm text-slate-600">
            Loading…
          </div>
        ) : (
          <FeedbackTable
            feedbacks={feedbacks}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onToggleSelectAll={onToggleSelectAll}
            onView={(fb) => {
              // eslint-disable-next-line no-alert
              window.alert(`${fb.name} (${fb.email})\n\n${fb.message}`);
            }}
            onDelete={handleBulkDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium text-slate-900">{feedbacks.length}</span> of{' '}
          <span className="font-medium text-slate-900">{total}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => gotoPage(page - 1)}
            disabled={page === 0 || loading}
            className={`px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 ${
              page === 0 || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Prev
          </button>
          <span className="text-sm text-slate-600">
            Page <span className="font-medium text-slate-900">{page + 1}</span> of{' '}
            <span className="font-medium text-slate-900">{totalPages}</span>
          </span>
          <button
            type="button"
            onClick={() => gotoPage(page + 1)}
            disabled={page >= totalPages - 1 || loading}
            className={`px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 ${
              page >= totalPages - 1 || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagementPage;

