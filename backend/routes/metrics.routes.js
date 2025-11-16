import express from 'express';
import { getMetrics } from '../controllers/metrics.controller.js';

const router = express.Router();

// GET /api/metrics - Prometheus metrics endpoint
router.get('/metrics', getMetrics);

export default router;
