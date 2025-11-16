import mongoose from "mongoose";

const abTestSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  variants: [{
    variantId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    weight: {
      type: Number,
      default: 1,
      min: 0
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  targetAudience: {
    userSegments: [String], // e.g., ['free_users', 'premium_users', 'new_users']
    percentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    conditions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  goals: [{
    goalId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true
    },
    eventName: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Indexes
abTestSchema.index({ status: 1 });
abTestSchema.index({ createdBy: 1 });

const ABTest = mongoose.model("ABTest", abTestSchema);

// A/B Test participation tracking
const abTestParticipationSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  variantId: {
    type: String,
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  convertedGoals: [{
    goalId: String,
    convertedAt: Date,
    eventData: mongoose.Schema.Types.Mixed
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Indexes for participation tracking
abTestParticipationSchema.index({ testId: 1, userId: 1 }, { unique: true });
abTestParticipationSchema.index({ testId: 1, variantId: 1 });

const ABTestParticipation = mongoose.model("ABTestParticipation", abTestParticipationSchema);

// A/B Test results
const abTestResultSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true
  },
  variantId: {
    type: String,
    required: true
  },
  metrics: {
    participants: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    goalMetrics: [{
      goalId: String,
      conversions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    }]
  },
  confidence: {
    type: Number,
    default: 0
  },
  statisticalSignificance: {
    type: Boolean,
    default: false
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for results
abTestResultSchema.index({ testId: 1, variantId: 1 }, { unique: true });

const ABTestResult = mongoose.model("ABTestResult", abTestResultSchema);

export { ABTest, ABTestParticipation, ABTestResult };
