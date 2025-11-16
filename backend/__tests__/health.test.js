const request = require('supertest')
const express = require('express')
const healthRouter = require('../routes/health.routes.js')
const { healthCheck, readinessCheck, getMetrics, checkDependencies } = require('../controllers/health.controller.js')

// Mock mongoose
jest.mock('mongoose', () => ({
  connection: {
    db: {
      admin: () => ({
        ping: jest.fn()
      }),
      stats: jest.fn()
    },
    name: 'testdb'
  }
}))

// Mock os module
jest.mock('os', () => ({
  platform: jest.fn(() => 'linux'),
  arch: jest.fn(() => 'x64'),
  cpus: jest.fn(() => [1, 2, 3, 4]),
  totalmem: jest.fn(() => 17179869184), // 16GB
  freemem: jest.fn(() => 8589934592),  // 8GB
  loadavg: jest.fn(() => [1.5, 1.2, 1.0]),
  uptime: jest.fn(() => 3600)
}))

// Mock axios for external API checks
jest.mock('axios', () => ({
  default: {
    get: jest.fn()
  }
}))

const app = express()
app.use(express.json())
app.use('/api/health', healthRouter)

describe('Health Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/health/health', () => {
    it('should return healthy status when everything is working', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      const response = await request(app).get('/api/health/health')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('healthy')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('environment')
      expect(response.body).toHaveProperty('database')
      expect(response.body).toHaveProperty('memory')
      expect(response.body).toHaveProperty('system')
      expect(response.body.database.status).toBe('connected')
    })

    it('should return unhealthy status when database is down', async () => {
      const mockPing = jest.fn().mockRejectedValue(new Error('Connection failed'))
      require('mongoose').connection.db.admin().ping = mockPing

      const response = await request(app).get('/api/health/health')

      expect(response.status).toBe(503)
      expect(response.body.status).toBe('unhealthy')
      expect(response.body.database.status).toBe('disconnected')
      expect(response.body.database.error).toBe('Connection failed')
    })

    it('should handle unexpected errors', async () => {
      const mockPing = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      require('mongoose').connection.db.admin().ping = mockPing

      const response = await request(app).get('/api/health/health')

      expect(response.status).toBe(503)
      expect(response.body.status).toBe('unhealthy')
      expect(response.body.error).toBe('Unexpected error')
    })
  })

  describe('GET /api/health/ready', () => {
    it('should return ready status when database is connected', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      const response = await request(app).get('/api/health/ready')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ready')
      expect(response.body).toHaveProperty('timestamp')
    })

    it('should return not ready when database connection fails', async () => {
      const mockPing = jest.fn().mockRejectedValue(new Error('DB connection failed'))
      require('mongoose').connection.db.admin().ping = mockPing

      const response = await request(app).get('/api/health/ready')

      expect(response.status).toBe(503)
      expect(response.body.status).toBe('not ready')
      expect(response.body.error).toBe('Database connection failed')
    })
  })

  describe('GET /api/health/dependencies', () => {
    it('should return healthy status when all dependencies are working', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      const mockAxios = require('axios').default
      mockAxios.get.mockResolvedValue({ status: 200 })

      const response = await request(app).get('/api/health/dependencies')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('healthy')
      expect(response.body.checks.database.status).toBe('ok')
      expect(response.body.checks).toHaveProperty('OpenAI')
      expect(response.body.checks).toHaveProperty('GitHub API')
      expect(response.body.checks).toHaveProperty('Google APIs')
    })

    it('should return degraded status when some dependencies fail', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      const mockAxios = require('axios').default
      mockAxios.get.mockImplementation((url) => {
        if (url.includes('openai')) {
          return Promise.reject(new Error('OpenAI API down'))
        }
        return Promise.resolve({ status: 200 })
      })

      const response = await request(app).get('/api/health/dependencies')

      expect(response.status).toBe(503)
      expect(response.body.status).toBe('degraded')
      expect(response.body.checks.OpenAI.status).toBe('failed')
      expect(response.body.checks['GitHub API'].status).toBe('ok')
    })

    it('should handle axios timeout errors', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      const mockAxios = require('axios').default
      mockAxios.get.mockRejectedValue(new Error('Timeout'))

      const response = await request(app).get('/api/health/dependencies')

      expect(response.status).toBe(503)
      expect(response.body.status).toBe('degraded')
      expect(response.body.checks.OpenAI.status).toBe('failed')
      expect(response.body.checks.OpenAI.error).toBe('Timeout')
    })
  })

  describe('GET /api/health/metrics', () => {
    it('should return detailed metrics for authenticated users', async () => {
      const mockStats = jest.fn().mockResolvedValue({
        collections: 5,
        objects: 100,
        dataSize: 1024000,
        storageSize: 2048000,
        indexes: 10,
        indexSize: 512000
      })
      require('mongoose').connection.db.stats = mockStats

      const response = await request(app).get('/api/health/metrics')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('process')
      expect(response.body).toHaveProperty('memory')
      expect(response.body).toHaveProperty('cpu')
      expect(response.body).toHaveProperty('system')
      expect(response.body).toHaveProperty('database')
      expect(response.body.database.collections).toBe(5)
    })

    it('should handle database stats errors gracefully', async () => {
      const mockStats = jest.fn().mockRejectedValue(new Error('Stats error'))
      require('mongoose').connection.db.stats = mockStats

      const response = await request(app).get('/api/health/metrics')

      expect(response.status).toBe(200)
      expect(response.body.database.error).toBe('Stats error')
    })

    it('should handle unexpected errors in metrics endpoint', async () => {
      // Mock process.cpuUsage to throw error
      const originalCpuUsage = process.cpuUsage
      process.cpuUsage = jest.fn().mockImplementation(() => {
        throw new Error('CPU usage error')
      })

      const response = await request(app).get('/api/health/metrics')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Failed to retrieve metrics')

      // Restore original function
      process.cpuUsage = originalCpuUsage
    })
  })
})

describe('Health Controller Functions', () => {
  let mockReq, mockRes

  beforeEach(() => {
    mockReq = {}
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  describe('healthCheck', () => {
    it('should return healthy status with all system info', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      await healthCheck(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      const responseData = mockRes.json.mock.calls[0][0]
      expect(responseData.status).toBe('healthy')
      expect(responseData).toHaveProperty('database')
      expect(responseData).toHaveProperty('memory')
      expect(responseData).toHaveProperty('system')
    })

    it('should return unhealthy status when database fails', async () => {
      const mockPing = jest.fn().mockRejectedValue(new Error('DB Error'))
      require('mongoose').connection.db.admin().ping = mockPing

      await healthCheck(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(503)
      const responseData = mockRes.json.mock.calls[0][0]
      expect(responseData.status).toBe('unhealthy')
      expect(responseData.database.status).toBe('disconnected')
    })
  })

  describe('readinessCheck', () => {
    it('should return ready status when database is connected', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      await readinessCheck(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'ready',
        timestamp: expect.any(String)
      })
    })

    it('should return not ready when database fails', async () => {
      const mockPing = jest.fn().mockRejectedValue(new Error('DB Error'))
      require('mongoose').connection.db.admin().ping = mockPing

      await readinessCheck(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(503)
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'not ready',
        timestamp: expect.any(String),
        error: 'Database connection failed'
      })
    })
  })

  describe('checkDependencies', () => {
    it('should check all external services', async () => {
      const mockPing = jest.fn().mockResolvedValue(true)
      require('mongoose').connection.db.admin().ping = mockPing

      const mockAxios = require('axios').default
      mockAxios.get.mockResolvedValue({ status: 200 })

      await checkDependencies(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      const responseData = mockRes.json.mock.calls[0][0]
      expect(responseData.status).toBe('healthy')
      expect(responseData.checks).toHaveProperty('database')
      expect(responseData.checks).toHaveProperty('OpenAI')
      expect(responseData.checks).toHaveProperty('GitHub API')
      expect(responseData.checks).toHaveProperty('Google APIs')
    })
  })
})
