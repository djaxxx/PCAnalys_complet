import { z } from 'zod';
import { BaseResponseSchema } from './common';

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiResponseSchema = BaseResponseSchema.extend({
  data: z.unknown().optional(),
  error: ApiErrorSchema.optional(),
});

export type ApiResponse<T = unknown> = Omit<z.infer<typeof ApiResponseSchema>, 'data'> & {
  data?: T;
};
