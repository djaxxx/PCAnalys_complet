import { prisma } from './index.js'

// Données d'exemple pour peupler la base de données
const sampleComponents = [
  // Processeurs
  {
    type: 'CPU',
    name: 'Intel Core i9-14900K',
    performanceScore: 95,
    avgPriceEur: 599,
    specs: {
      cores: 24,
      threads: 32,
      frequency: 3.2,
      architecture: 'x64',
      socket: 'LGA1700',
      tdp: 125,
    },
  },
  {
    type: 'CPU',
    name: 'AMD Ryzen 9 7950X',
    performanceScore: 94,
    avgPriceEur: 649,
    specs: {
      cores: 16,
      threads: 32,
      frequency: 4.5,
      architecture: 'x64',
      socket: 'AM5',
      tdp: 170,
    },
  },
  {
    type: 'CPU',
    name: 'Intel Core i5-14600K',
    performanceScore: 82,
    avgPriceEur: 329,
    specs: {
      cores: 14,
      threads: 20,
      frequency: 3.5,
      architecture: 'x64',
      socket: 'LGA1700',
      tdp: 125,
    },
  },

  // Cartes graphiques
  {
    type: 'GPU',
    name: 'NVIDIA GeForce RTX 4090',
    performanceScore: 100,
    avgPriceEur: 1699,
    specs: {
      memory: 24,
      memoryType: 'GDDR6X',
      cudaCores: 16384,
      rtCores: 128,
      tensorCores: 512,
    },
  },
  {
    type: 'GPU',
    name: 'NVIDIA GeForce RTX 4080',
    performanceScore: 85,
    avgPriceEur: 1249,
    specs: {
      memory: 16,
      memoryType: 'GDDR6X',
      cudaCores: 9728,
      rtCores: 76,
      tensorCores: 304,
    },
  },
  {
    type: 'GPU',
    name: 'AMD Radeon RX 7900 XTX',
    performanceScore: 82,
    avgPriceEur: 999,
    specs: {
      memory: 24,
      memoryType: 'GDDR6',
      streamProcessors: 6144,
      infinityCache: 96,
    },
  },

  // Mémoire RAM
  {
    type: 'RAM',
    name: 'Corsair Vengeance LPX 32GB DDR4-3200',
    performanceScore: 75,
    avgPriceEur: 89,
    specs: {
      capacity: 32,
      type: 'DDR4',
      speed: 3200,
      cas: 16,
      modules: 2,
    },
  },
  {
    type: 'RAM',
    name: 'G.Skill Trident Z5 32GB DDR5-6000',
    performanceScore: 90,
    avgPriceEur: 159,
    specs: {
      capacity: 32,
      type: 'DDR5',
      speed: 6000,
      cas: 36,
      modules: 2,
    },
  },

  // Stockage
  {
    type: 'STORAGE',
    name: 'Samsung 980 PRO 1TB NVMe',
    performanceScore: 88,
    avgPriceEur: 89,
    specs: {
      capacity: 1000,
      type: 'NVME',
      interface: 'PCIe 4.0',
      readSpeed: 7000,
      writeSpeed: 5000,
    },
  },
  {
    type: 'STORAGE',
    name: 'WD Black SN850X 2TB NVMe',
    performanceScore: 85,
    avgPriceEur: 159,
    specs: {
      capacity: 2000,
      type: 'NVME',
      interface: 'PCIe 4.0',
      readSpeed: 7300,
      writeSpeed: 6600,
    },
  },
]

async function main() {
  console.log('🌱 Début du seed de la base de données...')

  // Nettoyer les données existantes
  await prisma.component.deleteMany()
  console.log('🗑️  Données existantes supprimées')

  // Insérer les composants
  for (const component of sampleComponents) {
    await prisma.component.create({
      data: component,
    })
    console.log(`✅ Composant ajouté: ${component.name}`)
  }

  console.log(`🎉 Seed terminé ! ${sampleComponents.length} composants ajoutés.`)
}

main()
  .catch(e => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
