import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import createFastifyInstance from '../../server/fastify'
import { DatabaseService } from '@pcanalys/database'
import { HardwareAnalysisRequestSchema } from '../../server/schemas'
import type { FastifyInstance } from 'fastify'

// Mock the database service
vi.mock('@pcanalys/database', () => ({
  DatabaseService: {
    createHardwareAnalysis: vi.fn(),
  },
}))

describe('POST /api/analyze', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = createFastifyInstance()
    
    // Register the analyze endpoint for testing
    app.post('/api/analyze', async (request, reply) => {
      try {
        // Validate the incoming data using Zod schema
        const analysisData = app.validateSchema(HardwareAnalysisRequestSchema, request.body)
        
        // Store the analysis data in the database
        const analysis = await DatabaseService.createHardwareAnalysis({
          hardware: analysisData.hardware,
          software: analysisData.software,
          systemMetrics: analysisData.systemMetrics,
          timestamp: analysisData.timestamp,
          agentVersion: analysisData.agentVersion,
        })
        
        // Return success response with analysis ID
        return reply.status(201).send({
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            id: analysis.id,
            createdAt: analysis.createdAt.toISOString(),
          },
        })
      } catch (error) {
        // Error will be handled by the global error handler
        throw error
      }
    })
    
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
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
        total: 17179869184, // 16GB in bytes
        available: 8589934592, // 8GB in bytes
        used: 8589934592, // 8GB in bytes
        speed: 3200,
      },
      storage: [
        {
          name: 'Samsung 980 Pro',
          mountPoint: 'C:',
          total: 1099511627776, // 1TB in bytes
          available: 549755813888, // ~500GB in bytes
          used: 549755813888, // ~500GB in bytes
          fileSystem: 'NTFS',
          type: 'NVME',
        },
      ],
      gpu: [
        {
          name: 'NVIDIA GeForce RTX 3080',
          vendor: 'NVIDIA',
          memory: 10737418240, // 10GB in bytes
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

  it('should create analysis with valid data and return 201 with ID', async () => {
    // Mock successful database operation
    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date('2025-01-08T10:35:00.000Z'),
    }
    
    vi.mocked(DatabaseService.createHardwareAnalysis).mockResolvedValueOnce(mockAnalysis as any)

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: validPayload,
    })

    expect(response.statusCode).toBe(201)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
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

  it('should return 400 for invalid payload structure', async () => {
    const invalidPayload = {
      hardware: {
        cpu: {
          // Missing required 'name' field
          cores: 8,
          frequency: 3600,
        },
        memory: {
          total: 17179869184,
          available: 8589934592,
          used: 8589934592,
        },
        storage: [],
        gpu: [],
      },
      software: {
        os: {
          name: 'Windows',
          version: '11',
          arch: 'x64',
        },
      },
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: invalidPayload,
    })

    expect(response.statusCode).toBe(400)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: false,
      error: expect.any(String),
      message: expect.stringMatching(/Validation error/),
    })
  })

  it('should return 400 for missing required fields', async () => {
    const incompletePayload = {
      hardware: {
        cpu: {
          name: 'Intel Core i7',
          cores: 8,
          frequency: 3600,
        },
        // Missing memory, storage, gpu
      },
      // Missing software
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: incompletePayload,
    })

    expect(response.statusCode).toBe(400)
    
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.error).toEqual(expect.any(String))
  })

  it('should return 400 for invalid data types', async () => {
    const invalidTypesPayload = {
      ...validPayload,
      hardware: {
        ...validPayload.hardware,
        cpu: {
          ...validPayload.hardware.cpu,
          cores: 'eight', // Should be number
          frequency: '3600MHz', // Should be number
        },
        memory: {
          ...validPayload.hardware.memory,
          total: 'very large', // Should be number
        },
      },
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: invalidTypesPayload,
    })

    expect(response.statusCode).toBe(400)
    
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.message).toMatch(/Validation error/)
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    vi.mocked(DatabaseService.createHardwareAnalysis).mockRejectedValueOnce(
      new Error('Database connection failed')
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: validPayload,
    })

    expect(response.statusCode).toBe(500)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: false,
      error: 'Internal Server Error',
    })
  })

  it('should accept minimal valid payload', async () => {
    const minimalPayload = {
      hardware: {
        cpu: {
          name: 'AMD Ryzen 5',
          cores: 6,
          frequency: 3600,
        },
        memory: {
          total: 8589934592, // 8GB
          available: 4294967296, // 4GB
          used: 4294967296, // 4GB
        },
        storage: [
          {
            name: 'Generic SSD',
            mountPoint: '/',
            total: 500000000000, // ~500GB
            available: 250000000000, // ~250GB
            used: 250000000000, // ~250GB
            fileSystem: 'ext4',
          },
        ],
        gpu: [
          {
            name: 'Integrated Graphics',
            vendor: 'AMD',
          },
        ],
      },
      software: {
        os: {
          name: 'Ubuntu',
          version: '22.04',
          arch: 'x64',
        },
      },
    }

    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      createdAt: new Date(),
    }
    
    vi.mocked(DatabaseService.createHardwareAnalysis).mockResolvedValueOnce(mockAnalysis as any)

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: minimalPayload,
    })

    expect(response.statusCode).toBe(201)
    
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(mockAnalysis.id)
  })

  it('should validate systemMetrics ranges correctly', async () => {
    const payloadWithInvalidMetrics = {
      ...validPayload,
      systemMetrics: {
        cpuUsage: 150, // Invalid: > 100
        memoryUsage: -5, // Invalid: < 0
      },
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: payloadWithInvalidMetrics,
    })

    expect(response.statusCode).toBe(400)
    
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.message).toMatch(/Validation error/)
  })

  it('should handle empty arrays in hardware components', async () => {
    const payloadWithEmptyArrays = {
      ...validPayload,
      hardware: {
        ...validPayload.hardware,
        storage: [], // Empty but should be valid
        gpu: [], // Empty but should be valid
      },
    }

    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      createdAt: new Date(),
    }
    
    vi.mocked(DatabaseService.createHardwareAnalysis).mockResolvedValueOnce(mockAnalysis as any)

    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: payloadWithEmptyArrays,
    })

    expect(response.statusCode).toBe(201)
    
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
  })
})
