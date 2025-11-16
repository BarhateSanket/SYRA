import logger from '../middlewares/apiLogger.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import Subscription from '../models/subscription.model.js';
import mongoose from 'mongoose';

// Performance monitoring
export const getPerformanceMetrics = async (req, res) => {
  try {
    const timeRange = req.query.range || '24h'; // 1h, 24h, 7d, 30d
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
        loadAverage: require('os').loadavg()
      }
    };

    // This would typically aggregate from logs or a metrics database
    // For now, return basic system metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    metrics.users.totalUsers = totalUsers;
    metrics.users.activeUsers = activeUsers;

    res.json(metrics);
  } catch (error) {
    logger.error('Performance metrics error', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve performance metrics' });
  }
};

// Error reporting and aggregation
export const getErrorReports = async (req, res) => {
  try {
    const timeRange = req.query.range || '24h';
    const limit = parseInt(req.query.limit) || 50;

    // This would typically query error logs from a database
    // For now, return a placeholder structure
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
    logger.error('Error reports retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve error reports' });
  }
};

// User activity monitoring
export const getUserActivity = async (req, res) => {
  try {
    const timeRange = req.query.range || '7d';

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '1h':
        startDate = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }

    const activity = {
      timestamp: new Date().toISOString(),
      timeRange,
      userStats: {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({
          lastLoginAt: { $gte: startDate }
        }),
        newUsers: await User.countDocuments({
          createdAt: { $gte: startDate }
        }),
        usersWith2FA: await User.countDocuments({
          twoFactorEnabled: true
        })
      },
      loginAttempts: {
        successful: await User.countDocuments({
          lastLoginAt: { $gte: startDate }
        }),
        failed: 0 // Would need to track this separately
      }
    };

    res.json(activity);
  } catch (error) {
    logger.error('User activity retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve user activity' });
  }
};

// Security monitoring
export const getSecurityEvents = async (req, res) => {
  try {
    const timeRange = req.query.range || '24h';
    const limit = parseInt(req.query.limit) || 100;

    // This would typically query security event logs
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
    logger.error('Security events retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve security events' });
  }
};

// Automated error reporting (webhook endpoint)
export const reportError = async (req, res) => {
  try {
    const { error, context, userId, userAgent, url, stackTrace } = req.body;

    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error,
        stack: stackTrace,
        context
      },
      request: {
        url,
        userAgent,
        ip: req.ip,
        userId: userId || 'anonymous'
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV
      }
    };

    // Log the error with structured data
    logger.error('Client-side error reported', errorReport);

    // Here you could also:
    // - Send to external monitoring service (Sentry, Bugsnag, etc.)
    // - Store in database for analysis
    // - Send email alerts for critical errors

    res.json({ message: 'Error report received', reportId: Date.now() });
  } catch (reportError) {
    logger.error('Error reporting failed', { error: reportError.message });
    res.status(500).json({ error: 'Failed to process error report' });
  }
};

// Database performance monitoring
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

    // Get individual collection stats
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      try {
        const collStats = await db.collection(collection.name).stats();
        metrics.collections[collection.name] = {
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          indexes: collStats.nindexes
        };
      } catch (error) {
        metrics.collections[collection.name] = { error: error.message };
      }
    }

    res.json(metrics);
  } catch (error) {
    logger.error('Database metrics retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve database metrics' });
  }
};

// Revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    const revenue = {
      timestamp: new Date().toISOString(),
      timeRange,
      totalRevenue: 0,
      totalPayments: 0,
      averageRevenuePerUser: 0,
      revenueByPlan: {
        monthly: 0,
        yearly: 0
      },
      paymentMethods: {
        card: 0,
        netbanking: 0,
        wallet: 0,
        upi: 0
      },
      monthlyRevenue: [],
      churnRate: 0,
      conversionRate: 0
    };

    // Aggregate payments
    const paymentPipeline = [
      {
        $match: {
          status: 'captured',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            paymentMethod: '$paymentMethod',
            planType: '$subscriptionId' // We'll need to populate this
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ];

    const paymentResults = await Payment.aggregate(paymentPipeline);

    paymentResults.forEach(result => {
      revenue.totalRevenue += result.totalAmount / 100; // Convert from paisa to rupees
      revenue.totalPayments += result.count;
      revenue.paymentMethods[result._id.paymentMethod] += result.totalAmount / 100;
    });

    // Get subscription data for plan breakdown
    const subscriptions = await Subscription.find({
      status: 'active',
      createdAt: { $gte: startDate }
    }).populate('userId');

    subscriptions.forEach(sub => {
      revenue.revenueByPlan[sub.planType] += sub.amount / 100;
    });

    // Calculate average revenue per user
    const totalUsers = await User.countDocuments();
    revenue.averageRevenuePerUser = totalUsers > 0 ? revenue.totalRevenue / totalUsers : 0;

    // Calculate churn rate (users who cancelled in the period)
    const cancelledSubscriptions = await Subscription.countDocuments({
      status: 'cancelled',
      cancelledAt: { $gte: startDate }
    });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    revenue.churnRate = activeSubscriptions > 0 ? (cancelledSubscriptions / activeSubscriptions) * 100 : 0;

    res.json(revenue);
  } catch (error) {
    logger.error('Revenue analytics failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve revenue analytics' });
  }
};

// User acquisition metrics
export const getUserAcquisitionMetrics = async (req, res) => {
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
      case '1y':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
    }

    const acquisition = {
      timestamp: new Date().toISOString(),
      timeRange,
      totalNewUsers: 0,
      acquisitionChannels: {
        organic: 0,
        referral: 0,
        social: 0,
        paid: 0
      },
      userCohorts: [],
      retentionRates: {
        day1: 0,
        day7: 0,
        day30: 0
      },
      costPerAcquisition: 0
    };

    // Get new users
    acquisition.totalNewUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // For now, return basic structure - would need more detailed tracking for channels
    // This would typically involve tracking referral codes, UTM parameters, etc.

    res.json(acquisition);
  } catch (error) {
    logger.error('User acquisition metrics failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve user acquisition metrics' });
  }
};

// Retention and churn analysis
export const getRetentionAnalysis = async (req, res) => {
  try {
    const { cohort = 'monthly' } = req.query;

    const retention = {
      timestamp: new Date().toISOString(),
      cohortType: cohort,
      cohorts: [],
      averageRetention: {
        day1: 0,
        day7: 0,
        day30: 0,
        day90: 0
      },
      churnRate: 0
    };

    // Get users by cohort (monthly cohorts)
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const cohortStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const cohortEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const cohortUsers = await User.find({
        createdAt: { $gte: cohortStart, $lte: cohortEnd }
      });

      if (cohortUsers.length > 0) {
        const cohortData = {
          period: cohortStart.toISOString().substring(0, 7), // YYYY-MM
          totalUsers: cohortUsers.length,
          retention: {
            day1: 0,
            day7: 0,
            day30: 0,
            day90: 0
          }
        };

        // Calculate retention for each period
        const checkDate1 = new Date(cohortEnd.getTime() + 24 * 60 * 60 * 1000);
        const checkDate7 = new Date(cohortEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        const checkDate30 = new Date(cohortEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        const checkDate90 = new Date(cohortEnd.getTime() + 90 * 24 * 60 * 60 * 1000);

        cohortData.retention.day1 = await User.countDocuments({
          _id: { $in: cohortUsers.map(u => u._id) },
          lastLoginAt: { $gte: checkDate1 }
        });

        cohortData.retention.day7 = await User.countDocuments({
          _id: { $in: cohortUsers.map(u => u._id) },
          lastLoginAt: { $gte: checkDate7 }
        });

        cohortData.retention.day30 = await User.countDocuments({
          _id: { $in: cohortUsers.map(u => u._id) },
          lastLoginAt: { $gte: checkDate30 }
        });

        cohortData.retention.day90 = await User.countDocuments({
          _id: { $in: cohortUsers.map(u => u._id) },
          lastLoginAt: { $gte: checkDate90 }
        });

        retention.cohorts.push(cohortData);
      }
    }

    res.json(retention);
  } catch (error) {
    logger.error('Retention analysis failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve retention analysis' });
  }
};

// Feature usage statistics
export const getFeatureUsageStats = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
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

    const featureStats = {
      timestamp: new Date().toISOString(),
      timeRange,
      totalFeatureUsage: 0,
      featuresByPopularity: [],
      featureAdoption: {},
      averageFeaturesPerUser: 0
    };

    // Get feature usage from user history (simplified approach)
    const users = await User.find({}).select('history premiumFeatures');
    let totalFeaturesUsed = 0;
    const featureCount = {};

    users.forEach(user => {
      const userFeatures = new Set();

      // Count commands from history
      if (user.history && user.history.length > 0) {
        user.history.forEach(command => {
          userFeatures.add(command);
          featureCount[command] = (featureCount[command] || 0) + 1;
        });
      }

      // Count premium features
      Object.keys(user.premiumFeatures || {}).forEach(feature => {
        if (user.premiumFeatures[feature]) {
          userFeatures.add(feature);
          featureCount[feature] = (featureCount[feature] || 0) + 1;
        }
      });

      totalFeaturesUsed += userFeatures.size;
    });

    featureStats.totalFeatureUsage = totalFeaturesUsed;
    featureStats.averageFeaturesPerUser = users.length > 0 ? totalFeaturesUsed / users.length : 0;

    // Sort features by usage
    featureStats.featuresByPopularity = Object.entries(featureCount)
      .map(([feature, count]) => ({ feature, usageCount: count }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 20);

    res.json(featureStats);
  } catch (error) {
    logger.error('Feature usage stats failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve feature usage statistics' });
  }
};

// Support ticket analytics (placeholder)
export const getSupportAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    const support = {
      timestamp: new Date().toISOString(),
      timeRange,
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
      },
      averageResolutionTime: 0,
      customerSatisfaction: 0
    };

    // Placeholder - would integrate with actual support ticket system
    res.json(support);
  } catch (error) {
    logger.error('Support analytics failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve support analytics' });
  }
};
