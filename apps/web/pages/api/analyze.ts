import type { NextApiRequest, NextApiResponse } from 'next'
import { DatabaseService } from '@pcanalys/database'
import { HardwareAnalysisRequestSchema } from '../../src/server/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' })
    return
  }

  try {
    // Supporte deux formats d'entrée:
    // 1) Payload complet conforme à HardwareAnalysisRequestSchema
    // 2) Ancien format { hardwareData: SystemInfo } provenant directement de l'agent
    let payload: any = req.body

    // Si l'agent envoie { hardwareData: {...} }, normaliser vers le schéma attendu
    if (payload && payload.hardwareData && !payload.hardware) {
      const sys = payload.hardwareData
      payload = {
        hardware: {
          cpu: {
            name: sys.cpu?.name || 'Unknown',
            cores: sys.cpu?.cores || 0,
            frequency: sys.cpu?.frequency || 0,
          },
          memory: {
            total: sys.memory?.total || 0,
            available: sys.memory?.available || 0,
            used: sys.memory?.used || 0,
          },
          storage: Array.isArray(sys.storage)
            ? sys.storage.map((d: any) => ({
                name: d.name,
                mountPoint: d.mount_point ?? d.mountPoint ?? '',
                total: d.total,
                available: d.available,
                used: d.used ?? Math.max(0, (d.total ?? 0) - (d.available ?? 0)),
                fileSystem: d.file_system ?? d.fileSystem ?? 'unknown',
                type: 'unknown',
              }))
            : [],
          gpu: Array.isArray(sys.gpu)
            ? sys.gpu.map((g: any) => ({
                name: g.name,
                vendor: g.vendor ?? 'unknown',
                memory: typeof g.memory === 'number' ? g.memory : undefined,
                driver: typeof g.driver === 'string' ? g.driver : undefined,
              }))
            : [],
        },
        software: {
          os: {
            name: sys.os?.name || 'Unknown',
            version: sys.os?.version || 'Unknown',
            arch: sys.os?.arch || 'unknown',
          },
        },
        timestamp: new Date().toISOString(),
        agentVersion: 'unknown',
      }
    }

    const normalized = HardwareAnalysisRequestSchema.parse(payload)

    const analysis = await DatabaseService.createHardwareAnalysis({
      hardware: normalized.hardware,
      software: normalized.software,
      systemMetrics: normalized.systemMetrics,
      timestamp: normalized.timestamp,
      agentVersion: normalized.agentVersion,
    })

    res.status(201).json({
      success: true,
      // Conserver id au niveau racine pour compat agent existant
      id: analysis.id,
      data: {
        id: analysis.id,
        createdAt: analysis.createdAt,
      },
      timestamp: new Date().toISOString(),
    })
    return
  } catch (error: any) {
    console.error('Error in /api/analyze:', error)

    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid hardware data format',
        details: error.errors,
        timestamp: new Date().toISOString(),
      })
      return
    }

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    })
    return
  }
}
