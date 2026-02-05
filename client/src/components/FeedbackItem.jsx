/**
 * Single feedback card with delete option.
 */

import React, { useState } from 'react';
import { formatDate } from '../utils/formatDate';
import { deleteFeedback } from '../services/feedbackService';
import ModalComponent from './ModalComponent';

/**
 * Render one feedback item.
 * @param {Object} props - Component props
 * @param {Object} props.feedback - Feedback data
 * @param {Function} props.onDeleted - Called after delete
 * @returns {JSX.Element}
 */
const FeedbackItem = ({ feedback, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  /**
   * Open confirm modal when user wants to delete.
   * @returns {void}
   */
  const handleRequestDelete = () => {
    setError('');
    setShowModal(true);
  };

  /**
   * Close modal without deleting.
   * @returns {void}
   */
  const handleCancelDelete = () => {
    setShowModal(false);
  };

  /**
   * Delete feedback after user confirms.
   * @returns {Promise<void>}
   */
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      await deleteFeedback(feedback._id);

      if (typeof onDeleted === 'function') {
        onDeleted(feedback._id);
      }
      setShowModal(false);
    } catch (err) {
      setError('Unable to delete feedback. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article className="echo-card p-4 sm:p-5 group transition-transform duration-150 hover:-translate-y-0.5">
        <header className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-sm font-semibold text-white">{feedback.name}</p>
            <p className="text-xs text-slate-400">{feedback.email}</p>
          </div>
          <button
            type="button"
            onClick={handleRequestDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-error p-1"
            aria-label="Delete feedback"
          >
            <span className="inline-block text-lg leading-none">&times;</span>
          </button>
        </header>

        <p className="text-sm text-slate-100 mb-3 leading-relaxed">{feedback.message}</p>

        <footer className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatDate(feedback.createdAt)}</span>
          {error && <span className="text-error">{error}</span>}
        </footer>
      </article>

      <ModalComponent
        isOpen={showModal}
        title="Delete feedback?"
        message="Are you sure you want to delete this feedback?"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default FeedbackItem;

