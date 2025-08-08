import { PrismaClient } from "@prisma/client";

// Instance globale du client Prisma
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern pour éviter les multiples connexions
export const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

// Export des types Prisma
export type { Analysis, Component, AnalysisStats } from "@prisma/client";

// Utilitaires de base pour les opérations courantes
export class DatabaseService {
  static async createAnalysis(hardwareData: unknown) {
    return await prisma.analysis.create({
      data: {
        hardwareData: hardwareData as any,
      },
    });
  }

  // New method to create analysis from Tauri agent data
  static async createHardwareAnalysis(data: {
    hardware: any;
    software: any;
    systemMetrics?: any;
    timestamp?: string;
    agentVersion?: string;
  }) {
    return await prisma.analysis.create({
      data: {
        hardwareData: data,
        createdAt: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });
  }

  static async getAnalysis(id: string) {
    return await prisma.analysis.findUnique({
      where: { id },
    });
  }

  static async updateAnalysisWithRecommendations(
    id: string, 
    recommendations: unknown, 
    performanceScore?: number,
    userProfile?: string
  ) {
    return await prisma.analysis.update({
      where: { id },
      data: {
        recommendations: recommendations as any,
        ...(userProfile && { userProfile }),
      },
    });
  }

  static async getComponentsByType(type: string) {
    return await prisma.component.findMany({
      where: { type: type.toUpperCase() },
      orderBy: { performanceScore: "desc" },
    });
  }

  static async findComponentByName(name: string) {
    return await prisma.component.findUnique({
      where: { name },
    });
  }

  static async getTopComponents(type: string, limit = 10) {
    return await prisma.component.findMany({
      where: { type: type.toUpperCase() },
      orderBy: { performanceScore: "desc" },
      take: limit,
    });
  }

  // Statistiques pour les analyses
  static async getAnalysisStats(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalAnalyses = await prisma.analysis.count({
      where: {
        createdAt: { gte: since },
      },
    });

    // Note: performanceScore removed from schema, using recommendations count instead
    const analysesWithRecommendations = await prisma.analysis.count({
      where: {
        createdAt: { gte: since },
        recommendations: { not: null },
      },
    });

    return {
      totalAnalyses,
      analysesWithRecommendations,
      completionRate: totalAnalyses > 0 ? (analysesWithRecommendations / totalAnalyses) * 100 : 0,
    };
  }
}
