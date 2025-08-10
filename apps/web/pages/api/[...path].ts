import type { NextApiRequest, NextApiResponse } from 'next';

// Simple API handler without Fastify
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Catch-all returns 404 to let specific routes handle their logic
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'Endpoint does not exist',
    timestamp: new Date().toISOString(),
  });
}
