/**
 * Feedback model (name, email, message, timestamps).
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Shape of a feedback document.
 */
const feedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must be at most 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email must be at most 254 characters'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message must be at most 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    likedBy: [
      {
        type: String,
        trim: true
      }
    ],
    commentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['normal', 'flagged', 'hidden', 'removed', 'review'],
      default: 'normal'
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    // Include virtuals and hide __v in JSON
    toJSON: {
      virtuals: true,
      versionKey: false
    }
  }
);

/**
 * Keep updatedAt in sync before save.
 */
feedbackSchema.pre('save', function handlePreSave(next) {
  this.updatedAt = new Date();
  next();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;

