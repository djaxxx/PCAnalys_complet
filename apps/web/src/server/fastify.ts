import fastify, {
  FastifyInstance as FastifyInstanceType,
  FastifyRequest,
  FastifyReply,
} from 'fastify'
import cors from '@fastify/cors'
import { ZodSchema, ZodError } from 'zod'

// Extend Fastify instance with custom methods
declare module 'fastify' {
  interface FastifyInstance {
    validateSchema<T>(schema: ZodSchema<T>, data: unknown): T
  }
}

// Fastify instance configuration
const createFastifyInstance = () => {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    disableRequestLogging: process.env.NODE_ENV === 'production',
    trustProxy: true,
  })

  // Register CORS plugin with comprehensive Tauri and development origin support
  app.register(cors, {
    origin: [
      // Development origins
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:1420', // Tauri dev server default
      // Tauri origins
      'tauri://localhost',
      'https://tauri.localhost',
      /^tauri:\/\/.*$/,
      // Production origins (to be configured)
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'Accept',
      'Origin',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })

  // Request logging and timing hook
  app.addHook('onRequest', async (request, reply) => {
    ;(request as any).startTime = Date.now()
    request.log.info(
      {
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
      },
      'Incoming request',
    )
  })

  // Utility method for Zod validation with detailed error handling
  const validateSchema = <T>(schema: ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data)
    if (!result.success) {
      const errorMessages = result.error.errors
        .map(err => {
          const path = err.path.length > 0 ? err.path.join('.') : 'root'
          return `${path}: ${err.message}`
        })
        .join(', ')

      throw new Error(`Validation error: ${errorMessages}`)
    }
    return result.data
  }

  // Add validation utility to fastify instance
  app.decorate('validateSchema', validateSchema)

  // Response formatting hook
  app.addHook('onSend', async (request, reply, payload) => {
    // Add standard headers for API responses
    reply.header('X-API-Version', '1.0.0')
    reply.header('X-Response-Time', Date.now() - (request as any).startTime)
    return payload
  })

  // Enhanced error handler with proper error classification
  app.setErrorHandler(async (error, request, reply) => {
    const startTime = Date.now()

    // Log error with context
    request.log.error(
      {
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
      },
      'Request error occurred',
    )

    // Handle different error types
    if (error.message.includes('Validation error')) {
      return reply.status(400).send({
        success: false,
        error: 'Bad Request',
        message: error.message,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      })
    }

    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation Error',
        message: 'Request data validation failed',
        details: (error as unknown as ZodError).errors,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle Fastify-specific errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.name || 'Request Error',
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      })
    }

    // Generic server error
    return reply.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    })
  })

  // Health check route with system information
  app.get('/health', async (request, reply) => {
    const memUsage = process.memoryUsage()

    return reply.status(200).send({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      version: process.version,
    })
  })

  // API status route
  app.get('/api/status', async (request, reply) => {
    return reply.send({
      success: true,
      service: 'PcAnalys API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    })
  })

  return app
}

// Export the fastify instance factory
export default createFastifyInstance

// Export types for TypeScript support
export type FastifyInstance = ReturnType<typeof createFastifyInstance>
