/**
 * Report feedback button and modal (user-facing).
 * Uses React Portal to render modal outside DOM hierarchy to avoid clipping issues.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Flag, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import authService from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ReportFeedbackButton({ feedback }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentUser = authService.getLoggedInUser();

  if (!currentUser || !feedback.userId || currentUser.userId === feedback.userId) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reportData = {
        feedbackId: feedback._id,
        reportedBy: {
          userId: currentUser.userId,
          userName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User',
          userEmail: currentUser.email
        },
        feedbackAuthor: {
          userId: feedback.userId,
          userName: feedback.userName || feedback.name || '',
          userEmail: feedback.userEmail || feedback.email || ''
        },
        reason,
        details: details.slice(0, 500)
      };
      const response = await axios.post(`${API_BASE_URL}/api/reports`, reportData);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setReason('spam');
          setDetails('');
        }, 2000);
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const reasonLabels = {
    spam: 'Spam or misleading',
    offensive: 'Offensive language',
    inappropriate: 'Inappropriate content',
    harassment: 'Harassment or bullying',
    other: 'Other'
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
        title="Report this feedback"
        aria-label="Report"
      >
        <Flag className="w-5 h-5" />
      </button>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with animation */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => !submitting && setShowModal(false)}
            aria-hidden="true"
          />
          
          {/* Modal container with animation */}
          <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700/50 overflow-hidden animate-modal-in">
            <div className="p-8">
              {success ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                    <Check className="w-10 h-10 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 font-bold text-xl">Report submitted!</p>
                  <p className="text-slate-400 text-sm mt-3">
                    Thank you for helping keep our community safe. We&apos;ll review this shortly.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header with icon */}
                  <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-lg shadow-red-500/10">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Report Content</h3>
                    <p className="text-sm text-slate-400 mt-2">
                      Help us keep the community safe and welcoming for everyone.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Reason dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        Why are you reporting this?
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/40 border border-slate-600/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 text-base font-medium"
                      >
                        {Object.entries(reasonLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Details textarea */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-3">
                        Additional Details <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        maxLength={500}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-900/40 border border-slate-600/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 resize-none text-base"
                        placeholder="Please provide any additional context that might help us..."
                      />
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-xs text-slate-500">Help us understand the issue</p>
                        <span className="text-xs font-medium text-slate-400">{details.length}/500</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-6">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 rounded-xl transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/40 hover:border-slate-600/60"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          'Submit Report'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
