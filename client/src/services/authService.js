/**
 * Authentication service for Echo (login/signup).
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const USER_KEY = 'echoUser';

/**
 * Register new user.
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
  return response.data;
};

/**
 * Login user.
 * @param {Object} credentials
 * @returns {Promise<Object>}
 */
const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
  return response.data;
};

/**
 * Get current user by email.
 * @param {string} email
 * @returns {Promise<Object>}
 */
const getCurrentUser = async (email) => {
  const response = await axios.get(`${API_BASE_URL}/api/auth/user`, { params: { email } });
  return response.data;
};

/**
 * Check if user is logged in.
 * @returns {boolean}
 */
const isAuthenticated = () => {
  return Boolean(window.localStorage.getItem(USER_KEY));
};

/**
 * Get logged-in user.
 * @returns {Object|null}
 */
const getLoggedInUser = () => {
  try {
    const user = window.localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Save user to localStorage.
 * @param {Object} user
 * @returns {void}
 */
const saveUser = (user) => {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Logout user.
 * @returns {void}
 */
const logout = () => {
  window.localStorage.removeItem(USER_KEY);
};

/**
 * Check if current user is admin.
 * @returns {boolean}
 */
const isAdmin = () => {
  const user = getLoggedInUser();
  return Boolean(user && user.isAdmin === true);
};

/**
 * Check if user is authenticated as admin (for admin route protection).
 * @returns {boolean}
 */
const isAdminAuthenticated = () => isAdmin();

export default {
  register,
  login,
  getCurrentUser,
  isAuthenticated,
  getLoggedInUser,
  saveUser,
  logout,
  isAdmin,
  isAdminAuthenticated
};

