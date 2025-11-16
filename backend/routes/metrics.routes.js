import express from "express";
import { getMetrics } from "../controllers/metrics.controller.js";

const router = express.Router();

// Prometheus Metrics Endpoint
// GET /api/metrics
router.get("/metrics", getMetrics);

export default router;
