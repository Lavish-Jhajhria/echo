/**
 * Small API helpers for talking to the Echo backend.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const CLIENT_ID_KEY = 'echo_client_id';

/**
 * Get or create a stable client identifier (stored in localStorage).
 * @returns {string}
 */
const getClientIdentifier = () => {
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch (e) {
    // Fallback to a per-page identifier if storage is unavailable.
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

/**
 * Submit new feedback.
 * @param {Object} feedbackData - { userId, userName, userEmail, message }
 * @returns {Promise<Object>}
 */
export const submitFeedback = async (feedbackData) => {
  const response = await axios.post(`${API_BASE_URL}/api/feedbacks`, feedbackData);
  return response.data;
};

/**
 * Fetch all feedback.
 * @returns {Promise<Array>}
 */
export const getAllFeedbacks = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/feedbacks`);
  return response.data.data;
};

/**
 * Delete a feedback by id.
 * @param {string} id - Feedback id
 * @returns {Promise<Object>}
 */
export const deleteFeedback = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/api/feedbacks/${id}`);
  return response.data;
};

/**
 * Toggles like on a feedback entry.
 * @param {string} id - Feedback ID
 * @param {string} [userIdentifier] - Optional override (falls back to client id)
 * @returns {Promise<Object>} Updated feedback object
 */
export const toggleLike = async (id, userIdentifier) => {
  const identifier = userIdentifier || getClientIdentifier();
  const response = await axios.put(`${API_BASE_URL}/api/feedbacks/${id}/like`, {
    userIdentifier: identifier
  });
  return response.data.data;
};

/**
 * Searches feedback with filters.
 * @param {Object} filters - { keyword, startDate, endDate }
 * @returns {Promise<Array>} Array of filtered feedback objects
 */
export const searchFeedbacks = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.keyword) params.set('keyword', filters.keyword);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  const qs = params.toString();
  const response = await axios.get(
    `${API_BASE_URL}/api/feedbacks/search${qs ? `?${qs}` : ''}`
  );
  return response.data.data;
};

/**
 * Expose client identifier for UI helpers (badges, etc).
 * @returns {string}
 */
export const getClientId = () => getClientIdentifier();

