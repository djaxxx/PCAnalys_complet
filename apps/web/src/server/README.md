# PcAnalys Fastify API Server

This directory contains the Fastify server implementation integrated with Next.js API routes for the PcAnalys application.

## Architecture

The API is built using:
- **Fastify**: High-performance web framework for Node.js
- **Zod**: Schema validation and type safety
- **CORS**: Configured for Tauri desktop app integration
- **Next.js API Routes**: Using Pages Router pattern with catch-all routes

## Files Structure

```
src/server/
├── fastify.ts      # Main Fastify instance configuration
├── schemas.ts      # Zod validation schemas for API
└── README.md       # This documentation

pages/api/
└── [...path].ts    # Catch-all API route handler
```

## Features

### Core Setup
- ✅ Fastify instance with logging and error handling
- ✅ CORS configuration for Tauri origins (`tauri://`, `tauri://localhost`)
- ✅ Comprehensive Zod schema validation
- ✅ TypeScript support with proper type definitions
- ✅ Request/response logging and monitoring
- ✅ Standardized error handling and responses

### API Endpoints

#### Health & Status
- `GET /health` - Server health check with system metrics
- `GET /api/status` - API service status and version

#### User Management
- `POST /api/user/profile` - Create/update user profile

#### System Analysis
- `POST /api/system/analyze` - Analyze PC component performance
- `GET /api/benchmarks/:componentType` - Get benchmark comparisons
- `POST /api/benchmarks` - Submit benchmark data

#### AI Recommendations
- `POST /api/recommendations` - Get AI-powered upgrade recommendations

## Quick Usage Guide

## Endpoints
- `POST /api/analyze` : Crée une analyse à partir des données hardware
- `GET /api/report/[id]` : Récupère le rapport d’analyse
- `POST /api/recommend` : Génère et met à jour les recommandations

## Validation
- Utilisation de Zod pour tous les schémas d’entrée

## Persistance
- Prisma ORM connecté à Supabase

## IA
- Intégration Groq API pour les recommandations

## Sécurité
- Rate limiting, en-têtes CSP/HSTS

## Déploiement
- Compatible Vercel Functions

## Tests
- Vitest pour la validation des endpoints

## Schemas

The API uses comprehensive Zod schemas for validation:

- `UserProfileSchema` - User account and preferences
- `SystemAnalysisRequestSchema` - PC component analysis requests
- `RecommendationRequestSchema` - AI recommendation parameters
- `BenchmarkDataSchema` - Performance benchmark data

## CORS Configuration

Configured origins for seamless integration:
- `http://localhost:3000` - Next.js development
- `http://localhost:1420` - Tauri development server
- `tauri://localhost` - Tauri production
- Custom regex for Tauri protocols: `/^tauri:\/\/.*$/`

## Error Handling

Comprehensive error handling with:
- Validation errors (400 with detailed field information)
- Server errors (500 with development/production message filtering)
- Structured error responses with timestamps and status codes
- Request logging for debugging

## Environment Variables

Optional configuration:
- `ALLOWED_ORIGINS` - Comma-separated list of additional allowed origins
- `NODE_ENV` - Controls logging level and error detail exposure

## Usage Examples

### System Analysis
```typescript
const response = await fetch('/api/system/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    component: 'gpu',
    details: {
      name: 'RTX 3070',
      manufacturer: 'NVIDIA',
      specifications: { vram: '8GB', cores: 5888 }
    }
  })
});
```

### Get Recommendations
```typescript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    systemSpecs: { /* component details */ },
    usage: 'gaming',
    priority: ['performance', 'budget']
  })
});
```

## Integration with Tauri

The API is designed to work seamlessly with the Tauri desktop application:
- CORS headers allow Tauri WebView requests
- Optimized for local development with Tauri dev server
- Support for Tauri's custom protocol schemes

## Performance Features

- Request/response time tracking
- Memory usage monitoring in health checks
- Optimized JSON parsing and response handling
- Request logging for performance analysis

## Development

The server automatically reloads with Next.js development server:
```bash
cd apps/web
npm run dev
```

API endpoints are available at:
- Development: `http://localhost:3000/api/*`
- Tauri app: `tauri://localhost/api/*` (when running in Tauri)

## Future Enhancements

- [ ] Database integration with Prisma ORM
- [ ] Authentication middleware
- [ ] Rate limiting
- [ ] Caching layer
- [ ] WebSocket support for real-time updates
- [ ] OpenAPI documentation generation
