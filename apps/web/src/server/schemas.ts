import { z } from 'zod'

// Base response schema
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string().datetime(),
  message: z.string().optional(),
})

// Error response schema
export const ErrorResponseSchema = BaseResponseSchema.extend({
  success: z.literal(false),
  error: z.string(),
  statusCode: z.number(),
  details: z.array(z.any()).optional(),
})

// System component schemas for PC analysis
export const SystemComponentSchema = z.enum([
  'cpu',
  'gpu',
  'ram',
  'storage',
  'motherboard',
  'psu',
  'cooling',
  'network',
])

export const ComponentDetailsSchema = z.object({
  name: z.string(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  performance: z
    .object({
      score: z.number().min(0).max(100).optional(),
      temperature: z.number().optional(),
      usage: z.number().min(0).max(100).optional(),
    })
    .optional(),
})

// System analysis request schema
export const SystemAnalysisRequestSchema = z.object({
  component: SystemComponentSchema,
  details: ComponentDetailsSchema,
  timestamp: z.string().datetime().optional(),
  systemId: z.string().optional(),
})

// System analysis response schema
export const SystemAnalysisResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  analysis: z.object({
    component: SystemComponentSchema,
    status: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']),
    score: z.number().min(0).max(100),
    issues: z.array(
      z.object({
        type: z.enum(['performance', 'compatibility', 'temperature', 'power']),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        suggestion: z.string().optional(),
      }),
    ),
    recommendations: z.array(
      z.object({
        type: z.enum(['upgrade', 'optimization', 'maintenance']),
        component: SystemComponentSchema,
        description: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
        estimatedCost: z.number().positive().optional(),
      }),
    ),
  }),
})

// User profile schema
export const UserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).default('system'),
      notifications: z.boolean().default(true),
      autoAnalysis: z.boolean().default(false),
    })
    .optional(),
})

// AI recommendation request schema
export const RecommendationRequestSchema = z.object({
  systemSpecs: z.object({
    cpu: ComponentDetailsSchema.optional(),
    gpu: ComponentDetailsSchema.optional(),
    ram: ComponentDetailsSchema.optional(),
    storage: ComponentDetailsSchema.optional(),
  }),
  budget: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
      currency: z.string().length(3).default('USD'),
    })
    .optional(),
  usage: z.enum(['gaming', 'work', 'content-creation', 'general']),
  priority: z.array(z.enum(['performance', 'budget', 'power-efficiency', 'noise'])),
})

// AI recommendation response schema
export const RecommendationResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  recommendations: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['upgrade', 'new-build', 'optimization']),
      title: z.string(),
      description: z.string(),
      components: z.array(
        z.object({
          component: SystemComponentSchema,
          currentSpec: ComponentDetailsSchema.optional(),
          recommendedSpec: ComponentDetailsSchema,
          reason: z.string(),
          impact: z.object({
            performance: z.number().min(0).max(100),
            cost: z.number().min(0),
            powerUsage: z.number().optional(),
          }),
        }),
      ),
      totalCost: z.number().min(0),
      expectedImprovement: z.object({
        gaming: z.number().min(0).max(100).optional(),
        productivity: z.number().min(0).max(100).optional(),
        overall: z.number().min(0).max(100),
      }),
      confidence: z.number().min(0).max(1),
    }),
  ),
})

// Benchmark data schema
export const BenchmarkDataSchema = z.object({
  componentType: SystemComponentSchema,
  benchmarkType: z.enum(['synthetic', 'real-world', 'gaming']),
  results: z.array(
    z.object({
      test: z.string(),
      score: z.number(),
      unit: z.string().optional(),
      percentile: z.number().min(0).max(100).optional(),
    }),
  ),
  systemInfo: z
    .object({
      cpu: z.string().optional(),
      gpu: z.string().optional(),
      ram: z.string().optional(),
      os: z.string().optional(),
    })
    .optional(),
  timestamp: z.string().datetime(),
})

// Recommend endpoint request schema
export const RecommendEndpointRequestSchema = z.object({
  analysisId: z.string().uuid('Invalid analysis ID format'),
  profile: z.enum(['gaming', 'work', 'content-creation', 'general'], {
    errorMap: () => ({ message: 'Profile must be gaming, work, content-creation, or general' }),
  }),
})

// Recommend endpoint response schema
export const RecommendEndpointResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    analysisId: z.string().uuid(),
    recommendations: z.object({
      content: z.string(),
      profile: z.string(),
      performanceScore: z.number().min(0).max(100),
      generatedAt: z.string().datetime(),
    }),
  }),
  timestamp: z.string().datetime(),
})

// (moved schemas export to the end of file to avoid hoisting issues)

// Hardware analysis request schema for Tauri agent data
export const HardwareAnalysisRequestSchema = z.object({
  hardware: z.object({
    cpu: z.object({
      name: z.string(),
      cores: z.number(),
      frequency: z.number(), // MHz
      architecture: z.string().optional(),
      manufacturer: z.string().optional(),
    }),
    memory: z.object({
      total: z.number(), // bytes
      available: z.number(), // bytes
      used: z.number(), // bytes
      speed: z.number().optional(), // MHz
    }),
    storage: z.array(
      z.object({
        name: z.string(),
        mountPoint: z.string(),
        total: z.number(), // bytes
        available: z.number(), // bytes
        used: z.number(), // bytes
        fileSystem: z.string(),
        type: z.enum(['SSD', 'HDD', 'NVME', 'unknown']).optional(),
      }),
    ),
    gpu: z.array(
      z.object({
        name: z.string(),
        vendor: z.string(),
        memory: z.number().optional(), // bytes
        driver: z.string().optional(),
      }),
    ),
  }),
  software: z.object({
    os: z.object({
      name: z.string(),
      version: z.string(),
      arch: z.string(),
      build: z.string().optional(),
    }),
    installedSoftware: z
      .array(
        z.object({
          name: z.string(),
          version: z.string().optional(),
          publisher: z.string().optional(),
        }),
      )
      .optional(),
  }),
  systemMetrics: z
    .object({
      cpuUsage: z.number().min(0).max(100).optional(),
      memoryUsage: z.number().min(0).max(100).optional(),
      temperature: z
        .object({
          cpu: z.number().optional(),
          gpu: z.number().optional(),
        })
        .optional(),
      bootTime: z.string().datetime().optional(),
    })
    .optional(),
  timestamp: z.string().datetime().optional(),
  agentVersion: z.string().optional(),
})

// Hardware analysis response schema
export const HardwareAnalysisResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: z.object({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
  }),
})

// Export schema types for TypeScript
export type BaseResponse = z.infer<typeof BaseResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type SystemComponent = z.infer<typeof SystemComponentSchema>
export type ComponentDetails = z.infer<typeof ComponentDetailsSchema>
export type SystemAnalysisRequest = z.infer<typeof SystemAnalysisRequestSchema>
export type SystemAnalysisResponse = z.infer<typeof SystemAnalysisResponseSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>
export type BenchmarkData = z.infer<typeof BenchmarkDataSchema>
export type HardwareAnalysisRequest = z.infer<typeof HardwareAnalysisRequestSchema>
export type HardwareAnalysisResponse = z.infer<typeof HardwareAnalysisResponseSchema>

// Export all schemas for easy import (placed after all declarations)
export const schemas = {
  BaseResponseSchema,
  ErrorResponseSchema,
  SystemComponentSchema,
  ComponentDetailsSchema,
  SystemAnalysisRequestSchema,
  SystemAnalysisResponseSchema,
  UserProfileSchema,
  RecommendationRequestSchema,
  RecommendationResponseSchema,
  BenchmarkDataSchema,
  HardwareAnalysisRequestSchema,
  HardwareAnalysisResponseSchema,
  RecommendEndpointRequestSchema,
  RecommendEndpointResponseSchema,
} as const
