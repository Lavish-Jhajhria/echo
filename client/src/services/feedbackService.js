// Feedback API helpers

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';
const CLIENT_ID_KEY = 'echo_client_id';

// Get or create stable client ID
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
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };
};

// Submit feedback
export const submitFeedback = async (feedbackData) => {
  const response = await axios.post(`${API_BASE_URL}/api/feedbacks`, feedbackData);
  return response.data;
};

// Fetch all feedbacks
export const getAllFeedbacks = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/feedbacks`);
  return response.data.data;
};

// Delete feedback
export const deleteFeedback = async (id, userId) => {
  const response = await axios.delete(`${API_BASE_URL}/api/feedbacks/${id}`, {
    data: { userId }
  });
  return response.data;
};

// Toggle like
export const toggleLike = async (id, userIdentifier) => {
  const identifier = userIdentifier || getClientIdentifier();
  const response = await axios.put(`${API_BASE_URL}/api/feedbacks/${id}/like`, {
    userIdentifier: identifier
  });
  return response.data.data;
};

// Search feedbacks
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

// Get client ID for UI
export const getClientId = () => getClientIdentifier();

