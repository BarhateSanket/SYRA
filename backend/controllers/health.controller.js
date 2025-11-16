const mongoose = require('mongoose');
const os = require('os');
const logger = require('../middlewares/apiLogger.js');

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Database connectivity check
    try {
      await mongoose.connection.db.admin().ping();
      health.database = {
        status: 'connected',
        name: mongoose.connection.name
      };
    } catch (dbError) {
      health.status = 'unhealthy';
      health.database = {
        status: 'disconnected',
        error: dbError.message
      };
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };

    // System info
    health.system = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
      loadAverage: os.loadavg()
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Readiness check (for Kubernetes/load balancers)
const readinessCheck = async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
};

// Detailed metrics endpoint (protected)
const getMetrics = async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      system: {
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg(),
        uptime: os.uptime()
      }
    };

    // Database stats
    try {
      const dbStats = await mongoose.connection.db.stats();
      metrics.database = {
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize
      };
    } catch (dbError) {
      metrics.database = { error: dbError.message };
    }

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics retrieval failed', { error: error.message });
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
};

// Service dependencies check
const checkDependencies = async (req, res) => {
  const dependencies = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Database check
  try {
    await mongoose.connection.db.admin().ping();
    dependencies.checks.database = {
      status: 'ok',
      responseTime: Date.now()
    };
  } catch (error) {
    dependencies.checks.database = {
      status: 'failed',
      error: error.message
    };
  }

  // External API checks (example - add your actual external services)
  const externalServices = [
    { name: 'OpenAI', url: 'https://api.openai.com/v1/models' },
    { name: 'GitHub API', url: 'https://api.github.com/zen' },
    { name: 'Google APIs', url: 'https://www.googleapis.com/oauth2/v1/tokeninfo' }
  ];

  for (const service of externalServices) {
    try {
      const axios = (await import('axios')).default;
      const start = Date.now();
      await axios.get(service.url, { timeout: 5000 });
      dependencies.checks[service.name] = {
        status: 'ok',
        responseTime: Date.now() - start
      };
    } catch (error) {
      dependencies.checks[service.name] = {
        status: 'failed',
        error: error.message
      };
    }
  }

  // Determine overall status
  const allChecks = Object.values(dependencies.checks);
  const hasFailures = allChecks.some(check => check.status === 'failed');
  dependencies.status = hasFailures ? 'degraded' : 'healthy';

  const statusCode = hasFailures ? 503 : 200;
  res.status(statusCode).json(dependencies);
};

module.exports = {
  healthCheck,
  readinessCheck,
  getMetrics,
  checkDependencies
};
