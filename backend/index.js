import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDb from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routers
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import googleRouter from "./routes/google.routes.js";
import githubRouter from "./routes/github.routes.js";
import weatherRouter from "./routes/weather.routes.js";
import newsRouter from "./routes/news.routes.js";
import stocksRouter from "./routes/stocks.routes.js";
import remindersRouter from "./routes/reminders.routes.js";
import smartHomeRouter from "./routes/smartHome.routes.js";
import healthRouter from "./routes/health.routes.js";
import monitoringRouter from "./routes/monitoring.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import metricsRouter from "./routes/metrics.routes.js";

// ES Routers
import currencyRouter from "./routes/currency.routes.js";
import unitConversionRouter from "./routes/unitConversion.routes.js";

// Initializers
import { initializeReminders } from "./controllers/reminders.controller.js";
import { initializeDemoDevices } from "./controllers/smartHome.controller.js";

// Swagger Docs
import { swaggerUi, specs } from "./config/swagger.js";

// Security & Monitoring Middleware
import rateLimiter from "./middlewares/rateLimiter.js";
import securityHeaders, { customSecurityHeaders } from "./middlewares/securityHeaders.js";
import apiLogger from "./middlewares/apiLogger.js";
import errorHandler from "./middlewares/errorHandler.js";
import { metricsMiddleware } from "./controllers/metrics.controller.js";

// Performance
import responseTime from "response-time";

// Redis
import redisClient from "./config/redis.js";

// Optional Caching
import { cacheMiddleware } from "./middlewares/cache.js";

// Sentry
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// =============== SENTRY INIT (ONLY ONCE!) ===============
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.consoleIntegration(),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
// ========================================================

const app = express();
app.set("trust proxy", 1);

// Security + Logging
app.use(securityHeaders);
app.use(customSecurityHeaders);
app.use(apiLogger);
app.use(rateLimiter);

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://syra-voice.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(responseTime());

// Prometheus Metrics Middleware
app.use(metricsMiddleware);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/google", googleRouter);
app.use("/api/github", githubRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/news", newsRouter);
app.use("/api/stocks", stocksRouter);
app.use("/api/currency", currencyRouter);
app.use("/api/units", unitConversionRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/smarthome", smartHomeRouter);
app.use("/api/health", healthRouter);
app.use("/api/monitoring", monitoringRouter);
app.use("/api/analytics", analyticsRouter);

// FIXED: Metrics router MUST be mounted with a base path
app.use("/api", metricsRouter);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Global Error Handler
app.use(errorHandler);

// Start Server
const port = process.env.PORT || 5000;

app.listen(port, () => {
  connectDb();
  initializeReminders();
  initializeDemoDevices();
  console.log(`Server running on port ${port} with full monitoring + security`);
});

export default app;
