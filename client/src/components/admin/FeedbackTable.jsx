/**
 * Feedback management table with selection + actions.
 */

import React from 'react';
import { Eye, MessageSquare, ThumbsUp, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const statusColors = {
  normal: 'bg-emerald-100 text-emerald-700',
  flagged: 'bg-red-100 text-red-700',
  hidden: 'bg-amber-100 text-amber-700',
  removed: 'bg-slate-200 text-slate-700',
  review: 'bg-blue-100 text-blue-700'
};

/**
 * @param {Object} props
 * @param {Array} props.feedbacks
 * @param {Array<string>} props.selectedIds
 * @param {Function} props.onToggleSelect
 * @param {Function} props.onToggleSelectAll
 * @param {Function} [props.onView] - Optional
 * @param {Function} props.onDelete
 * @param {Function} props.onStatusChange
 * @returns {JSX.Element}
 */
const FeedbackTable = ({
  feedbacks,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onDelete,
  onStatusChange
}) => {
  const allIds = feedbacks.map((f) => f._id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="w-full text-center py-10 text-slate-500">
        No feedback found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <th className="px-4 py-3 w-10">
              <input 
                type="checkbox" 
                checked={allSelected} 
                onChange={() => onToggleSelectAll(allIds)} 
              />
            </th>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Author</th>
            <th className="px-4 py-3 text-left">Message</th>
            <th className="px-4 py-3 text-left">Engagement</th>
            <th className="px-4 py-3 text-left">Reports</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback) => {
            const isSelected = selectedIds.includes(feedback._id);
            const status = feedback.status || 'normal';
            return (
              <tr key={feedback._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(feedback._id)}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  FB-{String(feedback._id).slice(-4).toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{feedback.name}</div>
                  <div className="text-xs text-slate-500">{feedback.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-[420px]">
                  <span title={feedback.message}>
                    {feedback.message?.length > 70 ? `${feedback.message.slice(0, 70)}…` : feedback.message}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-slate-400" /> {feedback.likes ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-slate-400" /> {feedback.commentCount ?? 0}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {feedback.reportsCount > 0 ? (
                      <>
                        <ThumbsUp className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-600">{feedback.reportsCount}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={status}
                    onChange={(e) => onStatusChange(feedback._id, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border border-slate-200 ${statusColors[status]}`}
                  >
                    <option value="normal">normal</option>
                    <option value="flagged">flagged</option>
                    <option value="hidden">hidden</option>
                    <option value="removed">removed</option>
                    <option value="review">review</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(feedback.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(feedback)}
                        className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                        title="View"
                        aria-label="View"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(feedback._id)}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-red-50"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTable;

