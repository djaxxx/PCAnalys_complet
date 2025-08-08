import type { NextApiRequest, NextApiResponse } from 'next';
import createFastifyInstance from '../../src/server/fastify';
import { 
  UserProfileSchema, 
  SystemAnalysisRequestSchema,
  SystemAnalysisResponseSchema,
  RecommendationRequestSchema,
  RecommendationResponseSchema,
  BenchmarkDataSchema,
  BaseResponseSchema,
  HardwareAnalysisRequestSchema,
  HardwareAnalysisResponseSchema
} from '../../src/server/schemas';
import { DatabaseService } from '@pcanalys/database';
import { z } from 'zod';
import superjson from 'superjson';

// Initialize Fastify instance once
let fastifyInstance: ReturnType<typeof createFastifyInstance> | null = null;

const getFastifyInstance = () => {
  if (!fastifyInstance) {
    fastifyInstance = createFastifyInstance();

    // POST /api/analyze - Crée une nouvelle entrée d'analyse, retourne l'id
    fastifyInstance.post('/api/analyze', async (request, reply) => {
      try {
        const { hardwareData } = fastifyInstance.validateSchema(
          SystemAnalysisRequestSchema.pick({ hardwareData: true }), 
          request.body
        );
        
        // Créer l'analyse en base de données
        const analysis = await DatabaseService.createAnalysis(hardwareData);
        
        return reply.status(201).send({
          success: true,
          id: analysis.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        throw error;
      }
    });

    // GET /api/report/[id] - Récupère les données d'une analyse
    fastifyInstance.get('/api/report/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        
        const analysis = await DatabaseService.getAnalysis(id);
        
        if (!analysis) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: 'Analysis not found',
            timestamp: new Date().toISOString(),
          });
        }
        
        return reply.send({
          success: true,
          data: analysis,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        throw error;
      }
    });

    // POST /api/recommend - Exécute le moteur de recommandation hybride
    fastifyInstance.post('/api/recommend', async (request, reply) => {
      try {
        const recommendationRequest = fastifyInstance.validateSchema(RecommendationRequestSchema, request.body);
        
        // Mock AI recommendations - in real implementation, this would:
        // 1. Send request to Groq API
        // 2. Process AI response
        // 3. Format recommendations
        const mockRecommendations = {
          success: true,
          timestamp: new Date().toISOString(),
          recommendations: [
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'upgrade' as const,
              title: 'GPU Upgrade Recommendation',
              description: 'Upgrade your graphics card for better gaming performance',
              components: [
                {
                  component: 'gpu' as const,
                  recommendedSpec: {
                    name: 'NVIDIA RTX 4070',
                    model: 'RTX 4070',
                    manufacturer: 'NVIDIA',
                  },
                  reason: 'Significant performance improvement for gaming workloads',
                  impact: {
                    performance: 85,
                    cost: 599,
                  },
                },
              ],
              totalCost: 599,
              expectedImprovement: {
                gaming: 75,
                overall: 65,
              },
              confidence: 0.92,
            },
          ],
        };
        
        return reply.send(mockRecommendations);
      } catch (error) {
        throw error;
      }
    });

    // Benchmark submission endpoint
    fastifyInstance.post('/api/benchmarks', async (request, reply) => {
      try {
        const benchmarkData = fastifyInstance.validateSchema(BenchmarkDataSchema, request.body);
        
        // Process and store benchmark data
        return reply.status(201).send({
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Benchmark data submitted successfully',
          benchmarkId: Math.random().toString(36).substr(2, 9),
        });
      } catch (error) {
        throw error;
      }
    });

    // Get benchmark comparison
    fastifyInstance.get('/api/benchmarks/:componentType', async (request, reply) => {
      const { componentType } = request.params as { componentType: string };
      
      // Mock benchmark comparison data
      return reply.send({
        success: true,
        timestamp: new Date().toISOString(),
        componentType,
        benchmarks: [
          {
            name: 'Average Performance',
            score: Math.floor(Math.random() * 5000) + 1000,
            percentile: Math.floor(Math.random() * 100),
          },
        ],
      });
    });

    // Hardware analysis endpoint for Tauri agent
    fastifyInstance.post('/api/analyze', async (request, reply) => {
      try {
        // Validate the incoming data using Zod schema
        const analysisData = fastifyInstance.validateSchema(HardwareAnalysisRequestSchema, request.body);
        
        // Store the analysis data in the database
        const analysis = await DatabaseService.createHardwareAnalysis({
          hardware: analysisData.hardware,
          software: analysisData.software,
          systemMetrics: analysisData.systemMetrics,
          timestamp: analysisData.timestamp,
          agentVersion: analysisData.agentVersion,
        });
        
        // Return success response with analysis ID
        return reply.status(201).send({
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            id: analysis.id,
            createdAt: analysis.createdAt.toISOString(),
          },
        });
      } catch (error) {
        // Error will be handled by the global error handler
        throw error;
      }
    });

    // Get report by ID endpoint
    fastifyInstance.get('/api/report/:id', async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        
        // Validate ID format (basic UUID validation)
        if (!id || typeof id !== 'string' || id.length < 10) {
          return reply.status(400).send({
            success: false,
            error: 'Bad Request',
            message: 'Invalid report ID format',
            statusCode: 400,
            timestamp: new Date().toISOString(),
          });
        }
        
        // Fetch analysis + recommendations via Prisma
        const analysis = await DatabaseService.getAnalysis(id);
        
        // Return 404 when not found
        if (!analysis) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: `Report with ID '${id}' not found`,
            statusCode: 404,
            timestamp: new Date().toISOString(),
          });
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
        });
        
        return reply.send({
          success: true,
          timestamp: new Date().toISOString(),
          data: serializedData,
        });
      } catch (error) {
        // Error will be handled by the global error handler
        throw error;
      }
    });

    // AI Recommendations endpoint with streaming support
    fastifyInstance.post('/api/recommend', async (request, reply) => {
      try {
        const RecommendRequestSchema = z.object({
          analysisId: z.string().uuid(),
          profile: z.enum(['gaming', 'work', 'content-creation', 'general']),
        });

        const { analysisId, profile } = fastifyInstance.validateSchema(RecommendRequestSchema, request.body);

        // Get analysis data from database
        const analysis = await DatabaseService.getAnalysis(analysisId);
        if (!analysis || !analysis.rawData) {
          return reply.status(404).send({
            success: false,
            error: 'Not Found',
            message: 'Analysis not found',
            timestamp: new Date().toISOString(),
          });
        }

        const hardwareData = analysis.rawData as any;
        
        // Calculate deterministic performance score
        const calculatePerformanceScore = (hardware: any, profile: string): number => {
          const weights = {
            gaming: { cpu: 0.4, gpu: 0.5, ram: 0.1 },
            work: { cpu: 0.6, gpu: 0.2, ram: 0.2 },
            'content-creation': { cpu: 0.5, gpu: 0.3, ram: 0.2 },
            general: { cpu: 0.5, gpu: 0.3, ram: 0.2 },
          };

          const profileWeights = weights[profile as keyof typeof weights];
          if (!profileWeights) return 0;

          // Normalize hardware specs to create scores
          const cpuScore = Math.min(100, (hardware.cpu?.cores || 1) * (hardware.cpu?.frequency || 1000) / 40000);
          const gpuScore = Math.min(100, (hardware.gpu?.[0]?.memory || 1024 * 1024 * 1024) / (1024 * 1024 * 1024 * 8));
          const ramScore = Math.min(100, (hardware.memory?.total || 4 * 1024 * 1024 * 1024) / (1024 * 1024 * 1024 * 16));

          const score = cpuScore * profileWeights.cpu + gpuScore * profileWeights.gpu + ramScore * profileWeights.ram;
          return Math.min(100, Math.round(score * 100));
        };

        const performanceScore = calculatePerformanceScore(hardwareData.hardware, profile);

        // Setup streaming response headers
        reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
        reply.raw.setHeader('Transfer-Encoding', 'chunked');
        reply.raw.setHeader('Cache-Control', 'no-cache');
        reply.raw.setHeader('Connection', 'keep-alive');

        // Generate streaming recommendations from Groq
        const GroqClient = require('@pcanalys/lib').GroqClient;
        const groqClient = new GroqClient();
        const stream = await groqClient.generateRecommendations(hardwareData.hardware, profile, true);
        
        let fullContent = '';
        
        try {
          for await (const chunk of stream) {
            fullContent += chunk;
            reply.raw.write(chunk);
          }

          // After streaming is complete, save recommendations to database
          const recommendations = {
            content: fullContent.trim(),
            profile,
            performanceScore,
            generatedAt: new Date().toISOString(),
          };

          await DatabaseService.updateAnalysisWithRecommendations(
            analysisId,
            recommendations,
            performanceScore,
            profile
          );

          reply.raw.end();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          reply.raw.write('\n\nError generating recommendations. Please try again.');
          reply.raw.end();
        }

        // Return a promise that never resolves to prevent Fastify from interfering
        return new Promise(() => {});
      } catch (error) {
        throw error;
      }
    });
  }
  
  return fastifyInstance;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fastify = getFastifyInstance();
    await fastify.ready();

    // Build the full URL path
    const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path || '';
    const fullPath = `/api/${path}`;
    
    // Convert query parameters to string
    const queryString = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path') {
        if (Array.isArray(value)) {
          value.forEach(v => queryString.append(key, v));
        } else if (value) {
          queryString.append(key, value);
        }
      }
    });

    const url = fullPath + (queryString.toString() ? `?${queryString.toString()}` : '');

    // Handle the request using Fastify's inject method
    const response = await fastify.inject({
      method: req.method as any,
      url,
      headers: {
        ...req.headers,
        // Ensure content-type is properly handled
        'content-type': req.headers['content-type'] || 'application/json',
      },
      payload: req.body,
    });

    // Set response headers from Fastify response
    Object.entries(response.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        res.setHeader(key, value);
      }
    });

    // Set status code and send response
    res.status(response.statusCode);
    
    // Handle different content types
    const contentType = response.headers['content-type'];
    if (contentType?.includes('application/json')) {
      try {
        const jsonBody = JSON.parse(response.body);
        res.json(jsonBody);
      } catch {
        res.send(response.body);
      }
    } else {
      res.send(response.body);
    }

  } catch (error) {
    console.error('Fastify API handler error:', error);
    
    // Return proper error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          'Something went wrong',
      });
    }
  }
}
