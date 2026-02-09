import React, { useEffect, useState, useMemo } from 'react';
import { Flag, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import FeedbackTable from '../../components/admin/FeedbackTable';
import { bulkDeleteFeedbacks, getFilteredFeedbacks, updateFeedbackStatus } from '../../services/adminService';

const statusOptions = ['all', 'normal', 'flagged', 'hidden', 'removed', 'review'];

const FeedbackManagementPage = ({ globalSearch }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Combine local search with global header search
  const effectiveSearch = useMemo(() => (searchQuery || globalSearch || '').trim(), [searchQuery, globalSearch]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const skip = page * limit;
      const result = await getFilteredFeedbacks({
        status: statusFilter,
        keyword: effectiveSearch,
        limit,
        skip
      });

      if (result && result.data) {
        setFeedbacks(result.data);
        setTotal(result.total || 0);
      } else {
        setFeedbacks([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error loading feedbacks:', err);
      setError('Failed to connect to the database. Please check your internet connection or server status.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    setPage(0);
    const debounceTimer = setTimeout(() => {
      loadFeedbacks();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [statusFilter, effectiveSearch, limit]);

  // Pagination change
  useEffect(() => {
    loadFeedbacks();
  }, [page]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} feedback item(s)? This cannot be undone.`)) return;

    try {
      setLoading(true);
      await bulkDeleteFeedbacks(selectedIds);
      setSelectedIds([]);
      await loadFeedbacks();
    } catch (e) {
      alert('Failed to delete feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic update
      setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
      await updateFeedbackStatus(id, newStatus);
    } catch (e) {
      await loadFeedbacks(); // Revert on error
      alert('Failed to update status');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback Management</h1>
          <p className="text-slate-500">Manage user feedback, reports, and moderation</p>
        </div>
        <button 
          onClick={loadFeedbacks}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or message..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="w-48">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full" />
          {error}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 flex items-center justify-between">
          <span className="text-indigo-900 font-medium">{selectedIds.length} items selected</span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading && feedbacks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Loading feedbacks...</div>
        ) : (
          <FeedbackTable
            feedbacks={feedbacks}
            selectedIds={selectedIds}
            onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            onToggleSelectAll={() => setSelectedIds(selectedIds.length === feedbacks.length ? [] : feedbacks.map(f => f._id))}
            onStatusChange={handleStatusChange}
            onDelete={async (id) => {
              if(window.confirm('Delete this feedback?')) {
                await bulkDeleteFeedbacks([id]);
                loadFeedbacks();
              }
            }}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {feedbacks.length} of {total} results</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagementPage;

