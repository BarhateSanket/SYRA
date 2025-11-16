const express = require('express');
const {
  healthCheck,
  readinessCheck,
  getMetrics,
  checkDependencies
} = require('../controllers/health.controller.js');
const { enhancedAuth } = require('../middlewares/sessionManager.js');

const healthRouter = express.Router();

// Public health endpoints
healthRouter.get('/health', healthCheck);
healthRouter.get('/ready', readinessCheck);
healthRouter.get('/dependencies', checkDependencies);

// Protected metrics endpoint
healthRouter.get('/metrics', enhancedAuth, getMetrics);

module.exports = healthRouter;
