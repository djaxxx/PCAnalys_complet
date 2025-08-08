# PcAnalys

> Analyse PC gratuite, instantanée et intelligente

PcAnalys est une solution complète d'analyse de configuration PC qui combine un agent desktop léger avec une application web moderne pour fournir des recommandations personnalisées basées sur l'IA.

## 🚀 Architecture

Le projet utilise une architecture monorepo avec les composants suivants :

### Applications
- **Web App** (`apps/web`) - Application Next.js 14 avec Tailwind CSS et Radix UI
- **Desktop Agent** (`apps/agent`) - Agent Tauri 2.0 pour l'analyse système

### Packages Partagés
- **Database** (`packages/database`) - Prisma ORM avec Supabase
- **Shared** (`packages/shared`) - Types TypeScript et schémas Zod partagés
- **UI** (`packages/ui`) - Composants UI réutilisables (à venir)
- **ESLint Config** (`packages/eslint-config`) - Configuration ESLint partagée

## 🛠️ Stack Technologique

- **Frontend**: Next.js 14, Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Fastify sur Vercel Functions
- **Database**: Supabase (PostgreSQL) avec Prisma ORM
- **Desktop**: Tauri 2.0 (Rust + React/TypeScript)
- **State Management**: Zustand + TanStack Query
- **AI**: Groq API pour les recommandations
- **Déploiement**: Vercel + Supabase

## 🎯 Fonctionnalités

### Phase 1 - MVP (En cours)
- [x] Architecture monorepo
- [x] Configuration database avec Prisma
- [x] Application web de base avec Next.js
- [x] Types partagés et validation Zod
- [ ] Agent desktop Tauri
- [ ] API endpoints de base
- [ ] Système de recommandations

### Phase 2 - Fonctionnalités Cœur
- [ ] Moteur de recommandation IA
- [ ] Interface de rapport détaillée
- [ ] Intégration Groq API
- [ ] Base de données des composants
- [ ] Système de scoring

### Phase 3 - UX et Déploiement
- [ ] Animations avancées
- [ ] Conformité RGPD
- [ ] Tests automatisés
- [ ] CI/CD Pipeline
- [ ] Déploiement production

## 🚦 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou pnpm
- Base de données Supabase configurée

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-username/pcanalys.git
cd pcanalys

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp apps/web/.env.example apps/web/.env.local
# Éditer .env.local avec vos configurations

# Générer le client Prisma
npm run db:generate

# Démarrer en mode développement
npm run dev
```

### Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer tous les services en mode dev
npm run build        # Construire tous les packages et apps
npm run lint         # Linter tout le code
npm run type-check   # Vérification TypeScript

# Database
npm run db:push      # Synchroniser le schema avec la DB
npm run db:migrate   # Créer une nouvelle migration
npm run db:studio    # Ouvrir Prisma Studio
npm run db:seed      # Peupler la DB avec des données d'exemple
```

## 📁 Structure du Projet

```
pcanalys/
├── apps/
│   ├── web/                 # Application Next.js
│   │   ├── app/            # App Router Next.js 14
│   │   ├── components/     # Composants React
│   │   ├── lib/           # Utilitaires et providers
│   │   └── hooks/         # Hooks React personnalisés
│   └── agent/             # Agent desktop Tauri (à venir)
├── packages/
│   ├── database/          # Prisma + Supabase
│   │   ├── prisma/       # Schema et migrations
│   │   └── src/          # Client et utilitaires
│   ├── shared/           # Types et schémas partagés
│   ├── ui/               # Composants UI (à venir)
│   └── eslint-config/    # Configuration ESLint
├── turbo.json            # Configuration Turborepo
└── package.json         # Dependencies racine
```

## 🔧 Configuration

### Base de Données (Supabase)

1. Créer un projet Supabase
2. Copier les URLs et clés dans `.env.local`
3. Configurer le schema : `npm run db:push`
4. Peupler avec des données : `npm run db:seed`

### API Groq (Recommandations IA)

1. Créer un compte sur [Groq](https://groq.com)
2. Générer une clé API
3. L'ajouter dans `GROQ_API_KEY`

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙋‍♂️ Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/your-username/pcanalys/issues)
- Contact : support@pcanalys.com

---

**PcAnalys** - Analyse PC gratuite et intelligente 🚀
