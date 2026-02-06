/**
 * Authentication controller (register/login).
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Register new user.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName = '', email, password } = req.body || {};

    if (!firstName || !String(firstName).trim()) {
      return res.status(400).json({
        success: false,
        error: 'First name is required'
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered. Please login instead.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName || '').trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      },
      message: 'Registration successful'
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    return next(error);
  }
};

/**
 * Login user.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please register first.'
      });
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        lastLogin: user.lastLogin
      },
      message: 'Login successful'
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get current user info by email.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const { email } = req.query || {};
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'email query param is required'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};

