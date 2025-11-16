import logger from "../middlewares/apiLogger.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import Subscription from "../models/subscription.model.js";
import mongoose from "mongoose";
import os from "os";

/* ---------------------------------------------------------
   PERFORMANCE METRICS
--------------------------------------------------------- */
export const getPerformanceMetrics = async (req, res) => {
  try {
    const timeRange = req.query.range || "24h";

    const metrics = {
      timestamp: new Date().toISOString(),
      timeRange,
      api: {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        requestsByEndpoint: {}
      },
      users: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0
      },
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        loadAverage: os.loadavg()
      }
    };

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    metrics.users.totalUsers = totalUsers;
    metrics.users.activeUsers = activeUsers;

    res.json(metrics);
  } catch (error) {
    logger.error("Performance metrics error", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve performance metrics" });
  }
};

/* ---------------------------------------------------------
   ERROR REPORTING
--------------------------------------------------------- */
export const getErrorReports = async (req, res) => {
  try {
    const timeRange = req.query.range || "24h";

    const errorReports = {
      timestamp: new Date().toISOString(),
      timeRange,
      totalErrors: 0,
      errorsByType: {},
      errorsByEndpoint: {},
      recentErrors: [],
      summary: {
        critical: 0,
        warning: 0,
        info: 0
      }
    };

    res.json(errorReports);
  } catch (error) {
    logger.error("Error reports retrieval failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve error reports" });
  }
};

/* ---------------------------------------------------------
   USER ACTIVITY
--------------------------------------------------------- */
export const getUserActivity = async (req, res) => {
  try {
    const timeRange = req.query.range || "7d";

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1h": startDate = new Date(now - 60 * 60 * 1000); break;
      case "24h": startDate = new Date(now - 24 * 60 * 60 * 1000); break;
      case "30d": startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }

    const activity = {
      timestamp: new Date().toISOString(),
      timeRange,
      userStats: {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ lastLoginAt: { $gte: startDate } }),
        newUsers: await User.countDocuments({ createdAt: { $gte: startDate } }),
        usersWith2FA: await User.countDocuments({ twoFactorEnabled: true })
      },
      loginAttempts: {
        successful: await User.countDocuments({ lastLoginAt: { $gte: startDate } }),
        failed: 0
      }
    };

    res.json(activity);
  } catch (error) {
    logger.error("User activity retrieval failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve user activity" });
  }
};

/* ---------------------------------------------------------
   SECURITY EVENTS
--------------------------------------------------------- */
export const getSecurityEvents = async (req, res) => {
  try {
    const timeRange = req.query.range || "24h";

    const securityEvents = {
      timestamp: new Date().toISOString(),
      timeRange,
      totalEvents: 0,
      eventsByType: {
        failedLogin: 0,
        suspiciousActivity: 0,
        rateLimitExceeded: 0,
        unauthorizedAccess: 0
      },
      recentEvents: [],
      blockedIPs: [],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };

    res.json(securityEvents);
  } catch (error) {
    logger.error("Security events retrieval failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve security events" });
  }
};

/* ---------------------------------------------------------
   CLIENT ERROR REPORTING (WEBHOOK)
--------------------------------------------------------- */
export const reportError = async (req, res) => {
  try {
    const { error, context, userId, userAgent, url, stackTrace } = req.body;

    const errorReport = {
      timestamp: new Date().toISOString(),
      error: { message: error, stack: stackTrace, context },
      request: { url, userAgent, ip: req.ip, userId: userId || "anonymous" },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV
      }
    };

    logger.error("Client error reported", errorReport);

    res.json({ message: "Error report received", reportId: Date.now() });
  } catch (err) {
    logger.error("Error reporting failed", { error: err.message });
    res.status(500).json({ error: "Failed to process error report" });
  }
};

/* ---------------------------------------------------------
   DATABASE METRICS
--------------------------------------------------------- */
export const getDatabaseMetrics = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();

    const metrics = {
      timestamp: new Date().toISOString(),
      database: {
        name: db.databaseName,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        avgObjSize: stats.avgObjSize
      },
      collections: {}
    };

    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      try {
        const collStats = await db.collection(col.name).stats();
        metrics.collections[col.name] = {
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          indexes: collStats.nindexes
        };
      } catch (error) {
        metrics.collections[col.name] = { error: error.message };
      }
    }

    res.json(metrics);
  } catch (error) {
    logger.error("Database metrics retrieval failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve database metrics" });
  }
};

/* ---------------------------------------------------------
   REVENUE ANALYTICS
--------------------------------------------------------- */
export const getRevenueAnalytics = async (req, res) => {
  try {
    const range = req.query.timeRange || "30d";

    const now = new Date();
    let startDate;

    switch (range) {
      case "7d": startDate = new Date(now - 7 * 86400000); break;
      case "90d": startDate = new Date(now - 90 * 86400000); break;
      case "1y": startDate = new Date(now - 365 * 86400000); break;
      default: startDate = new Date(now - 30 * 86400000);
    }

    const revenue = {
      timestamp: new Date().toISOString(),
      timeRange: range,
      totalRevenue: 0,
      totalPayments: 0,
      averageRevenuePerUser: 0,
      revenueByPlan: { monthly: 0, yearly: 0 },
      paymentMethods: { card: 0, netbanking: 0, wallet: 0, upi: 0 },
      churnRate: 0
    };

    const payments = await Payment.find({
      status: "captured",
      createdAt: { $gte: startDate }
    });

    for (const p of payments) {
      revenue.totalPayments += 1;
      revenue.totalRevenue += p.amount / 100;

      if (p.paymentMethod && revenue.paymentMethods[p.paymentMethod] !== undefined) {
        revenue.paymentMethods[p.paymentMethod] += p.amount / 100;
      }
    }

    const totalUsers = await User.countDocuments();

    revenue.averageRevenuePerUser =
      totalUsers > 0 ? revenue.totalRevenue / totalUsers : 0;

    const cancelled = await Subscription.countDocuments({
      status: "cancelled",
      cancelledAt: { $gte: startDate }
    });

    const activeSubs = await Subscription.countDocuments({ status: "active" });

    revenue.churnRate =
      activeSubs > 0 ? (cancelled / activeSubs) * 100 : 0;

    res.json(revenue);
  } catch (error) {
    logger.error("Revenue analytics failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve revenue analytics" });
  }
};

/* ---------------------------------------------------------
   USER ACQUISITION
--------------------------------------------------------- */
export const getUserAcquisitionMetrics = async (req, res) => {
  try {
    const range = req.query.timeRange || "90d";

    const now = new Date();
    let startDate;

    switch (range) {
      case "30d": startDate = new Date(now - 30 * 86400000); break;
      case "1y": startDate = new Date(now - 365 * 86400000); break;
      default: startDate = new Date(now - 90 * 86400000);
    }

    const acquisition = {
      timestamp: new Date().toISOString(),
      timeRange: range,
      totalNewUsers: await User.countDocuments({ createdAt: { $gte: startDate } }),
      acquisitionChannels: {
        organic: 0,
        referral: 0,
        social: 0,
        paid: 0
      },
      retentionRates: {
        day1: 0,
        day7: 0,
        day30: 0
      }
    };

    res.json(acquisition);
  } catch (error) {
    logger.error("User acquisition metrics failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve acquisition metrics" });
  }
};

/* ---------------------------------------------------------
   RETENTION ANALYSIS
--------------------------------------------------------- */
export const getRetentionAnalysis = async (req, res) => {
  try {
    const retention = {
      timestamp: new Date().toISOString(),
      cohorts: []
    };

    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const users = await User.find({
        createdAt: { $gte: start, $lte: end }
      });

      const cohort = {
        period: start.toISOString().substring(0, 7),
        totalUsers: users.length,
        retention: {}
      };

      retention.cohorts.push(cohort);
    }

    res.json(retention);
  } catch (error) {
    logger.error("Retention analysis failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve retention analysis" });
  }
};

/* ---------------------------------------------------------
   FEATURE USAGE
--------------------------------------------------------- */
export const getFeatureUsageStats = async (req, res) => {
  try {
    const users = await User.find({}).select("history premiumFeatures");

    const stats = {
      timestamp: new Date().toISOString(),
      totalFeatureUsage: 0,
      featuresByPopularity: [],
      averageFeaturesPerUser: 0
    };

    const featureCounts = {};
    let totalUsed = 0;

    users.forEach((u) => {
      const used = new Set();

      (u.history || []).forEach((cmd) => {
        used.add(cmd);
        featureCounts[cmd] = (featureCounts[cmd] || 0) + 1;
      });

      Object.keys(u.premiumFeatures || {}).forEach((f) => {
        if (u.premiumFeatures[f]) {
          used.add(f);
          featureCounts[f] = (featureCounts[f] || 0) + 1;
        }
      });

      totalUsed += used.size;
    });

    stats.totalFeatureUsage = totalUsed;
    stats.averageFeaturesPerUser = users.length > 0 ? totalUsed / users.length : 0;

    stats.featuresByPopularity = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.json(stats);
  } catch (error) {
    logger.error("Feature usage stats failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve feature usage stats" });
  }
};

/* ---------------------------------------------------------
   SUPPORT ANALYTICS
--------------------------------------------------------- */
export const getSupportAnalytics = async (req, res) => {
  try {
    const support = {
      timestamp: new Date().toISOString(),
      totalTickets: 0,
      ticketsByStatus: {
        open: 0,
        pending: 0,
        resolved: 0,
        closed: 0
      },
      ticketsByPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      }
    };

    res.json(support);
  } catch (error) {
    logger.error("Support analytics failed", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve support analytics" });
  }
};
