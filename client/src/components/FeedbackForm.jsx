/**
 * Feedback form with validation and basic status messages.
 */

import React, { useState } from 'react';
import { submitFeedback } from '../services/feedbackService';
import { validateFeedbackForm } from '../utils/validation';

const MESSAGE_MAX_LENGTH = 1000;

/**
 * Form for submitting feedback.
 * @param {Object} props - Component props
 * @param {Function} props.onFeedbackSubmitted - Called after a successful submit
 * @returns {JSX.Element}
 */
const FeedbackForm = ({ onFeedbackSubmitted }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
   * Handle form submit + API call.
   * @param {Object} event - Submit event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const validationResult = validateFeedbackForm(formData);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback(formData);

      setFormData({
        name: '',
        email: '',
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="echo-input"
            placeholder="Lavish"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="echo-input"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
        </div>

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
            placeholder="Minimum 50 character required"
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

