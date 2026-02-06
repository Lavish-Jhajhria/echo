/**
 * Main page showing the form + feedback list.
 */

import React, { useEffect, useState } from 'react';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import FeedbackFilters from '../components/FeedbackFilters';
import { getAllFeedbacks, searchFeedbacks } from '../services/feedbackService';

const USER_EMAIL_KEY = 'echo_user_email';

/**
 * Home page component.
 * @returns {JSX.Element}
 */
const HomePage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    startDate: '',
    endDate: '',
    youOnly: false
  });
  const [userEmail, setUserEmail] = useState('');

  /**
   * Fetch all feedback from the API.
   * @returns {Promise<void>}
   */
  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getAllFeedbacks();
      setFeedbacks(response);
    } catch (err) {
      setError('Unable to load feedback right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search feedbacks using current filters.
   * @param {Object} nextFilters
   * @returns {Promise<void>}
   */
  const runSearch = async (nextFilters) => {
    try {
      setIsLoading(true);
      setError('');

      const hasAny =
        Boolean(nextFilters.keyword) || Boolean(nextFilters.startDate) || Boolean(nextFilters.endDate);

      if (!hasAny) {
        await loadFeedbacks();
        return;
      }

      const results = await searchFeedbacks({
        keyword: nextFilters.keyword,
        startDate: nextFilters.startDate,
        endDate: nextFilters.endDate
      });

      setFeedbacks(results);
    } catch (err) {
      setError('Unable to apply filters right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load feedback once on mount
    loadFeedbacks();
  }, []);

  useEffect(() => {
    // Restore user's email (used for "You" quick filter + badges)
    try {
      const stored = window.localStorage.getItem(USER_EMAIL_KEY) || '';
      setUserEmail(stored);
    } catch (e) {
      setUserEmail('');
    }
  }, []);

  useEffect(() => {
    // Debounce keyword typing so we don't spam the API.
    const handle = window.setTimeout(() => {
      runSearch(filters);
    }, 300);

    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.startDate, filters.endDate]);

  /**
   * Refresh list after a new feedback is submitted.
   * @returns {Promise<void>}
   */
  const handleFeedbackSubmitted = async () => {
    // Store email for "You" quick filter
    try {
      const stored = window.localStorage.getItem(USER_EMAIL_KEY) || '';
      setUserEmail(stored);
    } catch (e) {
      // ignore
    }

    // If any filters are active, re-run search; otherwise load all.
    const hasAny =
      Boolean(filters.keyword) || Boolean(filters.startDate) || Boolean(filters.endDate);

    if (hasAny) {
      await runSearch(filters);
      return;
    }
    await loadFeedbacks();
  };

  /**
   * Remove deleted feedback from local state.
   * @param {string} id - Feedback id
   * @returns {void}
   */
  const handleFeedbackDeleted = (id) => {
    setFeedbacks((current) => current.filter((item) => item._id !== id));
  };

  /**
   * Clear filter state and reload all feedback.
   * @returns {Promise<void>}
   */
  const handleClearFilters = async () => {
    const cleared = { keyword: '', startDate: '', endDate: '', youOnly: false };
    setFilters(cleared);
    await loadFeedbacks();
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 sm:py-12 lg:py-16">
      <header className="mb-10 sm:mb-12 lg:mb-14 text-center sm:text-left">
        <p className="text-xs font-semibold tracking-[0.3em] text-primary-500 uppercase mb-4">
          Feedback Collector
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3">
          Echo
          <span className="ml-2 bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            Feedback
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl">
          Hear every voice. Clearly. Collect, review, and respond to feedback in a calm, focused
          space designed for deep listening.
        </p>
      </header>

      <FeedbackFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
        resultCount={feedbacks.length}
        userEmail={userEmail}
      />

      <section className="grid gap-8 lg:gap-10 lg:grid-cols-2 items-start">
        <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />

        <FeedbackList
          feedbacks={feedbacks}
          isLoading={isLoading}
          error={error}
          onRetry={loadFeedbacks}
          onFeedbackDeleted={handleFeedbackDeleted}
          title="Results"
        />
      </section>
    </main>
  );
};

export default HomePage;

