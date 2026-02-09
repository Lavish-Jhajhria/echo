// Auth service (login/signup)

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const USER_KEY = 'echoUser';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
  return response.data;
};

// Login user
const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
  return response.data;
};

// Get user by email
const getCurrentUser = async (email) => {
  const response = await axios.get(`${API_BASE_URL}/api/auth/user`, { params: { email } });
  return response.data;
};

// Check auth status
const isAuthenticated = () => {
  return Boolean(window.localStorage.getItem(USER_KEY));
};

// Get logged-in user
const getLoggedInUser = () => {
  try {
    const user = window.localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

// Save user to localStorage
const saveUser = (user) => {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Logout user
const logout = () => {
  window.localStorage.removeItem(USER_KEY);
};

// Check if user is admin
const isAdmin = () => {
  const user = getLoggedInUser();
  return Boolean(user && user.isAdmin === true);
};

// Is admin authenticated
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

