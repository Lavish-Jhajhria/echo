// Feedback schema

const mongoose = require('mongoose');

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    userId: {
      type: String,
      required: function requireUserId() {
        // Only required for new auth-based feedback
        return Boolean(this.userName);
      },
      ref: 'User',
      trim: true
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    userName: {
      type: String,
      trim: true,
      maxlength: [100, 'User name must be at most 100 characters']
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name must be at most 100 characters'],
      default: function defaultName() {
        return this.userName || '';
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email must be at most 254 characters'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ],
      default: function defaultEmail() {
        return this.userEmail || '';
      }
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      maxlength: [1000, 'Message must be at most 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
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
    },
    reportsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    reportedBy: [
      {
        userId: String,
        reportId: String,
        createdAt: Date
      }
    ]
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false
    }
  }
);

// Update timestamp before save
feedbackSchema.pre('save', function handlePreSave(next) {
  this.updatedAt = new Date();
  if (this.userName && !this.name) {
    this.name = this.userName;
  }
  if (this.userEmail && !this.email) {
    this.email = this.userEmail;
  }
  next();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;

