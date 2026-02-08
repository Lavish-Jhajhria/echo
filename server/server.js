/**
 * Echo API server bootstrap.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

const connectDatabase = require('./config/database');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load env vars from .env
dotenv.config();

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Feedback API routes
app.use('/', feedbackRoutes);

// Admin API routes
app.use('/api/admin', adminRoutes);

// Auth API routes
app.use('/api/auth', authRoutes);

// User management (admin)
app.use('/api/users', userRoutes);

// Reports (submit + admin)
app.use('/api/reports', reportRoutes);

// Simple health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Echo Feedback API is running'
  });
});

// Central error handler (keep this last)
app.use(errorHandler);

// Basic config with sane defaults
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback-collector';

// Connect to MongoDB then start HTTP server
connectDatabase(MONGODB_URI).then(() => {
  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle server errors (e.g., port already in use)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // eslint-disable-next-line no-console
      console.error(`\n❌ Port ${PORT} is already in use.`);
      // eslint-disable-next-line no-console
      console.error(`Please either:`);
      // eslint-disable-next-line no-console
      console.error(`  1. Stop the process using port ${PORT}`);
      // eslint-disable-next-line no-console
      console.error(`  2. Set a different PORT in your .env file\n`);
      process.exit(1);
    } else {
      // eslint-disable-next-line no-console
      console.error('Server error:', err);
      process.exit(1);
    }
  });
});

