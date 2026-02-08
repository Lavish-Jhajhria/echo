/**
 * Report feedback button and modal (user-facing).
 */

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
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

  // Only show for logged-in users; hide for own feedback or legacy (no userId)
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
      // eslint-disable-next-line no-alert
      window.alert(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center justify-center w-9 h-8 rounded-md border border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors"
        title="Report this feedback"
        aria-label="Report"
      >
        <Flag className="w-4 h-4" />
      </button>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => !submitting && setShowModal(false)}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Report feedback</h3>
                {success ? (
                  <div className="py-6 text-center">
                    <p className="text-emerald-400 font-medium">Report submitted successfully.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Reason
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="spam">Spam</option>
                        <option value="offensive">Offensive content</option>
                        <option value="inappropriate">Inappropriate</option>
                        <option value="harassment">Harassment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Additional details (optional)
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        maxLength={500}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder="Provide more context..."
                      />
                      <p className="text-xs text-slate-400 mt-1">{details.length}/500</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                        className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting...' : 'Submit report'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
