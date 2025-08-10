import { Prisma, PrismaClient } from '@prisma/client'

// Instance globale du client Prisma (agnostique env)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// Singleton pattern pour éviter les multiples connexions
export const prisma =
  (globalThis as unknown as { __prisma?: PrismaClient }).__prisma || new PrismaClient()

const isProd = (() => {
  try {
    return (
      ((globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env
        ?.NODE_ENV ?? 'production') === 'production'
    )
  } catch {
    return true
  }
})()

if (!isProd) {
  ;(globalThis as unknown as { __prisma?: PrismaClient }).__prisma = prisma
}

// Note: On n'exporte pas explicitement les types de modèle ici pour éviter une dépendance
// au client généré lors des checks sans Prisma generate.

// Utilitaires de base pour les opérations courantes
export class DatabaseService {
  static async createAnalysis(hardwareData: unknown) {
    return await prisma.analysis.create({
      data: {
        hardwareData: hardwareData as unknown as Prisma.AnalysisCreateInput['hardwareData'],
      },
    })
  }

  // New method to create analysis from Tauri agent data
  static async createHardwareAnalysis(data: {
    hardware: unknown
    software: unknown
    systemMetrics?: unknown
    timestamp?: string
    agentVersion?: string
  }) {
    return await prisma.analysis.create({
      data: {
        hardwareData: data as unknown as Prisma.AnalysisCreateInput['hardwareData'],
        createdAt: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    })
  }

  static async getAnalysis(id: string) {
    return await prisma.analysis.findUnique({
      where: { id },
    })
  }

  static async updateAnalysisWithRecommendations(
    id: string,
    recommendations: unknown,
    performanceScore?: number,
    userProfile?: string,
  ) {
    return await prisma.analysis.update({
      where: { id },
      data: {
        recommendations:
          recommendations as unknown as Prisma.AnalysisUpdateInput['recommendations'],
        ...(userProfile && { userProfile }),
      },
    })
  }

  static async getComponentsByType(type: string) {
    return await prisma.component.findMany({
      where: { type: type.toUpperCase() },
      orderBy: { performanceScore: 'desc' },
    })
  }

  static async findComponentByName(name: string) {
    return await prisma.component.findUnique({
      where: { name },
    })
  }

  static async getTopComponents(type: string, limit = 10) {
    return await prisma.component.findMany({
      where: { type: type.toUpperCase() },
      orderBy: { performanceScore: 'desc' },
      take: limit,
    })
  }

  // Statistiques pour les analyses
  static async getAnalysisStats(days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const totalAnalyses = await prisma.analysis.count({
      where: {
        createdAt: { gte: since },
      },
    })

    const analysesWithRecommendations = await prisma.analysis.count({
      where: {
        createdAt: { gte: since },
        recommendations: { not: Prisma.AnyNull },
      },
    })

    return {
      totalAnalyses,
      analysesWithRecommendations,
      completionRate: totalAnalyses > 0 ? (analysesWithRecommendations / totalAnalyses) * 100 : 0,
    }
  }
}
