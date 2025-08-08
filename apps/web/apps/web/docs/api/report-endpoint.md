# GET /api/report/[id] Endpoint

This endpoint fetches analysis data and recommendations for a specific report by ID.

## Endpoint

```
GET /api/report/{id}
```

## Parameters

- `id` (path parameter, required): The unique identifier of the report (minimum 10 characters)

## Responses

### Success (200 OK)

Returns the report data serialized with superjson to properly handle Date objects and complex types.

```json
{
  "success": true,
  "timestamp": "2025-01-08T20:47:35.123Z",
  "data": {
    "json": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "rawData": {
        "hardware": {
          "cpu": { "name": "Intel Core i7-12700K", "cores": 12, "frequency": 3600 },
          "memory": { "total": 17179869184, "available": 8589934592, "used": 8589934592 }
        },
        "software": {
          "os": { "name": "Windows", "version": "11", "arch": "x64" }
        }
      },
      "profile": "gaming",
      "score": 85,
      "recommendations": [
        {
          "type": "upgrade",
          "component": "gpu",
          "description": "Consider upgrading your GPU for better performance"
        }
      ],
      "performanceScore": 85,
      "userProfile": "gaming",
      "hardwareData": null,
      "createdAt": "2025-01-08T10:35:00.000Z"
    },
    "meta": {
      "values": {
        "createdAt": ["Date"]
      }
    }
  }
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Report with ID 'non-existent-id' not found",
  "statusCode": 404,
  "timestamp": "2025-01-08T20:47:35.123Z"
}
```

### Bad Request (400)

```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid report ID format",
  "statusCode": 400,
  "timestamp": "2025-01-08T20:47:35.123Z"
}
```

### Internal Server Error (500)

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong",
  "statusCode": 500,
  "timestamp": "2025-01-08T20:47:35.123Z"
}
```

## Features

1. **Prisma Integration**: Fetches data from the database using the `DatabaseService.getAnalysis()` method
2. **Superjson Serialization**: Safely handles Date objects and other complex types that JSON.stringify cannot handle
3. **Error Handling**: Proper HTTP status codes and error responses for various failure scenarios
4. **Backward Compatibility**: Handles both old and new field names in the database schema
5. **Validation**: Basic ID format validation to prevent invalid requests

## Example Usage

### JavaScript/TypeScript with fetch

```javascript
import superjson from 'superjson';

async function fetchReport(reportId) {
  try {
    const response = await fetch(`/api/report/${reportId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    
    // Deserialize the data to restore Date objects and other complex types
    const reportData = superjson.deserialize(result.data);
    
    console.log('Report created at:', reportData.createdAt); // This is a proper Date object
    return reportData;
  } catch (error) {
    console.error('Failed to fetch report:', error.message);
  }
}

// Usage
fetchReport('550e8400-e29b-41d4-a716-446655440000');
```

### Using with React Query

```javascript
import { useQuery } from '@tanstack/react-query';
import superjson from 'superjson';

function useReport(reportId) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const response = await fetch(`/api/report/${reportId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }
      const result = await response.json();
      return superjson.deserialize(result.data);
    },
    enabled: !!reportId,
  });
}
```

## Database Schema Compatibility

The endpoint handles both old and new field names in the Analysis model:

- `profile` (old) / `userProfile` (new)
- `score` (old) / `performanceScore` (new)
- `rawData` (primary) / `hardwareData` (backup)

## Testing

Run the comprehensive test suite:

```bash
cd apps/web
pnpm test src/test/api/report.test.ts
```

The tests cover:
- Successful data retrieval
- 404 handling for non-existent IDs
- 400 handling for invalid ID formats
- Database error handling
- Field name compatibility
- Superjson serialization verification
