/**
 * Report feedback button and modal (user-facing).
 */

import React, { useState } from 'react';
import { Flag, Check } from 'lucide-react';
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

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-slate-600"
        title="Report this feedback"
        aria-label="Report"
      >
        <Flag className="w-5 h-5" />
      </button>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => !submitting && setShowModal(false)}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Report Feedback</h3>
                {success ? (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-emerald-400 font-medium text-lg">Report submitted successfully!</p>
                    <p className="text-slate-400 text-sm mt-2">We&apos;ll review this feedback shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Why are you reporting this?
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                      >
                        <option value="spam">Spam or misleading</option>
                        <option value="offensive">Offensive language</option>
                        <option value="inappropriate">Inappropriate content</option>
                        <option value="harassment">Harassment or bullying</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Additional Details (Optional)
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        maxLength={500}
                        rows={5}
                        className="w-full px-4 py-3.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-base"
                        placeholder="Help us understand what's wrong with this feedback..."
                      />
                      <p className="text-xs text-slate-400 mt-2">{details.length}/500 characters</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                        className="flex-1 px-6 py-3.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium text-base disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting...' : 'Submit Report'}
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
