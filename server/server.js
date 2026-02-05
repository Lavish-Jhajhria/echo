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
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});

