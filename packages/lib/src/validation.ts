import type { z } from 'zod'

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data)
}

export const safeValidate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } => {
  const result = schema.safeParse(data)
  return result
}

export const createValidator = <T>(schema: z.ZodSchema<T>) => ({
  validate: (data: unknown) => validate(schema, data),
  safeValidate: (data: unknown) => safeValidate(schema, data),
})
