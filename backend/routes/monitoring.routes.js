import express from 'express';
import {
  getPerformanceMetrics,
  getErrorReports,
  getUserActivity,
  getSecurityEvents,
  reportError,
  getDatabaseMetrics,
  getRevenueAnalytics,
  getUserAcquisitionMetrics,
  getRetentionAnalysis,
  getFeatureUsageStats,
  getSupportAnalytics
} from '../controllers/monitoring.controller.js';
import { enhancedAuth } from '../middlewares/sessionManager.js';

const monitoringRouter = express.Router();

// All monitoring routes require authentication
monitoringRouter.use(enhancedAuth);

// Performance monitoring
monitoringRouter.get('/performance', getPerformanceMetrics);

// Error reporting and monitoring
monitoringRouter.get('/errors', getErrorReports);

// User activity monitoring
monitoringRouter.get('/activity', getUserActivity);

// Security events monitoring
monitoringRouter.get('/security', getSecurityEvents);

// Database metrics
monitoringRouter.get('/database', getDatabaseMetrics);

// Business Intelligence & Analytics
monitoringRouter.get('/revenue', getRevenueAnalytics);
monitoringRouter.get('/acquisition', getUserAcquisitionMetrics);
monitoringRouter.get('/retention', getRetentionAnalysis);
monitoringRouter.get('/features', getFeatureUsageStats);
monitoringRouter.get('/support', getSupportAnalytics);

// Client-side error reporting (public endpoint for error collection)
monitoringRouter.post('/report-error', reportError);

export default monitoringRouter;
