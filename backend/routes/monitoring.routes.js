import express from "express";
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
} from "../controllers/monitoring.controller.js";
import { enhancedAuth } from "../middlewares/sessionManager.js";

const monitoringRouter = express.Router();

// Auth required for all monitoring routes
monitoringRouter.use(enhancedAuth);

// ─────────────────────────────────────────────
// Monitoring & Analytics Routes
// ─────────────────────────────────────────────

// Performance
monitoringRouter.get("/performance", getPerformanceMetrics);

// Error logs
monitoringRouter.get("/errors", getErrorReports);

// User activity
monitoringRouter.get("/activity", getUserActivity);

// Security monitoring
monitoringRouter.get("/security", getSecurityEvents);

// Database stats
monitoringRouter.get("/database", getDatabaseMetrics);

// Revenue + business analytics
monitoringRouter.get("/revenue", getRevenueAnalytics);
monitoringRouter.get("/acquisition", getUserAcquisitionMetrics);

// Retention cohorts
monitoringRouter.get("/retention", getRetentionAnalysis);

// Feature usage analytics
monitoringRouter.get("/features", getFeatureUsageStats);

// Support/ticket analytics
monitoringRouter.get("/support", getSupportAnalytics);

// ─────────────────────────────────────────────
// Public: Client-side error reporting
// (Does NOT require authentication)
// ─────────────────────────────────────────────
monitoringRouter.post("/report-error", reportError);

export default monitoringRouter;
