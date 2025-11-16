import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import googleRouter from "./routes/google.routes.js"
import githubRouter from "./routes/github.routes.js"
import weatherRouter from "./routes/weather.routes.js"
import newsRouter from "./routes/news.routes.js"
import stocksRouter from "./routes/stocks.routes.js"
import currencyRouter from "./routes/currency.routes.js"
import unitConversionRouter from "./routes/unitConversion.routes.js"
import remindersRouter from "./routes/reminders.routes.js"
import smartHomeRouter from "./routes/smartHome.routes.js"
import healthRouter from "./routes/health.routes.js"
import monitoringRouter from "./routes/monitoring.routes.js"
import analyticsRouter from "./routes/analytics.routes.js"
import metricsRouter from "./routes/metrics.routes.js"
import geminiResponse from "./gemini.js"
import { initializeReminders } from "./controllers/reminders.controller.js"
import { initializeDemoDevices } from "./controllers/smartHome.controller.js"

// Swagger documentation
import { swaggerUi, specs } from "./config/swagger.js"

// Import security middleware
import rateLimiter from "./middlewares/rateLimiter.js"
import securityHeaders from "./middlewares/securityHeaders.js"
import apiLogger from "./middlewares/apiLogger.js"
import errorHandler from "./middlewares/errorHandler.js"

// Import monitoring and metrics
import { metricsMiddleware } from "./controllers/metrics.controller.js"
import responseTime from "response-time"

// Import Redis and caching
import redisClient from "./config/redis.js"
import { cacheMiddleware } from "./middlewares/cache.js"

// Sentry error tracking
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Console(),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const app=express()

app.set("trust proxy", 1);

// Security middleware - applied in correct order
app.use(securityHeaders)
app.use(apiLogger)
app.use(rateLimiter)

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://syra-voice.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const port=process.env.PORT || 5000
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

// Response time tracking for metrics
app.use(responseTime())

// Metrics middleware
app.use(metricsMiddleware)

// API routes
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/google",googleRouter)
app.use("/api/github",githubRouter)
app.use("/api/weather",weatherRouter)
app.use("/api/news",newsRouter)
app.use("/api/stocks",stocksRouter)
app.use("/api/currency",currencyRouter)
app.use("/api/units",unitConversionRouter)
app.use("/api/reminders",remindersRouter)
app.use("/api/smarthome",smartHomeRouter)

// Health and monitoring routes
app.use("/api/health", healthRouter)
app.use("/api/monitoring", monitoringRouter)
app.use("/api/analytics", analyticsRouter)

// Metrics routes
app.use(metricsRouter)

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Global error handler - must be last
app.use(errorHandler)

app.listen(port,()=>{
    connectDb()
    initializeReminders()
    initializeDemoDevices()
    console.log("server started with security enhancements")
})
