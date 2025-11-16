import express from 'express';
import {
  trackEvent,
  getUserBehaviorAnalytics,
  getCommandUsageAnalytics,
  getUserSegmentation,
  getConversionFunnel,
  createABTest,
  getABTestVariant,
  trackABTestConversion,
  getABTestResults
} from '../controllers/analytics.controller.js';
import { enhancedAuth } from '../middlewares/sessionManager.js';

const analyticsRouter = express.Router();

// Require authentication for all analytics routes
analyticsRouter.use(enhancedAuth);

// Event tracking
analyticsRouter.post('/events', trackEvent);

// User analytics
analyticsRouter.get('/behavior', getUserBehaviorAnalytics);
analyticsRouter.get('/commands', getCommandUsageAnalytics);
analyticsRouter.get('/segmentation', getUserSegmentation);
analyticsRouter.get('/funnel', getConversionFunnel);

// A/B Testing
analyticsRouter.post('/ab-tests', createABTest);
analyticsRouter.get('/ab-tests/:testId/variant', getABTestVariant);
analyticsRouter.post('/ab-tests/:testId/convert', trackABTestConversion);
analyticsRouter.get('/ab-tests/:testId/results', getABTestResults);

export default analyticsRouter;
