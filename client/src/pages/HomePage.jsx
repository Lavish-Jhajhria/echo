/**
 * Main page showing the form + feedback list.
 */

import React, { useEffect, useState } from 'react';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import { getAllFeedbacks } from '../services/feedbackService';

/**
 * Home page component.
 * @returns {JSX.Element}
 */
const HomePage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    // Load feedback once on mount
    loadFeedbacks();
  }, []);

  /**
   * Refresh list after a new feedback is submitted.
   * @returns {Promise<void>}
   */
  const handleFeedbackSubmitted = async () => {
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

      <section className="grid gap-8 lg:gap-10 lg:grid-cols-2 items-start">
        <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />

        <FeedbackList
          feedbacks={feedbacks}
          isLoading={isLoading}
          error={error}
          onRetry={loadFeedbacks}
          onFeedbackDeleted={handleFeedbackDeleted}
        />
      </section>
    </main>
  );
};

export default HomePage;

