"use client";

import { motion } from "framer-motion";
import { Computer, Zap, Shield, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const handleDownloadAgent = () => {
    // TODO: Lien vers le téléchargement de l'agent
    window.open("#", "_blank");
  };

  const features = [
    {
      icon: Computer,
      title: "Analyse Complète",
      description: "Scanne automatiquement tous vos composants pour une vue d'ensemble détaillée.",
    },
    {
      icon: Zap,
      title: "Recommandations IA",
      description: "Suggestions personnalisées basées sur votre profil d'utilisation et votre budget.",
    },
    {
      icon: Shield,
      title: "Sécurisé & Privé",
      description: "Aucune donnée sensible n'est stockée. Agent léger et respectueux de votre vie privée.",
    },
    {
      icon: TrendingUp,
      title: "Score de Performance",
      description: "Évaluation instantanée de votre configuration avec des métriques claires.",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Téléchargez l'Agent",
      description: "Un petit exécutable (<10MB) pour analyser votre PC en toute sécurité.",
    },
    {
      step: 2,
      title: "Lancez l'Analyse",
      description: "Un clic et l'analyse se lance automatiquement en arrière-plan.",
    },
    {
      step: 3,
      title: "Consultez vos Résultats",
      description: "Rapport détaillé avec recommandations personnalisées dans votre navigateur.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Computer className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">PcAnalys</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                Comment ça marche
              </a>
              <Button variant="outline" size="sm">
                Se connecter
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Analyse PC{" "}
              <span className="text-yellow-300">Gratuite</span> et{" "}
              <span className="text-yellow-300">Intelligente</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Découvrez la vraie performance de votre PC et obtenez des recommandations personnalisées
              pour optimiser votre configuration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={handleDownloadAgent}
              >
                <Download className="mr-2 h-5 w-5" />
                Télécharger l'Agent
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Voir un exemple de rapport
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir PcAnalys ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Notre solution combine simplicité, sécurité et intelligence artificielle
              pour vous offrir la meilleure analyse PC.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full glass-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trois étapes simples pour obtenir une analyse complète de votre PC.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button size="lg" onClick={handleDownloadAgent}>
              <Download className="mr-2 h-5 w-5" />
              Commencer maintenant
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Computer className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">PcAnalys</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 PcAnalys. Analyse PC gratuite et intelligente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
