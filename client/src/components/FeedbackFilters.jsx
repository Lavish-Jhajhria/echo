/**
 * Filters bar for searching feedback by keyword and date range.
 */

import React from 'react';

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Convert Date -> YYYY-MM-DD for input[type=date].
 * @param {Date} date
 * @returns {string}
 */
const toDateInputValue = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/**
 * Filter controls.
 * @param {Object} props
 * @param {Object} props.filters - { keyword, startDate, endDate, youOnly }
 * @param {Function} props.onChange - (nextFilters) => void
 * @param {Function} props.onClear - () => void
 * @param {number} props.resultCount - currently shown results
 * @param {string} props.userEmail - used for "You" quick filter
 * @returns {JSX.Element}
 */
const FeedbackFilters = ({ filters, onChange, onClear, resultCount, userEmail }) => {
  const hasAnyFilters =
    Boolean(filters?.keyword) ||
    Boolean(filters?.startDate) ||
    Boolean(filters?.endDate) ||
    Boolean(filters?.youOnly);

  const handleKeywordChange = (e) => {
    onChange({
      ...filters,
      keyword: e.target.value,
      youOnly: false
    });
  };

  const handleStartDateChange = (e) => {
    onChange({
      ...filters,
      startDate: e.target.value
    });
  };

  const handleEndDateChange = (e) => {
    onChange({
      ...filters,
      endDate: e.target.value
    });
  };

  const applyLastWeek = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    onChange({
      ...filters,
      startDate: toDateInputValue(start),
      endDate: toDateInputValue(end)
    });
  };

  const applyYou = () => {
    if (!userEmail) return;
    onChange({
      ...filters,
      keyword: userEmail,
      youOnly: true
    });
  };

  return (
    <section className="echo-card p-5 sm:p-6 lg:p-7 mb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Filters</h2>
          <p className="text-xs text-slate-400">Search by keyword and filter by date range.</p>
        </div>

        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1 text-[11px] text-slate-300">
          Showing <span className="ml-1 font-semibold">{resultCount}</span> results
        </span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="keyword" className="block text-sm font-medium text-slate-200 mb-1.5">
            Keyword
          </label>
          <input
            id="keyword"
            name="keyword"
            type="text"
            className="echo-input"
            placeholder="Search name, email, or message…"
            value={filters.keyword}
            onChange={handleKeywordChange}
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-200 mb-1.5">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="echo-input"
            value={filters.startDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-slate-200 mb-1.5">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="echo-input"
            value={filters.endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={applyLastWeek}
          className="px-3 py-1.5 rounded-full text-xs border border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800 transition-colors"
        >
          Last week
        </button>

        <button
          type="button"
          onClick={applyYou}
          disabled={!userEmail}
          className={`px-3 py-1.5 rounded-full text-xs border border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800 transition-colors ${
            !userEmail ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={userEmail ? 'Filter to your feedback' : 'Submit feedback once to enable “You”'}
        >
          You
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onClear}
          disabled={!hasAnyFilters}
          className={`px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors ${
            !hasAnyFilters ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Clear filters
        </button>
      </div>
    </section>
  );
};

export default FeedbackFilters;

