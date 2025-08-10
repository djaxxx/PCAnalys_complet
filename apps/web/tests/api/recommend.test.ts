import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/recommend'

// Vitest APIs
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the dependencies
vi.mock('@pcanalys/database', () => ({
  DatabaseService: {
    getAnalysis: vi.fn(),
    updateAnalysisWithRecommendations: vi.fn(),
  },
}))

vi.mock('@pcanalys/lib', () => ({
  GroqClient: vi.fn().mockImplementation(() => ({
    generateRecommendations: vi
      .fn()
      .mockResolvedValue(['Mock recommendation 1', 'Mock recommendation 2']),
  })),
}))

describe('/api/recommend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(405)
    const allow = res.getHeader('Allow') as string | string[] | undefined
    const allowStr = Array.isArray(allow) ? allow.join(', ') : allow
    expect(allowStr).toBe('POST')
  })

  it('should validate request body', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { analysisId: 'invalid-uuid', profile: 'invalid-profile' },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toBe('Bad Request')
  })

  it('should return 404 if analysis not found', async () => {
    const { DatabaseService } = await import('@pcanalys/database')
    ;(DatabaseService.getAnalysis as any).mockResolvedValue(null)
    const { req, res } = createMocks({
      method: 'POST',
      body: { analysisId: '12345678-1234-1234-1234-123456789012', profile: 'gaming' },
    })
    await handler(req, res)
    expect(res._getStatusCode()).toBe(404)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toBe('Analysis not found')
  })

  it('should process valid request successfully', async () => {
    const { DatabaseService } = await import('@pcanalys/database')
    const mockAnalysis = {
      id: '12345678-1234-1234-1234-123456789012',
      rawData: {
        hardware: {
          cpu: { name: 'Intel Core i7', cores: 8, frequency: 3200 },
          gpu: [{ name: 'NVIDIA RTX 3080', memory: 10 * 1024 * 1024 * 1024 }],
          memory: { total: 16 * 1024 * 1024 * 1024 },
        },
      },
    } as any
    ;(DatabaseService.getAnalysis as any).mockResolvedValue(mockAnalysis)
    ;(DatabaseService.updateAnalysisWithRecommendations as any).mockResolvedValue({})

    const { req, res } = createMocks({
      method: 'POST',
      body: { analysisId: '12345678-1234-1234-1234-123456789012', profile: 'gaming' },
    })
    await handler(req, res)
    expect(DatabaseService.getAnalysis as any).toHaveBeenCalledWith(
      '12345678-1234-1234-1234-123456789012',
    )
    expect(DatabaseService.updateAnalysisWithRecommendations as any).toHaveBeenCalled()
  })
})
