import { z } from 'zod'
import { SystemInfoSchema } from './system'

export const AnalysisResultSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  systemInfo: SystemInfoSchema,
  recommendations: z.array(z.string()),
})

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

export const AnalysisRequestSchema = z.object({
  systemInfo: SystemInfoSchema.optional(),
})

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>
