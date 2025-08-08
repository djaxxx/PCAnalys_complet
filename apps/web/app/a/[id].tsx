"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Monitor, Cpu, HardDrive, MemoryStick, Zap } from "lucide-react";
import { USER_PROFILES_LABELS } from "@pcanalys/shared";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/report/${id}`);
        if (!res.ok) throw new Error("Rapport introuvable");
        const response = await res.json();
        if (response.success) {
          setReport(response.data);
          if (response.data.userProfile) {
            setSelectedProfile(response.data.userProfile);
          }
        } else {
          throw new Error(response.message || "Erreur lors du chargement du rapport");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchReport();
  }, [id]);

  const handleProfileChange = async (profile: string) => {
    setSelectedProfile(profile);
    setLoadingRecommendations(true);
    
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: id,
          userProfile: profile,
        }),
      });
      
      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let recommendationText = '';
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            recommendationText += chunk;
            setRecommendations(recommendationText);
          }
        }
      }
    } catch (e: any) {
      console.error('Erreur lors de la génération des recommandations:', e);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Chargement du rapport...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Monitor className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Erreur</p>
          </div>
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
  
  if (!report) return null;

  const hardwareData = report.hardwareData;
  const systemInfo = hardwareData?.os || hardwareData?.system;
  const cpuInfo = hardwareData?.cpu;
  const memoryInfo = hardwareData?.memory || hardwareData?.ram;
  const storageInfo = hardwareData?.storage;
  const gpuInfo = hardwareData?.gpu;

  // Données pour le graphique de performance
  const performanceData = {
    labels: ["CPU", "Mémoire", "Stockage", "GPU"],
    datasets: [
      {
        label: "Utilisation (%)",
        data: [
          cpuInfo?.frequency ? Math.min((cpuInfo.frequency / 4000) * 100, 100) : 50,
          memoryInfo?.total ? ((memoryInfo.used || (memoryInfo.total - (memoryInfo.available || 0))) / memoryInfo.total) * 100 : 50,
          storageInfo?.[0] ? ((storageInfo[0].total - storageInfo[0].available) / storageInfo[0].total) * 100 : 50,
          75, // GPU placeholder
        ],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Vue d\'ensemble des performances',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => value + '%',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rapport d'analyse PC</h1>
          <p className="text-gray-600">Analyse générée le {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graphique de performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Performance du système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={performanceData} options={chartOptions} />
              </CardContent>
            </Card>

            {/* Détails des composants */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* CPU */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Cpu className="h-4 w-4 mr-2" />
                    Processeur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{cpuInfo?.name || 'Non détecté'}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Cœurs:</span>
                    <span>{cpuInfo?.cores || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Fréquence:</span>
                    <span>{cpuInfo?.frequency ? `${cpuInfo.frequency} MHz` : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Mémoire */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <MemoryStick className="h-4 w-4 mr-2" />
                    Mémoire RAM
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total:</span>
                    <span>{memoryInfo?.total ? `${Math.round(memoryInfo.total / 1024 / 1024 / 1024)} GB` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Disponible:</span>
                    <span>{memoryInfo?.available ? `${Math.round(memoryInfo.available / 1024 / 1024 / 1024)} GB` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Utilisée:</span>
                    <span>{memoryInfo?.used ? `${Math.round(memoryInfo.used / 1024 / 1024 / 1024)} GB` : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stockage */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Stockage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {storageInfo && storageInfo.length > 0 ? (
                    storageInfo.slice(0, 2).map((storage: any, index: number) => (
                      <div key={index} className="border-b last:border-b-0 pb-2 last:pb-0">
                        <p className="font-medium text-sm">{storage.name || `Disque ${index + 1}`}</p>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Capacité:</span>
                          <span>{Math.round(storage.total / 1024 / 1024 / 1024)} GB</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Libre:</span>
                          <span>{Math.round(storage.available / 1024 / 1024 / 1024)} GB</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucun stockage détecté</p>
                  )}
                </CardContent>
              </Card>

              {/* GPU */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Monitor className="h-4 w-4 mr-2" />
                    Carte graphique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gpuInfo && gpuInfo.length > 0 ? (
                    <div>
                      <p className="font-medium">{gpuInfo[0].name || 'GPU détecté'}</p>
                      <p className="text-sm text-gray-600">{gpuInfo[0].vendor || 'Fabricant inconnu'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">GPU non détecté</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sélection du profil */}
            <Card>
              <CardHeader>
                <CardTitle>Profil d'utilisation</CardTitle>
                <CardDescription>
                  Sélectionnez votre profil pour obtenir des recommandations personnalisées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedProfile} onValueChange={handleProfileChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un profil" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_PROFILES_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Recommandations IA */}
            <Card>
              <CardHeader>
                <CardTitle>Recommandations IA</CardTitle>
                <CardDescription>
                  {selectedProfile ? `Optimisations pour ${USER_PROFILES_LABELS[selectedProfile as keyof typeof USER_PROFILES_LABELS]}` : 'Sélectionnez un profil pour voir les recommandations'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRecommendations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Génération en cours...</span>
                  </div>
                ) : recommendations ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{recommendations}</pre>
                  </div>
                ) : selectedProfile ? (
                  <p className="text-sm text-gray-500">Cliquez pour générer les recommandations</p>
                ) : (
                  <p className="text-sm text-gray-500">Sélectionnez d'abord un profil d'utilisation</p>
                )}
              </CardContent>
            </Card>

            {/* Informations système */}
            <Card>
              <CardHeader>
                <CardTitle>Système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">OS:</span>
                  <span>{systemInfo?.name || systemInfo?.os || 'Non détecté'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Version:</span>
                  <span>{systemInfo?.version || systemInfo?.osVersion || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Architecture:</span>
                  <span>{systemInfo?.arch || systemInfo?.architecture || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
