// Admin API helpers

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Get dashboard stats
export const getDashboardStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/stats`);
  return response.data.data;
};

// Get chart data
export const getChartData = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/feedbacks/chart-data`);
  return response.data.data;
};

// Get filtered feedbacks (paginated)
export const getFilteredFeedbacks = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });

  const qs = params.toString();
  const response = await axios.get(`${API_BASE_URL}/api/admin/feedbacks${qs ? `?${qs}` : ''}`);
  return {
    data: response.data.data,
    total: response.data.total,
    pagination: response.data.pagination
  };
};

// Update feedback status
export const updateFeedbackStatus = async (id, status) => {
  const response = await axios.put(`${API_BASE_URL}/api/admin/feedbacks/${id}/status`, { status });
  return response.data.data;
};

// Bulk delete feedbacks
export const bulkDeleteFeedbacks = async (ids) => {
  const response = await axios.post(`${API_BASE_URL}/api/admin/feedbacks/bulk-delete`, { ids });
  return response.data.deletedCount || 0;
};

