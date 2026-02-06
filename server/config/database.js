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
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true
    });

    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // eslint-disable-next-line no-console
    console.log(`📁 Database: ${conn.connection.name}`);

    try {
      const collections = await conn.connection.db.listCollections().toArray();
      // eslint-disable-next-line no-console
      console.log(`📊 Collections: ${collections.map((c) => c.name).join(', ') || '(none yet)'}`);
    } catch (e) {
      // ignore collection listing errors
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;

