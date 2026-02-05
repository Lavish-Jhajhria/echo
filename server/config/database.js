/**
 * Tiny helper to connect Mongoose to MongoDB.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * @param {string} mongoUri - Mongo connection string
 * @returns {Promise<void>}
 */
const connectDatabase = async (mongoUri) => {
  try {
    // Basic Mongoose options
    await mongoose.connect(mongoUri, {
      autoIndex: true
    });

    // eslint-disable-next-line no-console
    console.log('MongoDB connected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;

