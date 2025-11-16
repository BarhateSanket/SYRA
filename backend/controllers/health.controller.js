import mongoose from "mongoose";
import os from "os";
import axios from "axios";

/* ---------------------------------------------------------
   HEALTH CHECK
--------------------------------------------------------- */
export const healthCheck = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.version,
      environment: process.env.NODE_ENV || "development",
    };

    // DATABASE CHECK
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        health.database = {
          status: "connected",
          name: mongoose.connection.name,
        };
      } else {
        throw new Error("Mongoose not connected");
      }
    } catch (dbError) {
      health.status = "unhealthy";
      health.database = {
        status: "disconnected",
        error: dbError.message,
      };
    }

    // MEMORY USAGE
    const mem = process.memoryUsage();
    health.memory = {
      rss: `${(mem.rss / 1024 / 1024).toFixed(1)}MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`,
      external: `${(mem.external / 1024 / 1024).toFixed(1)}MB`,
    };

    // SYSTEM INFO
    health.system = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)}GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)}GB`,
      loadAverage: os.loadavg(),
    };

    const code = health.status === "healthy" ? 200 : 503;
    res.status(code).json(health);

  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/* ---------------------------------------------------------
   READINESS CHECK
--------------------------------------------------------- */
export const readinessCheck = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "not ready",
        error: "Database not connected",
        timestamp: new Date().toISOString(),
      });
    }

    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Readiness check failed:", error.message);
    res.status(503).json({
      status: "not ready",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/* ---------------------------------------------------------
   METRICS (DETAILED)
--------------------------------------------------------- */
export const getMetrics = async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      system: {
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg(),
        uptime: os.uptime(),
      },
    };

    // DATABASE STATS
    try {
      if (mongoose.connection.readyState === 1) {
        const stats = await mongoose.connection.db.stats();
        metrics.database = stats;
      } else {
        throw new Error("Database not connected");
      }
    } catch (err) {
      metrics.database = { error: err.message };
    }

    res.json(metrics);

  } catch (error) {
    console.error("Metrics retrieval failed:", error.message);
    res.status(500).json({
      error: "Failed to retrieve metrics",
      timestamp: new Date().toISOString(),
    });
  }
};

/* ---------------------------------------------------------
   DEPENDENCIES CHECK
--------------------------------------------------------- */
export const checkDependencies = async (req, res) => {
  const dependencies = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  /* ----- Database Check ----- */
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      dependencies.checks.database = {
        status: "ok",
      };
    } else {
      dependencies.checks.database = {
        status: "failed",
        error: "Not connected",
      };
    }
  } catch (error) {
    dependencies.checks.database = {
      status: "failed",
      error: error.message,
    };
  }

  /* ----- External Services Check ----- */
  const services = [
    { name: "OpenAI", url: "https://api.openai.com/v1/models" },
    { name: "GitHub API", url: "https://api.github.com/zen" },
    { name: "Google APIs", url: "https://www.googleapis.com/oauth2/v1/tokeninfo" },
  ];

  for (const service of services) {
    try {
      const start = Date.now();
      await axios.get(service.url, { timeout: 5000 });

      dependencies.checks[service.name] = {
        status: "ok",
        responseTime: Date.now() - start,
      };

    } catch (error) {
      dependencies.checks[service.name] = {
        status: "failed",
        error: error.message,
      };
    }
  }

  /* ----- Overall Status ----- */
  const failures = Object.values(dependencies.checks).some(
    (check) => check.status === "failed"
  );

  dependencies.status = failures ? "degraded" : "healthy";

  res.status(failures ? 503 : 200).json(dependencies);
};
