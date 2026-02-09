// User schema

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  userId: {
    type: String,
    unique: true
    // Format: U-XXXX
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
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
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
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
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  feedbackCount: {
    type: Number,
    default: 0
  },
  reportsReceived: {
    type: Number,
    default: 0
  },
  reportsSubmitted: {
    type: Number,
    default: 0
  },
  bannedAt: {
    type: Date,
    default: null
  },
  suspendedAt: {
    type: Date,
    default: null
  },
  suspensionReason: {
    type: String,
    default: ''
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function setLastActive(next) {
  this.lastActive = new Date();
  next();
});

// Generate unique user ID
const generateUniqueUserId = async () => {
// Try a few times to avoid collisions
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `U-${randomNum}`;
    const existing = await mongoose.model('User').findOne({ userId: candidate }).lean();
    if (!existing) return candidate;
  }

  // Fallback for rare collisions
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `U-${randomNum}`;
};

// Generate userId before validate
userSchema.pre('validate', async function handlePreValidate(next) {
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

