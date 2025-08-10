# POST /api/analyze

The `/api/analyze` endpoint accepts hardware and software information from the Tauri desktop agent and stores it in the database for analysis.

## Request

### Method

`POST`

### URL

`/api/analyze`

### Headers

- `Content-Type: application/json`

### Request Body Schema

```typescript
interface AnalyzeRequest {
  hardware: {
    cpu: {
      name: string
      cores: number
      frequency: number // MHz
      architecture?: string
      manufacturer?: string
    }
    memory: {
      total: number // bytes
      available: number // bytes
      used: number // bytes
      speed?: number // MHz
    }
    storage: Array<{
      name: string
      mountPoint: string
      total: number // bytes
      available: number // bytes
      used: number // bytes
      fileSystem: string
      type?: 'SSD' | 'HDD' | 'NVME' | 'unknown'
    }>
    gpu: Array<{
      name: string
      vendor: string
      memory?: number // bytes
      driver?: string
    }>
  }
  software: {
    os: {
      name: string
      version: string
      arch: string
      build?: string
    }
    installedSoftware?: Array<{
      name: string
      version?: string
      publisher?: string
    }>
  }
  systemMetrics?: {
    cpuUsage?: number // 0-100
    memoryUsage?: number // 0-100
    temperature?: {
      cpu?: number
      gpu?: number
    }
    bootTime?: string // ISO datetime string
  }
  timestamp?: string // ISO datetime string
  agentVersion?: string
}
```

### Example Request

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "hardware": {
      "cpu": {
        "name": "Intel Core i7-12700K",
        "cores": 12,
        "frequency": 3600,
        "architecture": "x64",
        "manufacturer": "Intel"
      },
      "memory": {
        "total": 17179869184,
        "available": 8589934592,
        "used": 8589934592,
        "speed": 3200
      },
      "storage": [
        {
          "name": "Samsung 980 Pro",
          "mountPoint": "C:",
          "total": 1099511627776,
          "available": 549755813888,
          "used": 549755813888,
          "fileSystem": "NTFS",
          "type": "NVME"
        }
      ],
      "gpu": [
        {
          "name": "NVIDIA GeForce RTX 3080",
          "vendor": "NVIDIA",
          "memory": 10737418240,
          "driver": "551.86"
        }
      ]
    },
    "software": {
      "os": {
        "name": "Windows",
        "version": "11",
        "arch": "x64",
        "build": "22631"
      },
      "installedSoftware": [
        {
          "name": "Visual Studio Code",
          "version": "1.85.0",
          "publisher": "Microsoft Corporation"
        }
      ]
    },
    "systemMetrics": {
      "cpuUsage": 15.5,
      "memoryUsage": 65.2,
      "temperature": {
        "cpu": 42,
        "gpu": 35
      },
      "bootTime": "2025-01-08T10:30:00.000Z"
    },
    "timestamp": "2025-01-08T10:35:00.000Z",
    "agentVersion": "1.0.0"
  }'
```

## Response

### Success Response (201 Created)

```typescript
interface AnalyzeResponse {
  success: true
  timestamp: string // ISO datetime string
  data: {
    id: string // UUID of the created analysis
    createdAt: string // ISO datetime string
  }
}
```

### Example Success Response

```json
{
  "success": true,
  "timestamp": "2025-01-08T10:35:15.123Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-08T10:35:15.123Z"
  }
}
```

### Error Response (400 Bad Request)

```typescript
interface ErrorResponse {
  success: false
  error: string
  message: string
  statusCode: 400
  timestamp: string
  details?: Array<{
    path: string[]
    message: string
    code: string
  }>
}
```

### Example Validation Error Response

```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Validation error: hardware.cpu.name: String must contain at least 1 character(s)",
  "statusCode": 400,
  "timestamp": "2025-01-08T10:35:15.123Z"
}
```

### Server Error Response (500)

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong",
  "statusCode": 500,
  "timestamp": "2025-01-08T10:35:15.123Z"
}
```

## Validation Rules

### Required Fields

- `hardware.cpu.name` (string, min length: 1)
- `hardware.cpu.cores` (number)
- `hardware.cpu.frequency` (number)
- `hardware.memory.total` (number)
- `hardware.memory.available` (number)
- `hardware.memory.used` (number)
- `hardware.storage` (array)
- `hardware.gpu` (array)
- `software.os.name` (string)
- `software.os.version` (string)
- `software.os.arch` (string)

### Optional Fields

- All fields marked with `?` in the schema are optional
- Empty arrays are allowed for `storage` and `gpu`
- `systemMetrics` object is entirely optional

### Constraints

- `systemMetrics.cpuUsage`: 0-100
- `systemMetrics.memoryUsage`: 0-100
- `timestamp`: Valid ISO datetime string
- `hardware.storage[].type`: Must be one of "SSD", "HDD", "NVME", "unknown"

## CORS Support

The endpoint includes full CORS support for Tauri applications with the following origins allowed:

- `tauri://localhost`
- `https://tauri.localhost`
- `http://localhost:1420` (Tauri dev server)
- Development origins (localhost:3000)

## Database Storage

The analysis data is stored in the PostgreSQL database using Prisma ORM. The full request payload is stored as JSON in the `rawData` field of the `Analysis` table, along with metadata like creation timestamp.

## Error Handling

The endpoint includes comprehensive error handling for:

- Invalid JSON payloads
- Schema validation errors (using Zod)
- Database connection errors
- Unexpected server errors

All errors return appropriate HTTP status codes and structured error responses with detailed validation information when applicable.

## Testing

Unit tests are available in `src/test/api/analyze.test.ts` and integration tests in `src/test/api/analyze.integration.test.ts`. Run tests with:

```bash
npm run test
# or
npm run test:watch
```
