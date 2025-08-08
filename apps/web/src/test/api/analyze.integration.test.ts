import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import handler from '../../../pages/api/[...path]'
import { DatabaseService } from '@pcanalys/database'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock the database service
vi.mock('@pcanalys/database', () => ({
  DatabaseService: {
    createHardwareAnalysis: vi.fn(),
  },
}))

describe('Integration: POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validPayload = {
    hardware: {
      cpu: {
        name: 'Intel Core i7-12700K',
        cores: 12,
        frequency: 3600,
        architecture: 'x64',
        manufacturer: 'Intel',
      },
      memory: {
        total: 17179869184,
        available: 8589934592,
        used: 8589934592,
        speed: 3200,
      },
      storage: [
        {
          name: 'Samsung 980 Pro',
          mountPoint: 'C:',
          total: 1099511627776,
          available: 549755813888,
          used: 549755813888,
          fileSystem: 'NTFS',
          type: 'NVME',
        },
      ],
      gpu: [
        {
          name: 'NVIDIA GeForce RTX 3080',
          vendor: 'NVIDIA',
          memory: 10737418240,
          driver: '551.86',
        },
      ],
    },
    software: {
      os: {
        name: 'Windows',
        version: '11',
        arch: 'x64',
        build: '22631',
      },
      installedSoftware: [
        {
          name: 'Visual Studio Code',
          version: '1.85.0',
          publisher: 'Microsoft Corporation',
        },
      ],
    },
    systemMetrics: {
      cpuUsage: 15.5,
      memoryUsage: 65.2,
      temperature: {
        cpu: 42,
        gpu: 35,
      },
      bootTime: '2025-01-08T10:30:00.000Z',
    },
    timestamp: '2025-01-08T10:35:00.000Z',
    agentVersion: '1.0.0',
  }

  it('should handle valid analyze request end-to-end', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { path: ['analyze'] },
      body: validPayload,
      headers: {
        'content-type': 'application/json',
      },
    })

    // Mock successful database operation
    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date('2025-01-08T10:35:00.000Z'),
    }
    
    vi.mocked(DatabaseService.createHardwareAnalysis).mockResolvedValueOnce(mockAnalysis as any)

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    
    const responseData = JSON.parse(res._getData())
    expect(responseData).toMatchObject({
      success: true,
      timestamp: expect.any(String),
      data: {
        id: mockAnalysis.id,
        createdAt: expect.any(String),
      },
    })

    expect(DatabaseService.createHardwareAnalysis).toHaveBeenCalledWith({
      hardware: validPayload.hardware,
      software: validPayload.software,
      systemMetrics: validPayload.systemMetrics,
      timestamp: validPayload.timestamp,
      agentVersion: validPayload.agentVersion,
    })
  })

  it('should return 400 for invalid request structure', async () => {
    const invalidPayload = {
      hardware: {
        cpu: {
          // Missing required name field
          cores: 8,
          frequency: 3600,
        },
      },
    }

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { path: ['analyze'] },
      body: invalidPayload,
      headers: {
        'content-type': 'application/json',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData())
    expect(responseData).toMatchObject({
      success: false,
      error: expect.any(String),
      message: expect.stringMatching(/Validation error/),
    })

    expect(DatabaseService.createHardwareAnalysis).not.toHaveBeenCalled()
  })

  it('should handle database connection errors', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { path: ['analyze'] },
      body: validPayload,
      headers: {
        'content-type': 'application/json',
      },
    })

    // Mock database error
    vi.mocked(DatabaseService.createHardwareAnalysis).mockRejectedValueOnce(
      new Error('Database connection timeout')
    )

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    
    const responseData = JSON.parse(res._getData())
    expect(responseData).toMatchObject({
      success: false,
      error: 'Internal Server Error',
    })
  })

  it('should handle missing path parameter', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { path: [] }, // Empty path
      body: validPayload,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(404)
  })

  it('should handle wrong HTTP method', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET', // Should be POST
      query: { path: ['analyze'] },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(404)
  })

  it('should validate CORS headers for Tauri requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'OPTIONS',
      query: { path: ['analyze'] },
      headers: {
        origin: 'tauri://localhost',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getHeaders()).toHaveProperty('access-control-allow-origin')
    expect(res._getHeaders()).toHaveProperty('access-control-allow-methods')
  })

  it('should handle edge case: empty hardware arrays', async () => {
    const payloadWithEmptyArrays = {
      ...validPayload,
      hardware: {
        ...validPayload.hardware,
        storage: [],
        gpu: [],
      },
    }

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { path: ['analyze'] },
      body: payloadWithEmptyArrays,
      headers: {
        'content-type': 'application/json',
      },
    })

    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      createdAt: new Date(),
    }
    
    vi.mocked(DatabaseService.createHardwareAnalysis).mockResolvedValueOnce(mockAnalysis as any)

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    
    const responseData = JSON.parse(res._getData())
    expect(responseData.success).toBe(true)
  })
})
