// Single feedback card

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { deleteFeedback, getClientId, toggleLike } from '../services/feedbackService';
import ModalComponent from './ModalComponent';
import ReportFeedbackButton from './ReportFeedbackButton';
import authService from '../services/authService';

const isWithinLast7Days = (dateString) => {
  const created = new Date(dateString);
  if (Number.isNaN(created.getTime())) return false;
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
};

const Icon = ({ children }) => (
  <span className="inline-flex items-center justify-center w-5 h-5">{children}</span>
);

const FeedbackItem = ({ feedback, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(feedback);

  const clientId = getClientId();
  const likedBy = Array.isArray(localFeedback.likedBy) ? localFeedback.likedBy : [];
  const isLiked = likedBy.includes(clientId);
  const likeCount = typeof localFeedback.likes === 'number' ? localFeedback.likes : likedBy.length;
  const commentCount =
    typeof localFeedback.commentCount === 'number' ? localFeedback.commentCount : 0;
  const showLastWeek = isWithinLast7Days(localFeedback.createdAt);

  const currentUser = authService.getLoggedInUser();
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();
  const showYou = Boolean(currentUser?.userId)
    ? localFeedback.userId === currentUser.userId
    : false;
  const isOwnFeedback = Boolean(currentUser?.userId && localFeedback.userId && localFeedback.userId === currentUser.userId);

  const handleRequestDelete = () => {
    setError('');
    setShowModal(true);
  };

  const handleCancelDelete = () => {
    setShowModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!currentUser) {
      setError('You must be logged in to delete feedback');
      return;
    }
    setShowModal(false);
    try {
      setIsDeleting(true);
      setError('');
      await deleteFeedback(localFeedback._id, currentUser.userId);

      if (typeof onDeleted === 'function') {
        onDeleted(localFeedback._id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleLike = async () => {
    if (isLiking) return;
    if (!currentUser) {
      setShowLoginAlert(true);
      return;
    }
    try {
      setIsLiking(true);
      setError('');

      setLocalFeedback((prev) => {
        const prevLikedBy = Array.isArray(prev.likedBy) ? prev.likedBy : [];
        const alreadyLiked = prevLikedBy.includes(clientId);
        const nextLikedBy = alreadyLiked
          ? prevLikedBy.filter((id) => id !== clientId)
          : [...prevLikedBy, clientId];
        return {
          ...prev,
          likedBy: nextLikedBy,
          likes: nextLikedBy.length
        };
      });

      const updated = await toggleLike(localFeedback._id, clientId);
      setLocalFeedback(updated);
    } catch (err) {
      setError('Unable to update like. Please try again.');
      setLocalFeedback((prev) => {
        const prevLikedBy = Array.isArray(prev.likedBy) ? prev.likedBy : [];
        const alreadyLiked = prevLikedBy.includes(clientId);
        const nextLikedBy = alreadyLiked
          ? prevLikedBy.filter((id) => id !== clientId)
          : [...prevLikedBy, clientId];
        return {
          ...prev,
          likedBy: nextLikedBy,
          likes: nextLikedBy.length
        };
      });
    } finally {
      setIsLiking(false);
    }
  };


  return (
    <>
      <article className="echo-card p-4 sm:p-5 group transition-transform duration-150 hover:-translate-y-0.5 relative">
        {/* Action buttons - top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {!isOwnFeedback && (
            <ReportFeedbackButton feedback={localFeedback} />
          )}
          {isOwnFeedback && (
            <button
              type="button"
              onClick={handleRequestDelete}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-error p-1"
              aria-label="Delete feedback"
            >
              <span className="inline-block text-lg leading-none">&times;</span>
            </button>
          )}
        </div>

        <header className="flex items-start justify-between gap-3 mb-2 pr-20">
          <div>
            <p className="text-sm font-semibold text-white">{localFeedback.name}</p>
            <p className="text-xs text-slate-400">{localFeedback.email}</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {showLastWeek && (
                <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-200">
                  Last week
                </span>
              )}
              {showYou && (
                <span className="inline-flex items-center rounded-full border border-primary-500/40 bg-primary-500/10 px-2 py-0.5 text-[10px] text-primary-200">
                  You
                </span>
              )}
            </div>
          </div>
        </header>

        <p className="text-sm text-slate-100 mb-3 leading-relaxed">{localFeedback.message}</p>

        <footer className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400">
          <span>{formatDate(localFeedback.createdAt)}</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-700 bg-slate-900/40 hover:bg-slate-800 transition-colors ${
                isLiked ? 'text-rose-300' : 'text-slate-300'
              } ${isLiking ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Icon>
                {isLiked ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 21s-7.2-4.3-9.6-8.1C.5 9.6 2.2 6.5 5.5 5.6c1.8-.5 3.7.1 5 1.4L12 8.6l1.5-1.6c1.3-1.3 3.2-1.9 5-1.4 3.3.9 5 4 3.1 7.3C19.2 16.7 12 21 12 21z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
                    <path d="M12 21s-7.2-4.3-9.6-8.1C.5 9.6 2.2 6.5 5.5 5.6c1.8-.5 3.7.1 5 1.4L12 8.6l1.5-1.6c1.3-1.3 3.2-1.9 5-1.4 3.3.9 5 4 3.1 7.3C19.2 16.7 12 21 12 21z" />
                  </svg>
                )}
              </Icon>
              <span className="font-semibold">{likeCount}</span>
            </button>

            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-700 bg-slate-900/40 text-slate-300"
              title="Comments (coming soon)"
            >
              <Icon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
              </Icon>
              <span className="font-semibold">{commentCount}</span>
            </span>

            <button
              type="button"
              className="inline-flex items-center justify-center w-9 h-8 rounded-md border border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Share (coming soon)"
              title="Share (coming soon)"
            >
              <Icon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4">
                  <path d="M16 8a3 3 0 1 0-2.8-4" />
                  <path d="M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  <path d="M18 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  <path d="M8.7 17.1l6.6-3.2" />
                  <path d="M8.7 16.9l6.6 3.2" />
                  <path d="M8.8 16.9l6.4-8.2" />
                </svg>
              </Icon>
            </button>
          </div>

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
      <ModalComponent
        isOpen={showLoginAlert}
        title="Login Required"
        message="You must sign in first to like feedback."
        onCancel={() => setShowLoginAlert(false)}
        onConfirm={() => {
          setShowLoginAlert(false);
          navigate('/');
          window.setTimeout(() => window.dispatchEvent(new CustomEvent('echo:openAuth')), 50);
        }}
      />
    </>
  );
};

export default FeedbackItem;

