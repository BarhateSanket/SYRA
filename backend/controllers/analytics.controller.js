import logger from '../middlewares/apiLogger.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import Subscription from '../models/subscription.model.js';
import { AnalyticsEvent, UserSession, FeatureUsage } from '../models/analytics.model.js';
import { ABTest, ABTestParticipation, ABTestResult } from '../models/abtest.model.js';

// Track user events
export const trackEvent = async (req, res) => {
  try {
    const { eventType, eventName, properties = {}, metadata = {} } = req.body;
    const userId = req.userId;

    // Extract metadata from request
    const eventMetadata = {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      referrer: req.get('Referrer'),
      url: req.originalUrl,
      sessionId: req.sessionId,
      ...metadata
    };

    // Detect device type
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.includes('Mobile')) {
      eventMetadata.deviceType = 'mobile';
    } else if (userAgent.includes('Tablet')) {
      eventMetadata.deviceType = 'tablet';
    } else {
      eventMetadata.deviceType = 'desktop';
    }

    // Create analytics event
    const event = new AnalyticsEvent({
      userId,
      eventType,
      eventName,
      properties,
      metadata: eventMetadata
    });

    await event.save();

    // Update feature usage if it's a feature usage event
    if (eventType === 'feature_usage') {
      await FeatureUsage.findOneAndUpdate(
        { userId, featureName: eventName },
        {
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() },
          $inc: { totalTimeSpent: properties.duration || 0 }
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Event tracked successfully', eventId: event._id });
  } catch (error) {
    logger.error('Event tracking failed', { error: error.message });
    res.status(500).json({ error: 'Failed to track event' });
  }
};

// Get user behavior analytics
export const getUserBehaviorAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d', userId } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '1d':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    const matchConditions = { timestamp: { $gte: startDate } };
    if (userId) matchConditions.userId = userId;

    const analytics = {
      timestamp: new Date().toISOString(),
      timeRange,
      userId: userId || 'all',
      eventSummary: {
        totalEvents: 0,
        eventsByType: {},
        eventsByName: {}
      },
      userEngagement: {
        activeUsers: 0,
        averageSessionDuration: 0,
        pageViews: 0,
        featureUsage: {}
      },
      conversionFunnel: {
        signups: 0,
        trialStarts: 0,
        payments: 0,
        upgrades: 0
      }
    };

    // Aggregate events
    const eventPipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: {
            type: '$eventType',
            name: '$eventName'
          },
          count: { $sum: 1 }
        }
      }
    ];

    const eventResults = await AnalyticsEvent.aggregate(eventPipeline);

    eventResults.forEach(result => {
      analytics.eventSummary.totalEvents += result.count;
      analytics.eventSummary.eventsByType[result._id.type] =
        (analytics.eventSummary.eventsByType[result._id.type] || 0) + result.count;
      analytics.eventSummary.eventsByName[result._id.name] =
        (analytics.eventSummary.eventsByName[result._id.name] || 0) + result.count;
    });

    // Get unique active users
    const activeUsers = await AnalyticsEvent.distinct('userId', matchConditions);
    analytics.userEngagement.activeUsers = activeUsers.length;

    // Get session data
    const sessionPipeline = [
      { $match: { startTime: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          totalPageViews: { $sum: '$pageViews' }
        }
      }
    ];

    const sessionResults = await UserSession.aggregate(sessionPipeline);
    if (sessionResults.length > 0) {
      analytics.userEngagement.averageSessionDuration = sessionResults[0].avgDuration || 0;
      analytics.userEngagement.pageViews = sessionResults[0].totalPageViews || 0;
    }

    // Get feature usage
    const featureResults = await FeatureUsage.find({
      lastUsedAt: { $gte: startDate }
    }).sort({ usageCount: -1 }).limit(10);

    featureResults.forEach(feature => {
      analytics.userEngagement.featureUsage[feature.featureName] = {
        usageCount: feature.usageCount,
        uniqueUsers: 1, // Would need aggregation for this
        lastUsed: feature.lastUsedAt
      };
    });

    res.json(analytics);
  } catch (error) {
    logger.error('User behavior analytics failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve user behavior analytics' });
  }
};

// Command usage analytics
export const getCommandUsageAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '1d':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = {
      timestamp: new Date().toISOString(),
      timeRange,
      commandStats: {
        totalCommands: 0,
        uniqueCommands: 0,
        commandsByType: {},
        commandsByFrequency: [],
        averageCommandsPerUser: 0
      },
      userStats: {
        totalUsers: 0,
        activeCommandUsers: 0,
        powerUsers: 0 // Users with > 100 commands
      }
    };

    // Get command events
    const commandEvents = await AnalyticsEvent.find({
      eventType: 'command_executed',
      timestamp: { $gte: startDate }
    });

    analytics.commandStats.totalCommands = commandEvents.length;

    // Aggregate by command type
    const commandTypeMap = {};
    commandEvents.forEach(event => {
      const commandType = event.properties.commandType || event.eventName;
      commandTypeMap[commandType] = (commandTypeMap[commandType] || 0) + 1;
    });

    analytics.commandStats.commandsByType = commandTypeMap;
    analytics.commandStats.uniqueCommands = Object.keys(commandTypeMap).length;

    // Sort commands by frequency
    analytics.commandStats.commandsByFrequency = Object.entries(commandTypeMap)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Get unique users who executed commands
    const uniqueUsers = [...new Set(commandEvents.map(event => event.userId.toString()))];
    analytics.userStats.activeCommandUsers = uniqueUsers.length;

    // Get total users for average calculation
    const totalUsers = await User.countDocuments();
    analytics.userStats.totalUsers = totalUsers;
    analytics.userStats.averageCommandsPerUser = totalUsers > 0 ?
      analytics.commandStats.totalCommands / totalUsers : 0;

    // Count power users
    const userCommandCounts = {};
    commandEvents.forEach(event => {
      const userId = event.userId.toString();
      userCommandCounts[userId] = (userCommandCounts[userId] || 0) + 1;
    });

    analytics.userStats.powerUsers = Object.values(userCommandCounts)
      .filter(count => count > 100).length;

    res.json(analytics);
  } catch (error) {
    logger.error('Command usage analytics failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve command usage analytics' });
  }
};

// User segmentation
export const getUserSegmentation = async (req, res) => {
  try {
    const segments = {
      timestamp: new Date().toISOString(),
      segments: {
        freeUsers: { count: 0, percentage: 0 },
        trialUsers: { count: 0, percentage: 0 },
        premiumUsers: { count: 0, percentage: 0 },
        newUsers: { count: 0, percentage: 0 }, // Last 7 days
        activeUsers: { count: 0, percentage: 0 }, // Last 30 days
        inactiveUsers: { count: 0, percentage: 0 },
        powerUsers: { count: 0, percentage: 0 } // High engagement
      }
    };

    const totalUsers = await User.countDocuments();
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Subscription-based segments
    segments.segments.freeUsers.count = await User.countDocuments({
      subscriptionPlan: 'free'
    });
    segments.segments.trialUsers.count = await User.countDocuments({
      subscriptionStatus: 'trial'
    });
    segments.segments.premiumUsers.count = await User.countDocuments({
      subscriptionPlan: { $in: ['monthly', 'yearly'] }
    });

    // Time-based segments
    segments.segments.newUsers.count = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    segments.segments.activeUsers.count = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo }
    });
    segments.segments.inactiveUsers.count = totalUsers - segments.segments.activeUsers.count;

    // Power users (based on command history length or feature usage)
    const powerUsers = await User.find({
      $or: [
        { history: { $exists: true, $size: { $gte: 50 } } },
        { premiumFeatures: { advancedAnalytics: true } }
      ]
    });
    segments.segments.powerUsers.count = powerUsers.length;

    // Calculate percentages
    Object.keys(segments.segments).forEach(segment => {
      segments.segments[segment].percentage = totalUsers > 0 ?
        (segments.segments[segment].count / totalUsers * 100).toFixed(2) : 0;
    });

    res.json(segments);
  } catch (error) {
    logger.error('User segmentation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve user segmentation' });
  }
};

// Conversion funnel analysis
export const getConversionFunnel = async (req, res) => {
  try {
    const { timeRange = '90d' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      case '180d':
        startDate = new Date(now - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
    }

    const funnel = {
      timestamp: new Date().toISOString(),
      timeRange,
      steps: {
        visitors: { count: 0, percentage: 100 },
        signups: { count: 0, percentage: 0 },
        trialStarts: { count: 0, percentage: 0 },
        payments: { count: 0, percentage: 0 },
        activeSubscriptions: { count: 0, percentage: 0 }
      }
    };

    // Get signups
    funnel.steps.signups.count = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get trial starts
    funnel.steps.trialStarts.count = await User.countDocuments({
      trialEndsAt: { $gte: startDate }
    });

    // Get payments
    funnel.steps.payments.count = await Payment.countDocuments({
      status: 'captured',
      createdAt: { $gte: startDate }
    });

    // Get active subscriptions
    funnel.steps.activeSubscriptions.count = await Subscription.countDocuments({
      status: 'active',
      createdAt: { $gte: startDate }
    });

    // Calculate percentages (assuming visitors = signups * 3 for estimation)
    funnel.steps.visitors.count = funnel.steps.signups.count * 3; // Rough estimate

    const baseCount = funnel.steps.visitors.count;
    if (baseCount > 0) {
      funnel.steps.signups.percentage = ((funnel.steps.signups.count / baseCount) * 100).toFixed(2);
      funnel.steps.trialStarts.percentage = ((funnel.steps.trialStarts.count / baseCount) * 100).toFixed(2);
      funnel.steps.payments.percentage = ((funnel.steps.payments.count / baseCount) * 100).toFixed(2);
      funnel.steps.activeSubscriptions.percentage = ((funnel.steps.activeSubscriptions.count / baseCount) * 100).toFixed(2);
    }

    res.json(funnel);
  } catch (error) {
    logger.error('Conversion funnel analysis failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve conversion funnel' });
  }
};

// A/B Testing endpoints
export const createABTest = async (req, res) => {
  try {
    const { testId, name, description, variants, targetAudience, goals } = req.body;

    const abTest = new ABTest({
      testId,
      name,
      description,
      variants,
      targetAudience,
      goals,
      createdBy: req.userId
    });

    await abTest.save();
    res.json({ message: 'A/B test created successfully', test: abTest });
  } catch (error) {
    logger.error('A/B test creation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to create A/B test' });
  }
};

export const getABTestVariant = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;

    // Check if user is already participating
    let participation = await ABTestParticipation.findOne({ testId, userId });
    if (participation) {
      return res.json({ variantId: participation.variantId });
    }

    // Get test configuration
    const test = await ABTest.findOne({ testId, status: 'active' });
    if (!test) {
      return res.status(404).json({ error: 'A/B test not found or not active' });
    }

    // Check if user qualifies for the test
    const qualifies = await checkUserQualification(userId, test.targetAudience);
    if (!qualifies) {
      return res.json({ variantId: null }); // User doesn't qualify
    }

    // Assign variant based on weights
    const variant = assignVariant(test.variants);

    // Record participation
    participation = new ABTestParticipation({
      testId,
      userId,
      variantId: variant.variantId
    });
    await participation.save();

    res.json({ variantId: variant.variantId, config: variant.config });
  } catch (error) {
    logger.error('A/B test variant assignment failed', { error: error.message });
    res.status(500).json({ error: 'Failed to get A/B test variant' });
  }
};

export const trackABTestConversion = async (req, res) => {
  try {
    const { testId, goalId, eventData = {} } = req.body;
    const userId = req.userId;

    const participation = await ABTestParticipation.findOne({ testId, userId });
    if (!participation) {
      return res.status(404).json({ error: 'User not participating in this test' });
    }

    // Check if already converted for this goal
    const existingConversion = participation.convertedGoals.find(g => g.goalId === goalId);
    if (existingConversion) {
      return res.json({ message: 'Goal already converted' });
    }

    // Record conversion
    participation.convertedGoals.push({
      goalId,
      convertedAt: new Date(),
      eventData
    });
    await participation.save();

    res.json({ message: 'Conversion tracked successfully' });
  } catch (error) {
    logger.error('A/B test conversion tracking failed', { error: error.message });
    res.status(500).json({ error: 'Failed to track conversion' });
  }
};

export const getABTestResults = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await ABTest.findOne({ testId });
    if (!test) {
      return res.status(404).json({ error: 'A/B test not found' });
    }

    const results = await ABTestResult.find({ testId }).sort({ calculatedAt: -1 });

    res.json({
      test: {
        testId: test.testId,
        name: test.name,
        status: test.status,
        variants: test.variants,
        goals: test.goals
      },
      results
    });
  } catch (error) {
    logger.error('A/B test results retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve A/B test results' });
  }
};

// Helper functions
const checkUserQualification = async (userId, targetAudience) => {
  // Simple qualification check - can be extended based on requirements
  const user = await User.findById(userId);
  if (!user) return false;

  // Check percentage (random sampling)
  if (targetAudience.percentage < 100) {
    const hash = require('crypto').createHash('md5').update(userId.toString()).digest('hex');
    const userPercentage = parseInt(hash.substring(0, 8), 16) % 100;
    if (userPercentage >= targetAudience.percentage) return false;
  }

  // Check segments
  if (targetAudience.userSegments && targetAudience.userSegments.length > 0) {
    const userSegment = getUserSegment(user);
    if (!targetAudience.userSegments.includes(userSegment)) return false;
  }

  return true;
};

const assignVariant = (variants) => {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) return variant;
  }

  return variants[0]; // Fallback
};

const getUserSegment = (user) => {
  if (user.subscriptionPlan !== 'free') return 'premium_users';
  if (user.subscriptionStatus === 'trial') return 'trial_users';
  if (Date.now() - user.createdAt < 7 * 24 * 60 * 60 * 1000) return 'new_users';
  return 'free_users';
};
