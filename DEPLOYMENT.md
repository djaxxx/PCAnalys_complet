# 🚀 Guide de Déploiement PcAnalys

Ce guide détaille les étapes pour déployer l'application PcAnalys en production.

## 📋 Prérequis

### Services Externes
- **Vercel** : Hébergement frontend et API
- **Supabase** : Base de données PostgreSQL
- **Groq** : API d'intelligence artificielle
- **GitHub** : Repository et CI/CD

### Variables d'Environnement

#### Web Application (.env.local)
```bash
# Base de données Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# API Groq pour l'IA
GROQ_API_KEY="gsk_..."

# Configuration Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Vercel (optionnel)
VERCEL_URL="your-domain.vercel.app"
```

#### Secrets GitHub Actions
```bash
# Vercel
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-org-id"
VERCEL_PROJECT_ID="your-project-id"

# Automatique
GITHUB_TOKEN # (fourni automatiquement)
```

## 🌐 Déploiement Web (Vercel)

### 1. Configuration Vercel
```bash
# Installation CLI Vercel
npm i -g vercel

# Connexion
vercel login

# Configuration du projet
cd apps/web
vercel

# Déploiement
vercel --prod
```

### 2. Configuration Base de Données
```bash
# Migration Prisma
cd packages/database
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 3. Variables d'Environnement Vercel
- Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
- Sélectionner le projet
- Settings → Environment Variables
- Ajouter toutes les variables listées ci-dessus

## 🖥️ Build Agent Desktop (Tauri)

### 1. Prérequis Système

#### Windows
```powershell
# Installer Rust
winget install Rustlang.Rustup

# Redémarrer le terminal puis :
rustup default stable
```

#### macOS
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Installer Xcode Command Line Tools
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Dépendances système
sudo apt update
sudo apt install -y \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    libappindicator3-dev \
    librsvg2-dev \
    patchelf
```

### 2. Build Local
```bash
# Aller dans le dossier agent
cd apps/agent

# Build de développement
pnpm tauri dev

# Build de production
pnpm tauri build
```

### 3. Distribution
Les binaires sont générés dans :
- Windows : `src-tauri/target/release/bundle/msi/`
- macOS : `src-tauri/target/release/bundle/dmg/`
- Linux : `src-tauri/target/release/bundle/deb/` et `bundle/appimage/`

## 🔄 CI/CD Automatique

### GitHub Actions
Le pipeline CI/CD se déclenche automatiquement sur :
- **Push** sur `main` ou `develop`
- **Pull Request** vers `main`

### Workflow
1. **Lint & Test** : Vérification du code
2. **Build Agent** : Compilation multi-plateforme
3. **Deploy Web** : Déploiement Vercel
4. **Release** : Création automatique des releases

### Release
Pour créer une release :
```bash
git commit -m "feat: nouvelle fonctionnalité [release]"
git push origin main
```

## 🔧 Configuration Production

### 1. Sécurité
- [ ] Configurer CSP strict
- [ ] Activer HSTS
- [ ] Vérifier les CORS
- [ ] Audit sécurité des dépendances

### 2. Performance
- [ ] Optimiser les images
- [ ] Configurer le cache
- [ ] Monitoring des performances
- [ ] CDN pour les assets statiques

### 3. Monitoring
- [ ] Logs d'erreur (Sentry)
- [ ] Analytics (Vercel Analytics)
- [ ] Monitoring uptime
- [ ] Alertes de performance

## 📊 Métriques de Succès

### KPIs Techniques
- Temps de chargement < 2s
- Uptime > 99.9%
- Taille agent < 10MB
- Score Lighthouse > 90

### KPIs Business
- Analyses par jour
- Taux de conversion agent → web
- Satisfaction utilisateur
- Temps moyen d'analyse

## 🆘 Dépannage

### Erreurs Communes

#### Build Tauri
```bash
# Erreur de compilation Rust
cargo clean
cargo build

# Erreur de dépendances système
# Voir section "Prérequis Système"
```

#### Déploiement Vercel
```bash
# Erreur de build
vercel logs

# Variables d'environnement manquantes
vercel env ls
```

#### Base de Données
```bash
# Erreur de migration
npx prisma migrate reset
npx prisma migrate dev

# Erreur de connexion
npx prisma studio # Test de connexion
```

## 📞 Support

- **Documentation** : [README.md](./README.md)
- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions
- **Email** : support@pcanalys.com

---

**Version** : 1.0.0  
**Dernière mise à jour** : $(date +'%Y-%m-%d')  
**Équipe** : PcAnalys Team
