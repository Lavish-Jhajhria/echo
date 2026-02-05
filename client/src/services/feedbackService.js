/**
 * Small API helpers for talking to the Echo backend.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Submit new feedback.
 * @param {Object} feedbackData - name, email, message
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

