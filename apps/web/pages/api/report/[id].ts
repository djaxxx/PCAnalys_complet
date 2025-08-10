import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@pcanalys/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Analysis ID is required',
        timestamp: new Date().toISOString()
      });
    }

    // Récupérer l'analyse depuis la base de données
    const analysis = await DatabaseService.getAnalysis(id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Analysis not found',
        timestamp: new Date().toISOString()
      });
    }

    // Retourner les données de l'analyse
    return res.status(200).json({
      success: true,
      data: {
        id: analysis.id,
        createdAt: analysis.createdAt,
        hardwareData: analysis.hardwareData,
        userProfile: analysis.userProfile,
        recommendations: analysis.recommendations
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error in /api/report/[id]:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}
