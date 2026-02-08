// Feedback list with loading/error states

import React from 'react';
import FeedbackItem from './FeedbackItem';

const FeedbackList = ({ feedbacks, isLoading, error, onRetry, onFeedbackDeleted, title }) => {
  const hasFeedback = feedbacks && feedbacks.length > 0;

  return (
    <section className="echo-card p-5 sm:p-6 lg:p-7 h-full flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">{title || 'Recent feedback'}</h2>
          <p className="text-xs text-slate-400">
            See what people are saying about Echo.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1 text-[11px] text-slate-300">
          Showing <span className="ml-1 font-semibold">{feedbacks.length}</span> results
        </span>
      </header>

      <div className="flex-1 min-h-[260px]">
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 text-sm">
            <span className="mb-2 h-6 w-6 border-2 border-slate-500 border-t-primary-500 rounded-full animate-spin" />
            Loading feedback...
          </div>
        )}

        {!isLoading && error && (
          <div className="h-full flex flex-col items-center justify-center text-center text-sm text-error">
            <p className="mb-2">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 text-xs"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && !hasFeedback && (
          <div className="h-full flex flex-col items-center justify-center text-center text-sm text-slate-400">
            <p className="mb-1 font-medium text-slate-200">No feedback yet</p>
            <p className="max-w-xs">
              Be the first to share your thoughts and help us shape Echo.
            </p>
          </div>
        )}

        {!isLoading && !error && hasFeedback && (
          <div className="space-y-3 max-h-[460px] overflow-y-auto echo-scrollbar pr-1">
            {feedbacks.map((feedback) => (
              <FeedbackItem
                key={feedback._id}
                feedback={feedback}
                onDeleted={onFeedbackDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedbackList;

