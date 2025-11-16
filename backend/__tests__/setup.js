const dotenv = require('dotenv')

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Mock external dependencies
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
  },
}))

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  })),
}))

// Global test setup
beforeAll(async () => {
  // Any global setup
})

afterAll(async () => {
  // Any global cleanup
})
