/**
 * Feedback form with validation and basic status messages.
 */

import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { submitFeedback } from '../services/feedbackService';
import authService from '../services/authService';

const MESSAGE_MAX_LENGTH = 1000;

/**
 * Form for submitting feedback.
 * @param {Object} props - Component props
 * @param {Function} props.onFeedbackSubmitted - Called after a successful submit
 * @param {Function} props.onRequireAuth - Called when user needs to login/signup
 * @returns {JSX.Element}
 */
const FeedbackForm = ({ onFeedbackSubmitted, onRequireAuth }) => {
  const currentUser = authService.getLoggedInUser();
  const [formData, setFormData] = useState({
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!currentUser) {
    return (
      <div className="echo-card p-6 sm:p-7 lg:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Login required</h2>
        <p className="text-sm text-slate-400 mb-6">
          Please login or sign up to submit feedback. Your feedback will be linked to your user ID.
        </p>
        <button
          type="button"
          onClick={() => onRequireAuth?.()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-soft-lg"
        >
          <UserIcon className="w-4 h-4" />
          Login / Sign Up
        </button>
      </div>
    );
  }

  /**
   * Handle input changes.
   * @param {Object} event - Change event
   * @returns {void}
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    // Stop typing once we hit the message limit
    if (name === 'message' && value.length > MESSAGE_MAX_LENGTH) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the field being edited
    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };

  /**
   * Validate current form.
   * @returns {Object} { isValid, errors }
   */
  const validate = () => {
    const nextErrors = {};
    if (!formData.message || !formData.message.trim()) {
      nextErrors.message = 'Message is required.';
    } else if (formData.message.trim().length > 1000) {
      nextErrors.message = 'Message must be at most 1000 characters.';
    }

    return { isValid: Object.keys(nextErrors).length === 0, errors: nextErrors };
  };

  /**
   * Handle form submit + API call.
   * @param {Object} event - Submit event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const validationResult = validate();

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const userName = `${currentUser.firstName} ${currentUser.lastName || ''}`.trim();
      await submitFeedback({
        userId: currentUser.userId,
        userName,
        userEmail: currentUser.email,
        message: formData.message
      });

      setFormData({
        message: ''
      });

      setErrors({});
      setSuccessMessage('Thank you! Your feedback has been sent.');

      if (typeof onFeedbackSubmitted === 'function') {
        onFeedbackSubmitted();
      }
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error ||
          'Something went wrong while sending your feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMessageLength = formData.message.length;

  return (
    <div className="echo-card p-6 sm:p-7 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">Share your thoughts</h2>
      <p className="text-sm text-slate-400 mb-6">
        Tell us what&apos;s working, what&apos;s not, and what you wish existed.
      </p>

      <div className="mb-5 rounded-xl border border-slate-700/60 bg-slate-900/30 px-4 py-3">
        <p className="text-xs text-slate-400">Submitting as</p>
        <p className="text-sm font-semibold text-white">
          {currentUser.firstName} {currentUser.lastName}
          <span className="ml-2 text-xs font-medium text-slate-400">{currentUser.userId}</span>
        </p>
        <p className="text-xs text-slate-400">{currentUser.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-200 mr-2"
            >
              Message
            </label>
            <span className="text-[11px] text-slate-400">
              {currentMessageLength}/{MESSAGE_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="echo-textarea"
            placeholder="Share your feedback…"
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.message && <p className="mt-1 text-xs text-error">{errors.message}</p>}
        </div>

        {successMessage && (
          <div className="text-xs sm:text-sm text-success bg-emerald-500/10 border border-emerald-500/40 rounded-md px-3 py-2">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="text-xs sm:text-sm text-error bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className={`w-full echo-gradient-button py-2.5 sm:py-3 text-sm sm:text-base flex items-center justify-center gap-2 ${
            isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            'Send feedback'
          )}
        </button>

        <p className="text-[11px] text-slate-500">
          Your feedback is stored securely and helps us continuously shape Echo to serve you better.
        </p>
      </form>
    </div>
  );
};

export default FeedbackForm;

