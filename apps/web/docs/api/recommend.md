# POST /api/recommend

## Overview

The `/api/recommend` endpoint generates AI-powered performance recommendations for a specific hardware analysis using the Groq API. It implements a deterministic scoring algorithm, streams responses for progressive UI updates, and persists the recommendations to the database.

## Request

### Method

`POST`

### Headers

```http
Content-Type: application/json
```

### Body Parameters

| Parameter    | Type     | Required | Description                                                       |
| ------------ | -------- | -------- | ----------------------------------------------------------------- |
| `analysisId` | `string` | Yes      | UUID of the hardware analysis to generate recommendations for     |
| `profile`    | `enum`   | Yes      | Usage profile: `gaming`, `work`, `content-creation`, or `general` |

### Example Request Body

```json
{
  "analysisId": "12345678-1234-1234-1234-123456789012",
  "profile": "gaming"
}
```

## Response

### Success Response (Streaming)

The endpoint streams the AI-generated recommendations as plain text in real-time.

**Status Code:** `200 OK`

**Headers:**

```http
Content-Type: text/plain; charset=utf-8
Transfer-Encoding: chunked
Cache-Control: no-cache
Connection: keep-alive
```

**Body:** Stream of text chunks containing the AI-generated recommendations.

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid request data",
  "errors": [
    {
      "code": "invalid_string",
      "expected": "uuid",
      "received": "invalid-uuid",
      "path": ["analysisId"],
      "message": "Invalid uuid"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Analysis not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Algorithm Details

### Deterministic Scoring Algorithm

The endpoint calculates a performance score based on weighted hardware specifications:

| Profile          | CPU Weight | GPU Weight | RAM Weight |
| ---------------- | ---------- | ---------- | ---------- |
| Gaming           | 0.4        | 0.5        | 0.1        |
| Work             | 0.6        | 0.2        | 0.2        |
| Content Creation | 0.5        | 0.3        | 0.2        |
| General          | 0.5        | 0.3        | 0.2        |

**Score Calculation:**

- **CPU Score:** `(cores × frequency) / 40000`
- **GPU Score:** `gpu_memory_bytes / (8GB in bytes)`
- **RAM Score:** `ram_total_bytes / (16GB in bytes)`

**Final Score:** `min(100, round((cpuScore × cpuWeight + gpuScore × gpuWeight + ramScore × ramWeight) × 100))`

### AI Processing

1. **Context Generation:** Creates a detailed system information prompt including:
   - CPU specifications (name, cores, frequency)
   - Memory information (total capacity)
   - Storage details (capacity and type)
   - GPU information (name and memory)

2. **Profile-Specific Prompting:** Tailors the AI prompt based on the user profile:
   - Gaming: Focus on gaming performance optimization
   - Work: Emphasis on productivity and multitasking
   - Content Creation: Optimizations for media production workflows
   - General: Balanced recommendations for everyday use

3. **Streaming Generation:** Uses Groq's streaming API to provide real-time response chunks

## Database Operations

### Data Retrieval

- Fetches analysis data using `DatabaseService.getAnalysis(analysisId)`
- Validates that the analysis exists and contains hardware data

### Data Persistence

After streaming is complete, saves recommendations using `DatabaseService.updateAnalysisWithRecommendations()`:

```javascript
{
  content: "Full generated content",
  profile: "gaming",
  performanceScore: 85,
  generatedAt: "2024-01-15T10:30:00.000Z"
}
```

## Usage Example

### JavaScript/Node.js

```javascript
async function getRecommendations(analysisId, profile) {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysisId,
      profile,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let recommendations = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    recommendations += chunk
    console.log('Received chunk:', chunk)
  }

  return recommendations
}
```

### React Component with Streaming

```jsx
import React, { useState } from 'react'

function RecommendationComponent({ analysisId, profile }) {
  const [recommendations, setRecommendations] = useState('')
  const [loading, setLoading] = useState(false)

  const generateRecommendations = async () => {
    setLoading(true)
    setRecommendations('')

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, profile }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        setRecommendations(prev => prev + chunk)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={generateRecommendations} disabled={loading}>
        {loading ? 'Generating...' : 'Get Recommendations'}
      </button>
      <div style={{ whiteSpace: 'pre-wrap' }}>{recommendations}</div>
    </div>
  )
}
```

## Security Considerations

1. **Input Validation:** All inputs are validated using Zod schemas
2. **UUID Validation:** Analysis IDs must be valid UUIDs
3. **Profile Validation:** Only predefined profiles are accepted
4. **Rate Limiting:** Consider implementing rate limiting for production
5. **Authentication:** Add authentication/authorization as needed

## Performance Considerations

1. **Streaming:** Provides immediate feedback to users
2. **Database Efficiency:** Single query to fetch analysis data
3. **Error Handling:** Graceful handling of streaming errors
4. **Memory Management:** Streams prevent memory buildup for large responses

## Testing

Run the test suite:

```bash
npm test tests/api/recommend.test.ts
```

The test suite covers:

- Request method validation
- Input validation
- Error handling
- Database interaction
- Streaming functionality
