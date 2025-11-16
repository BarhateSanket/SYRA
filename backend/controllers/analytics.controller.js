import logger from "../middlewares/apiLogger.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import Subscription from "../models/subscription.model.js";
import {
  AnalyticsEvent,
  UserSession,
  FeatureUsage,
} from "../models/analytics.model.js";
import {
  ABTest,
  ABTestParticipation,
  ABTestResult,
} from "../models/abtest.model.js";
import crypto from "crypto";

// ===============================
// TRACK EVENT
// ===============================
export const trackEvent = async (req, res) => {
  try {
    const { eventType, eventName, properties = {}, metadata = {} } = req.body;
    const userId = req.userId;

    const eventMetadata = {
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      referrer: req.get("Referrer"),
      url: req.originalUrl,
      sessionId: req.sessionId,
      ...metadata,
      deviceType: /Mobile/i.test(req.get("User-Agent"))
        ? "mobile"
        : /Tablet/i.test(req.get("User-Agent"))
        ? "tablet"
        : "desktop",
    };

    const event = new AnalyticsEvent({
      userId,
      eventType,
      eventName,
      properties,
      metadata: eventMetadata,
    });

    await event.save();

    // Update feature usage
    if (eventType === "feature_usage") {
      await FeatureUsage.findOneAndUpdate(
        { userId, featureName: eventName },
        {
          $inc: {
            usageCount: 1,
            totalTimeSpent: properties.duration || 0,
          },
          $set: { lastUsedAt: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Event tracked successfully", eventId: event._id });
  } catch (error) {
    logger.error("Event tracking failed", { error: error.message });
    res.status(500).json({ error: "Failed to track event" });
  }
};

// ===============================
// USER BEHAVIOR ANALYTICS
// ===============================
export const getUserBehaviorAnalytics = async (req, res) => {
  try {
    const { timeRange = "30d", userId } = req.query;
    const now = Date.now();
    const ranges = {
      "1d": now - 86400000,
      "7d": now - 7 * 86400000,
      "30d": now - 30 * 86400000,
      "90d": now - 90 * 86400000,
    };

    const startDate = new Date(ranges[timeRange] || ranges["30d"]);

    const matchConditions = { timestamp: { $gte: startDate } };
    if (userId) matchConditions.userId = userId;

    const analytics = {
      timestamp: new Date().toISOString(),
      timeRange,
      userId: userId || "all",
      eventSummary: {
        totalEvents: 0,
        eventsByType: {},
        eventsByName: {},
      },
      userEngagement: {
        activeUsers: 0,
        averageSessionDuration: 0,
        pageViews: 0,
        featureUsage: {},
      },
      conversionFunnel: {
        signups: 0,
        trialStarts: 0,
        payments: 0,
        upgrades: 0,
      },
    };

    // Events
    const eventResults = await AnalyticsEvent.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: { type: "$eventType", name: "$eventName" },
          count: { $sum: 1 },
        },
      },
    ]);

    eventResults.forEach((e) => {
      analytics.eventSummary.totalEvents += e.count;

      analytics.eventSummary.eventsByType[e._id.type] =
        (analytics.eventSummary.eventsByType[e._id.type] || 0) + e.count;

      analytics.eventSummary.eventsByName[e._id.name] =
        (analytics.eventSummary.eventsByName[e._id.name] || 0) + e.count;
    });

    // Active users
    const activeUsers = await AnalyticsEvent.distinct("userId", matchConditions);
    analytics.userEngagement.activeUsers = activeUsers.length;

    // Sessions
    const sessionResults = await UserSession.aggregate([
      { $match: { startTime: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" },
          totalPageViews: { $sum: "$pageViews" },
        },
      },
    ]);

    if (sessionResults.length > 0) {
      analytics.userEngagement.averageSessionDuration =
        sessionResults[0].avgDuration || 0;
      analytics.userEngagement.pageViews =
        sessionResults[0].totalPageViews || 0;
    }

    // Feature usage
    const featureResults = await FeatureUsage.find({
      lastUsedAt: { $gte: startDate },
    })
      .sort({ usageCount: -1 })
      .limit(10);

    featureResults.forEach((f) => {
      analytics.userEngagement.featureUsage[f.featureName] = {
        usageCount: f.usageCount,
        uniqueUsers: 1,
        lastUsed: f.lastUsedAt,
      };
    });

    res.json(analytics);
  } catch (error) {
    logger.error("User behavior analytics failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve analytics" });
  }
};

// ===============================
// COMMAND USAGE ANALYTICS
// ===============================
export const getCommandUsageAnalytics = async (req, res) => {
  try {
    const { timeRange = "30d" } = req.query;
    const now = Date.now();
    const ranges = {
      "1d": now - 86400000,
      "7d": now - 7 * 86400000,
      "30d": now - 30 * 86400000,
    };
    const startDate = new Date(ranges[timeRange] || ranges["30d"]);

    const events = await AnalyticsEvent.find({
      eventType: "command_executed",
      timestamp: { $gte: startDate },
    });

    const stats = {
      timestamp: new Date().toISOString(),
      timeRange,
      commandStats: {
        totalCommands: events.length,
        uniqueCommands: 0,
        commandsByType: {},
        commandsByFrequency: [],
      },
      userStats: {
        totalUsers: 0,
        activeCommandUsers: 0,
        powerUsers: 0,
      },
    };

    // Commands by type
    events.forEach((ev) => {
      const name = ev.properties.commandType || ev.eventName;
      stats.commandStats.commandsByType[name] =
        (stats.commandStats.commandsByType[name] || 0) + 1;
    });

    // Frequency ranking
    stats.commandStats.commandsByFrequency = Object.entries(
      stats.commandStats.commandsByType
    )
      .map(([cmd, count]) => ({ command: cmd, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    stats.commandStats.uniqueCommands = Object.keys(
      stats.commandStats.commandsByType
    ).length;

    // Users
    const uniqueUsers = [...new Set(events.map((e) => e.userId.toString()))];
    stats.userStats.activeCommandUsers = uniqueUsers.length;

    stats.userStats.totalUsers = await User.countDocuments();
    stats.userStats.averageCommandsPerUser =
      stats.userStats.totalUsers > 0
        ? stats.commandStats.totalCommands / stats.userStats.totalUsers
        : 0;

    // Power users
    const counts = {};
    events.forEach((ev) => {
      const id = ev.userId.toString();
      counts[id] = (counts[id] || 0) + 1;
    });

    stats.userStats.powerUsers = Object.values(counts).filter(
      (c) => c > 100
    ).length;

    res.json(stats);
  } catch (error) {
    logger.error("Command analytics failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve command analytics" });
  }
};

// ===============================
// USER SEGMENTATION
// ===============================
export const getUserSegmentation = async (req, res) => {
  try {
    const now = Date.now();
    const sevenDays = new Date(now - 7 * 86400000);
    const thirtyDays = new Date(now - 30 * 86400000);

    const totalUsers = await User.countDocuments();

    const segments = {
      timestamp: new Date().toISOString(),
      segments: {
        freeUsers: {
          count: await User.countDocuments({ subscriptionPlan: "free" }),
        },
        trialUsers: {
          count: await User.countDocuments({
            subscriptionStatus: "trial",
          }),
        },
        premiumUsers: {
          count: await User.countDocuments({
            subscriptionPlan: { $in: ["monthly", "yearly"] },
          }),
        },
        newUsers: {
          count: await User.countDocuments({ createdAt: { $gte: sevenDays } }),
        },
        activeUsers: {
          count: await User.countDocuments({
            lastLoginAt: { $gte: thirtyDays },
          }),
        },
      },
    };

    segments.segments.inactiveUsers = {
      count: totalUsers - segments.segments.activeUsers.count,
    };

    segments.segments.powerUsers = {
      count: await User.countDocuments({
        history: { $exists: true, $size: { $gte: 50 } },
      }),
    };

    // Percentages
    Object.keys(segments.segments).forEach((key) => {
      segments.segments[key].percentage =
        totalUsers > 0
          ? ((segments.segments[key].count / totalUsers) * 100).toFixed(2)
          : 0;
    });

    res.json(segments);
  } catch (error) {
    logger.error("Segmentation failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve segmentation" });
  }
};

// ===============================
// CONVERSION FUNNEL
// ===============================
export const getConversionFunnel = async (req, res) => {
  try {
    const { timeRange = "90d" } = req.query;
    const now = Date.now();
    const ranges = {
      "30d": now - 30 * 86400000,
      "90d": now - 90 * 86400000,
      "180d": now - 180 * 86400000,
    };
    const startDate = new Date(ranges[timeRange] || ranges["90d"]);

    const funnel = {
      timestamp: new Date().toISOString(),
      timeRange,
      steps: {
        visitors: { count: 0, percentage: 100 },
        signups: {
          count: await User.countDocuments({ createdAt: { $gte: startDate } }),
        },
        trialStarts: {
          count: await User.countDocuments({ trialEndsAt: { $gte: startDate } }),
        },
        payments: {
          count: await Payment.countDocuments({
            status: "captured",
            createdAt: { $gte: startDate },
          }),
        },
        activeSubscriptions: {
          count: await Subscription.countDocuments({
            status: "active",
            createdAt: { $gte: startDate },
          }),
        },
      },
    };

    funnel.steps.visitors.count = funnel.steps.signups.count * 3;

    const base = funnel.steps.visitors.count || 1;

    Object.keys(funnel.steps).forEach((key) => {
      funnel.steps[key].percentage = (
        (funnel.steps[key].count / base) *
        100
      ).toFixed(2);
    });

    res.json(funnel);
  } catch (error) {
    logger.error("Funnel failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve funnel" });
  }
};

// ===============================
// A/B TEST CREATION
// ===============================
export const createABTest = async (req, res) => {
  try {
    const { testId, name, description, variants, targetAudience, goals } =
      req.body;

    const abTest = new ABTest({
      testId,
      name,
      description,
      variants,
      targetAudience,
      goals,
      createdBy: req.userId,
    });

    await abTest.save();
    res.json({ message: "A/B test created successfully", test: abTest });
  } catch (error) {
    logger.error("A/B test creation failed", { error: error.message });
    res.status(500).json({ error: "Failed to create A/B test" });
  }
};

// ===============================
// A/B TEST VARIANT ASSIGNMENT
// ===============================
export const getABTestVariant = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.userId;

    let participation = await ABTestParticipation.findOne({ testId, userId });
    if (participation) {
      return res.json({ variantId: participation.variantId });
    }

    const test = await ABTest.findOne({ testId, status: "active" });
    if (!test) {
      return res.status(404).json({ error: "A/B test not active" });
    }

    const qualifies = await checkUserQualification(
      userId,
      test.targetAudience
    );
    if (!qualifies) {
      return res.json({ variantId: null });
    }

    const variant = assignVariant(test.variants);

    participation = new ABTestParticipation({
      testId,
      userId,
      variantId: variant.variantId,
    });
    await participation.save();

    res.json({ variantId: variant.variantId, config: variant.config });
  } catch (error) {
    logger.error("Variant assignment failed", { error: error.message });
    res.status(500).json({ error: "Failed to get variant" });
  }
};

// ===============================
// A/B TEST CONVERSION TRACKING
// ===============================
export const trackABTestConversion = async (req, res) => {
  try {
    const { testId, goalId, eventData = {} } = req.body;
    const userId = req.userId;

    const participation = await ABTestParticipation.findOne({
      testId,
      userId,
    });
    if (!participation) {
      return res.status(404).json({ error: "Not participating" });
    }

    const exists = participation.convertedGoals.find(
      (g) => g.goalId === goalId
    );
    if (exists) {
      return res.json({ message: "Goal already converted" });
    }

    participation.convertedGoals.push({
      goalId,
      convertedAt: new Date(),
      eventData,
    });

    await participation.save();

    res.json({ message: "Conversion tracked" });
  } catch (error) {
    logger.error("Conversion failed", { error: error.message });
    res.status(500).json({ error: "Failed to track conversion" });
  }
};

// ===============================
// A/B TEST RESULTS
// ===============================
export const getABTestResults = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await ABTest.findOne({ testId });
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    const results = await ABTestResult.find({ testId }).sort({
      calculatedAt: -1,
    });

    res.json({
      test,
      results,
    });
  } catch (error) {
    logger.error("Results failed", { error: error.message });
    res.status(500).json({ error: "Failed to get results" });
  }
};

// ===============================
// HELPER FUNCTIONS
// ===============================
const checkUserQualification = async (userId, target) => {
  const user = await User.findById(userId);
  if (!user) return false;

  if (target.percentage < 100) {
    const hash = crypto
      .createHash("md5")
      .update(userId.toString())
      .digest("hex");

    const pct = parseInt(hash.substring(0, 8), 16) % 100;
    if (pct >= target.percentage) return false;
  }

  if (target.userSegments?.length > 0) {
    const segment = getUserSegment(user);
    if (!target.userSegments.includes(segment)) return false;
  }

  return true;
};

const assignVariant = (variants) => {
  const total = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * total;

  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) return variant;
  }

  return variants[0];
};

const getUserSegment = (user) => {
  if (user.subscriptionPlan !== "free") return "premium_users";
  if (user.subscriptionStatus === "trial") return "trial_users";
  if (Date.now() - user.createdAt < 7 * 86400000) return "new_users";
  return "free_users";
};
