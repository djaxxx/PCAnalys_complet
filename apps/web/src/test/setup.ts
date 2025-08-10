import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for tests
beforeAll(() => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
  process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test'
})

afterEach(() => {
  // Clean up any test state if needed
})

afterAll(() => {
  // Global cleanup
})
