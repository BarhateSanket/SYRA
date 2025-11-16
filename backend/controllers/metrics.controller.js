import promClient from "prom-client";

// Create a Registry for all metrics
const register = new promClient.Registry();

// Default labels for all metrics
register.setDefaultLabels({
  app: "syra-backend",
});

// Collect default Node.js metrics (memory, CPU, event loop)
promClient.collectDefaultMetrics({ register });

/* ---------------------------------------------------------
   CUSTOM METRICS
--------------------------------------------------------- */

// HTTP Request Duration Histogram
const httpRequestDurationSeconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Total HTTP Requests
const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Active Connections
const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

// Database Query Duration
const databaseQueryDuration = new promClient.Histogram({
  name: "database_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "collection"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Register metrics
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueryDuration);

/* ---------------------------------------------------------
   MIDDLEWARE: Track HTTP Request Metrics
--------------------------------------------------------- */
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  // When response completes
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000; // seconds

    // Safe route name extraction
    const route =
      req.route?.path ||
      req.originalUrl ||
      req.url ||
      "unknown_route";

    // Observe duration
    httpRequestDurationSeconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    // Count total requests
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
};

/* ---------------------------------------------------------
   METRICS ENDPOINT
--------------------------------------------------------- */
export const getMetrics = async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    const metricsData = await register.metrics();
    res.end(metricsData);
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).end("Failed to generate metrics");
  }
};

/* ---------------------------------------------------------
   ACTIVE CONNECTIONS
--------------------------------------------------------- */
export const updateActiveConnections = (count) => {
  activeConnections.set(count);
};

/* ---------------------------------------------------------
   TRACK DATABASE QUERY TIME
--------------------------------------------------------- */
export const trackDatabaseQuery = (operation, collection, durationMs) => {
  const durationSec = durationMs / 1000;

  databaseQueryDuration
    .labels(operation, collection)
    .observe(durationSec);
};

export { register };
