import { z } from "zod";

// === Schémas de validation Zod ===

// Données matérielles collectées par l'agent
export const HardwareDataSchema = z.object({
  cpu: z.object({
    name: z.string(),
    cores: z.number(),
    threads: z.number(),
    frequency: z.number(), // GHz
    architecture: z.string(),
  }),
  gpu: z.object({
    name: z.string(),
    memory: z.number(), // Go
    driver: z.string().optional(),
  }),
  ram: z.object({
    totalMemory: z.number(), // Go
    availableMemory: z.number(), // Go
    speed: z.number().optional(), // MHz
    type: z.string().optional(), // DDR4, DDR5, etc.
  }),
  storage: z.array(z.object({
    name: z.string(),
    type: z.enum(["HDD", "SSD", "NVME"]),
    capacity: z.number(), // Go
    freeSpace: z.number(), // Go
  })),
  motherboard: z.object({
    name: z.string(),
    chipset: z.string().optional(),
  }),
  system: z.object({
    os: z.string(),
    osVersion: z.string(),
    architecture: z.string(),
  }),
});

// Profils d'usage
export const UserProfileSchema = z.enum([
  "gaming",
  "productivity",
  "content_creation",
  "development",
  "office",
  "student"
]);

// Recommandations générées
export const RecommendationSchema = z.object({
  type: z.enum(["upgrade", "optimize", "info"]),
  component: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  estimatedCost: z.number().optional(),
  affiliateLink: z.string().url().optional(),
  performanceGain: z.number().optional(), // pourcentage
});

// Analyse complète
export const AnalysisSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  hardwareData: HardwareDataSchema,
  userProfile: UserProfileSchema.optional(),
  recommendations: z.array(RecommendationSchema).optional(),
  performanceScore: z.number().min(0).max(100).optional(),
});

// Composant de la base de données
export const ComponentSchema = z.object({
  id: z.string().cuid(),
  type: z.enum(["CPU", "GPU", "RAM", "STORAGE", "MOTHERBOARD"]),
  name: z.string(),
  specs: z.record(z.any()), // JSON flexible pour les spécifications
  performanceScore: z.number().min(0).max(100),
  avgPriceEur: z.number().optional(),
  affiliateLink: z.string().url().optional(),
});

// === Types TypeScript inférés ===

export type HardwareData = z.infer<typeof HardwareDataSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type Component = z.infer<typeof ComponentSchema>;

// === API Endpoints ===

// Request/Response pour l'analyse
export const CreateAnalysisRequestSchema = z.object({
  hardwareData: HardwareDataSchema,
});

export const CreateAnalysisResponseSchema = z.object({
  analysisId: z.string().cuid(),
  reportUrl: z.string().url(),
});

// Request/Response pour les recommandations
export const GenerateRecommendationsRequestSchema = z.object({
  analysisId: z.string().cuid(),
  userProfile: UserProfileSchema,
});

export const GenerateRecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
  performanceScore: z.number().min(0).max(100),
});

// Types pour les API
export type CreateAnalysisRequest = z.infer<typeof CreateAnalysisRequestSchema>;
export type CreateAnalysisResponse = z.infer<typeof CreateAnalysisResponseSchema>;
export type GenerateRecommendationsRequest = z.infer<typeof GenerateRecommendationsRequestSchema>;
export type GenerateRecommendationsResponse = z.infer<typeof GenerateRecommendationsResponseSchema>;

// === Constantes ===

export const USER_PROFILES_LABELS: Record<UserProfile, string> = {
  gaming: "Gaming / Jeu",
  productivity: "Productivité",
  content_creation: "Création de contenu",
  development: "Développement",
  office: "Bureautique",
  student: "Étudiant",
};

export const RECOMMENDATION_PRIORITIES_LABELS: Record<Recommendation["priority"], string> = {
  low: "Faible",
  medium: "Moyenne", 
  high: "Élevée",
};

export const COMPONENT_TYPES_LABELS: Record<Component["type"], string> = {
  CPU: "Processeur",
  GPU: "Carte graphique",
  RAM: "Mémoire RAM",
  STORAGE: "Stockage",
  MOTHERBOARD: "Carte mère",
};
