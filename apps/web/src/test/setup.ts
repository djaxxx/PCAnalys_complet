import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for tests
beforeAll(() => {
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
  process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test'
})

afterEach(() => {
  // Clean up any test state if needed
})

afterAll(() => {
  // Global cleanup
})
