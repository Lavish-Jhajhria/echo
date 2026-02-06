/**
 * User model for Echo authentication.
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
    // Format: U-XXXX
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

/**
 * Generate a unique user id (U-XXXX).
 * @returns {Promise<string>}
 */
const generateUniqueUserId = async () => {
  // Try a handful of times to avoid rare collisions.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `U-${randomNum}`;
    // eslint-disable-next-line no-await-in-loop
    const existing = await mongoose.model('User').findOne({ userId: candidate }).lean();
    if (!existing) return candidate;
  }

  // Fallback: widen the space if we somehow collide too often.
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `U-${randomNum}`;
};

/**
 * Generate userId before saving.
 */
userSchema.pre('save', async function handlePreSave(next) {
  try {
    if (this.isNew && !this.userId) {
      this.userId = await generateUniqueUserId();
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('User', userSchema);

