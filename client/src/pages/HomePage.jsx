// Home page

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import FeedbackFilters from '../components/FeedbackFilters';
import { getAllFeedbacks, searchFeedbacks } from '../services/feedbackService';
import AuthModal from '../components/AuthModal';
import authService from '../services/authService';

const USER_EMAIL_KEY = 'echo_user_email';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load all feedbacks
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

  // Search with filters
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
    // Load on mount
    loadFeedbacks();
  }, []);

  useEffect(() => {
    // Load logged-in user
    const user = authService.getLoggedInUser();
    if (user) {
      setCurrentUser(user);
      setUserEmail(user.email || '');
      if (user.isAdmin) {
        navigate('/admin', { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    const handler = () => setShowAuthModal(true);
    window.addEventListener('echo:openAuth', handler);
    return () => window.removeEventListener('echo:openAuth', handler);
  }, []);

  useEffect(() => {
    // Restore user email
    try {
      const stored = window.localStorage.getItem(USER_EMAIL_KEY) || '';
      if (!currentUser?.email) setUserEmail(stored);
    } catch (e) {
      setUserEmail('');
    }
  }, [currentUser?.email]);

  useEffect(() => {
    // Debounce search
    const handle = window.setTimeout(() => {
      runSearch(filters);
    }, 300);

    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.startDate, filters.endDate]);

  // Refresh after new feedback
  const handleFeedbackSubmitted = async () => {
    // Keep "You" filter synced
    if (currentUser?.email) setUserEmail(currentUser.email);

    // If any filters are active, re-run search; otherwise load all.
    const hasAny =
      Boolean(filters.keyword) || Boolean(filters.startDate) || Boolean(filters.endDate);

    if (hasAny) {
      await runSearch(filters);
      return;
    }
    await loadFeedbacks();
  };

  // Remove deleted feedback
  const handleFeedbackDeleted = (id) => {
    setFeedbacks((current) => current.filter((item) => item._id !== id));
  };

  // Clear filters
  const handleClearFilters = async () => {
    const cleared = { keyword: '', startDate: '', endDate: '', youOnly: false };
    setFilters(cleared);
    await loadFeedbacks();
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setUserEmail(user.email);
    try {
      window.localStorage.setItem(USER_EMAIL_KEY, user.email);
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/', { replace: true });
  };

  return (
    <main className="relative max-w-6xl mx-auto px-4 py-10 sm:py-12 lg:py-16">
      <div className="absolute top-6 right-4 sm:right-6">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">
                {currentUser.firstName} {currentUser.lastName}
              </div>
              <div className="text-xs text-slate-400">{currentUser.userId}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg font-medium transition-all shadow-lg text-sm"
          >
            <UserIcon className="w-4 h-4" />
            <span>Login / Sign Up</span>
          </button>
        )}
      </div>

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
        <FeedbackForm
          onFeedbackSubmitted={handleFeedbackSubmitted}
          onRequireAuth={() => setShowAuthModal(true)}
        />

        <FeedbackList
          feedbacks={feedbacks}
          isLoading={isLoading}
          error={error}
          onRetry={loadFeedbacks}
          onFeedbackDeleted={handleFeedbackDeleted}
          title="Results"
        />
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
};

export default HomePage;

