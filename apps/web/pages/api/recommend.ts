
import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@pcanalys/database';
import { GroqClient } from '@pcanalys/lib';
import { z } from 'zod';

const RecommendRequestSchema = z.object({
  analysisId: z.string().uuid(),
  profile: z.enum(['gaming', 'work', 'content-creation', 'general']),
});

type ProfileWeights = {
  [K in 'gaming' | 'work' | 'content-creation' | 'general']: {
    cpu: number;
    gpu: number;
    ram: number;
  };
};

// Deterministic scoring algorithm
const calculatePerformanceScore = (hardware: any, profile: string): number => {
  const weights: ProfileWeights = {
    gaming: { cpu: 0.4, gpu: 0.5, ram: 0.1 },
    work: { cpu: 0.6, gpu: 0.2, ram: 0.2 },
    'content-creation': { cpu: 0.5, gpu: 0.3, ram: 0.2 },
    general: { cpu: 0.5, gpu: 0.3, ram: 0.2 },
  };

  const profileWeights = weights[profile as keyof ProfileWeights];
  if (!profileWeights) return 0;

  // Normalize hardware specs to create scores
  const cpuScore = Math.min(100, (hardware.cpu?.cores || 1) * (hardware.cpu?.frequency || 1000) / 40000);
  const gpuScore = Math.min(100, (hardware.gpu?.[0]?.memory || 1024 * 1024 * 1024) / (1024 * 1024 * 1024 * 8)); // Normalize to 8GB
  const ramScore = Math.min(100, (hardware.memory?.total || 4 * 1024 * 1024 * 1024) / (1024 * 1024 * 1024 * 16)); // Normalize to 16GB

  const score =
    cpuScore * profileWeights.cpu +
    gpuScore * profileWeights.gpu +
    ramScore * profileWeights.ram;

  return Math.min(100, Math.round(score * 100));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { analysisId, profile } = RecommendRequestSchema.parse(req.body);

    // Get analysis data from database
    const analysis = await DatabaseService.getAnalysis(analysisId);
    if (!analysis || !analysis.rawData) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Analysis not found',
        timestamp: new Date().toISOString(),
      });
    }

    const hardwareData = analysis.rawData as any;
    const performanceScore = calculatePerformanceScore(hardwareData.hardware, profile);

    // Setup streaming response headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate streaming recommendations from Groq
    const groqClient = new GroqClient();
    const stream = await groqClient.generateRecommendations(hardwareData.hardware, profile, true) as AsyncIterable<string>;
    
    let fullContent = '';
    
    try {
      for await (const chunk of stream) {
        fullContent += chunk;
        res.write(chunk);
      }

      // After streaming is complete, save recommendations to database
      const recommendations = {
        content: fullContent.trim(),
        profile,
        performanceScore,
        generatedAt: new Date().toISOString(),
      };

      await DatabaseService.updateAnalysisWithRecommendations(
        analysisId,
        recommendations,
        performanceScore,
        profile
      );

      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write('\n\nError generating recommendations. Please try again.');
      res.end();
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid request data',
        errors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }
    
    console.error('Recommendation endpoint error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') :
          'Something went wrong',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.write('\n\nAn error occurred while generating recommendations.');
      res.end();
    }
  }
}

