import express from "express";
import {
  healthCheck,
  readinessCheck,
  getMetrics,
  checkDependencies
} from "../controllers/health.controller.js";
import { enhancedAuth } from "../middlewares/sessionManager.js";

const healthRouter = express.Router();

// Public health endpoints
healthRouter.get("/health", healthCheck);
healthRouter.get("/ready", readinessCheck);
healthRouter.get("/dependencies", checkDependencies);

// Protected metrics endpoint
healthRouter.get("/metrics", enhancedAuth, getMetrics);

export default healthRouter;
