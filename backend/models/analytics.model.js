import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'page_view',
      'feature_usage',
      'button_click',
      'command_executed',
      'voice_command',
      'subscription_upgrade',
      'payment_attempt',
      'error_occurred',
      'session_start',
      'session_end',
      'custom'
    ],
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String,
    url: String,
    sessionId: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    browser: String,
    os: String,
    screenResolution: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Indexes for efficient queries
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ eventName: 1, timestamp: -1 });
analyticsEventSchema.index({ 'metadata.sessionId': 1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

// User session tracking
const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  pageViews: {
    type: Number,
    default: 0
  },
  eventsCount: {
    type: Number,
    default: 0
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    deviceType: String,
    browser: String,
    os: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for session queries
userSessionSchema.index({ userId: 1, startTime: -1 });
userSessionSchema.index({ sessionId: 1 }, { unique: true });
userSessionSchema.index({ isActive: 1 });

const UserSession = mongoose.model("UserSession", userSessionSchema);

// Feature usage tracking
const featureUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featureName: {
    type: String,
    required: true
  },
  usageCount: {
    type: Number,
    default: 1
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number, // in milliseconds
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Indexes for feature usage
featureUsageSchema.index({ userId: 1, featureName: 1 }, { unique: true });
featureUsageSchema.index({ featureName: 1, usageCount: -1 });

const FeatureUsage = mongoose.model("FeatureUsage", featureUsageSchema);

export { AnalyticsEvent, UserSession, FeatureUsage };
