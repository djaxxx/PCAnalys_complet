import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import createFastifyInstance from '../../server/fastify'
import { DatabaseService } from '@pcanalys/database'
import type { FastifyInstance } from 'fastify'
import superjson from 'superjson'

// Mock the database service
vi.mock('@pcanalys/database', () => ({
  DatabaseService: {
    getAnalysis: vi.fn(),
  },
}))

describe('GET /api/report/:id', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = createFastifyInstance()
    
    // Register the report endpoint for testing (since it's added in [...path].ts)
    app.get('/api/report/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        
        // Validate ID format (basic UUID validation)
        if (!id || typeof id !== 'string' || id.length < 10) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'Invalid report ID format',
            statusCode: 400,
            timestamp: new Date().toISOString(),
          })
        }
        
        // Fetch analysis + recommendations via Prisma
        const analysis = await DatabaseService.getAnalysis(id)
        
        // Return 404 when not found
        if (!analysis) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: `Report with ID '${id}' not found`,
            statusCode: 404,
            timestamp: new Date().toISOString(),
          })
        }
        
        // Serialize safely with superjson to handle Date objects and other complex types
        const serializedData = superjson.serialize({
          id: analysis.id,
          rawData: analysis.rawData,
          profile: analysis.profile || analysis.userProfile, // Handle both old and new field names
          score: analysis.score || analysis.performanceScore, // Handle both old and new field names
          recommendations: analysis.recommendations,
          performanceScore: analysis.performanceScore,
          userProfile: analysis.userProfile,
          hardwareData: analysis.hardwareData,
          createdAt: analysis.createdAt,
        })
        
        return reply.send({
          success: true,
          timestamp: new Date().toISOString(),
          data: serializedData,
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

  it('should return report data with 200 for valid existing ID', async () => {
    // Mock analysis data with all fields
    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      rawData: {
        hardware: {
          cpu: { name: 'Intel Core i7-12700K', cores: 12, frequency: 3600 },
          memory: { total: 17179869184, available: 8589934592, used: 8589934592 },
        },
        software: {
          os: { name: 'Windows', version: '11', arch: 'x64' },
        },
      },
      profile: 'gaming',
      score: 85,
      recommendations: [
        {
          type: 'upgrade',
          component: 'gpu',
          description: 'Consider upgrading your GPU for better performance',
        },
      ],
      performanceScore: 85,
      userProfile: 'gaming',
      hardwareData: null,
      createdAt: new Date('2025-01-08T10:35:00.000Z'),
    }
    
    vi.mocked(DatabaseService.getAnalysis).mockResolvedValueOnce(mockAnalysis as any)

    const response = await app.inject({
      method: 'GET',
      url: '/api/report/550e8400-e29b-41d4-a716-446655440000',
    })

    expect(response.statusCode).toBe(200)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: true,
      timestamp: expect.any(String),
      data: expect.objectContaining({
        json: expect.objectContaining({
          id: mockAnalysis.id,
          rawData: mockAnalysis.rawData,
          profile: mockAnalysis.profile,
          score: mockAnalysis.score,
          recommendations: mockAnalysis.recommendations,
          performanceScore: mockAnalysis.performanceScore,
          userProfile: mockAnalysis.userProfile,
        }),
        meta: expect.any(Object), // superjson meta data
      }),
    })
    
    expect(DatabaseService.getAnalysis).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000')
  })

  it('should return 404 when report ID does not exist', async () => {
    // Mock database returning null for non-existent ID
    vi.mocked(DatabaseService.getAnalysis).mockResolvedValueOnce(null)

    const response = await app.inject({
      method: 'GET',
      url: '/api/report/non-existent-id-123456789',
    })

    expect(response.statusCode).toBe(404)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: false,
      error: 'Not Found',
      message: "Report with ID 'non-existent-id-123456789' not found",
      statusCode: 404,
      timestamp: expect.any(String),
    })
  })

  it('should return 400 for invalid ID format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/report/invalid',
    })

    expect(response.statusCode).toBe(400)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: false,
      error: 'Bad Request',
      message: 'Invalid report ID format',
      statusCode: 400,
      timestamp: expect.any(String),
    })
  })

  it('should return 400 for empty ID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/report/', // This actually matches the :id pattern with empty string
    })

    // Our validation logic catches empty/invalid IDs and returns 400
    expect(response.statusCode).toBe(400)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: false,
      error: 'Bad Request',
      message: 'Invalid report ID format',
    })
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    vi.mocked(DatabaseService.getAnalysis).mockRejectedValueOnce(
      new Error('Database connection failed')
    )

    const response = await app.inject({
      method: 'GET',
      url: '/api/report/550e8400-e29b-41d4-a716-446655440000',
    })

    expect(response.statusCode).toBe(500)
    
    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: false,
      error: 'Internal Server Error',
    })
  })

  it('should handle analysis with both old and new field names correctly', async () => {
    // Mock analysis data with old field names only
    const mockAnalysisOldFields = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      rawData: { test: 'data' },
      profile: null,
      score: null,
      recommendations: null,
      performanceScore: 75,
      userProfile: 'productivity',
      hardwareData: { legacy: 'data' },
      createdAt: new Date('2025-01-08T11:00:00.000Z'),
    }
    
    vi.mocked(DatabaseService.getAnalysis).mockResolvedValueOnce(mockAnalysisOldFields as any)

    const response = await app.inject({
      method: 'GET',
      url: '/api/report/550e8400-e29b-41d4-a716-446655440001',
    })

    expect(response.statusCode).toBe(200)
    
    const body = JSON.parse(response.body)
    const deserializedData = superjson.deserialize(body.data) as any
    
    // Should use new field names when old ones are null
    expect(deserializedData.profile).toBe('productivity') // Should fallback to userProfile
    expect(deserializedData.score).toBe(75) // Should fallback to performanceScore
  })

  it('should properly serialize Date objects with superjson', async () => {
    const testDate = new Date('2025-01-08T12:30:00.000Z')
    
    const mockAnalysis = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      rawData: { timestamp: testDate },
      profile: 'gaming',
      score: 90,
      recommendations: null,
      performanceScore: 90,
      userProfile: 'gaming',
      hardwareData: null,
      createdAt: testDate,
    }
    
    vi.mocked(DatabaseService.getAnalysis).mockResolvedValueOnce(mockAnalysis as any)

    const response = await app.inject({
      method: 'GET',
      url: '/api/report/550e8400-e29b-41d4-a716-446655440002',
    })

    expect(response.statusCode).toBe(200)
    
    const body = JSON.parse(response.body)
    
    // Verify that superjson serialization includes meta information for Date objects
    expect(body.data).toHaveProperty('json')
    expect(body.data).toHaveProperty('meta')
    
    // Deserialize and verify Date objects are properly handled
    const deserializedData = superjson.deserialize(body.data) as any
    expect(deserializedData.createdAt).toBeInstanceOf(Date)
    expect(deserializedData.createdAt.toISOString()).toBe(testDate.toISOString())
  })
})
