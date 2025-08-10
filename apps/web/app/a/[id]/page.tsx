"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Monitor, Cpu, HardDrive, MemoryStick } from "lucide-react";
import { USER_PROFILES_LABELS } from "@pcanalys/shared";

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
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

  // Map UI profile keys to API schema keys
  const profileMap: Record<string, string> = {
    gaming: 'gaming',
    productivity: 'work',
    content_creation: 'content-creation',
    development: 'general',
    office: 'general',
    student: 'general',
  };

  const handleProfileChange = async (profile: string) => {
    setSelectedProfile(profile);
    setLoadingRecommendations(true);
    setRecommendations(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: report.id,
          profile: profileMap[profile] ?? 'general',
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la génération des recommandations');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Impossible de lire la réponse');

      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedText += chunk;
        setRecommendations(accumulatedText);
      }
    } catch (e: any) {
      console.error('Erreur recommandations:', e);
      setRecommendations('Erreur lors de la génération des recommandations: ' + e.message);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Erreur!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Aucun rapport trouvé</p>
        </div>
      </div>
    );
  }

  // Supporte les deux formats et normalise la structure
  const createdAt = report.createdAt;
  const rawData = report.hardwareData ?? report.rawData ?? {};
  const hardware = rawData.hardware ?? rawData;

  // Normalisation défensive
  const toMB = (v: unknown) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return n > 1024 * 1024 ? Math.round(n / 1024 / 1024) : Math.round(n);
  };
  const cpuFreqMHz = Number(hardware?.cpu?.frequency) || 0;
  const cpuCores = Number(hardware?.cpu?.cores) || 1;
  const gpu0MemMB = toMB(hardware?.gpu?.[0]?.memory);
  const ramTotalMB =
    Number((rawData as any)?.ram?.totalMemory) ||
    (hardware?.memory?.total ? Math.round(hardware.memory.total / 1024 / 1024) : 0);
  const storageType = hardware?.storage?.[0]?.type || 'unknown';
  const storageScore = storageType === 'SSD' || storageType === 'NVME' ? 90 : 60;

  // Données pour le graphique des performances
  const performanceData = {
    labels: ['CPU', 'GPU', 'RAM', 'Stockage'],
    datasets: [
      {
        label: 'Score de Performance',
        data: [
          Math.min(100, (cpuFreqMHz * cpuCores) / 50),
          Math.min(100, gpu0MemMB / 120),
          Math.min(100, ramTotalMB / 320),
          storageScore,
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        borderColor: ['#2563EB', '#059669', '#D97706', '#7C3AED'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rapport d'Analyse PC</h1>
                <p className="text-sm text-gray-500">
                  Généré le {new Date(createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Analyse Complète
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graphique des performances */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-1">
                <h3 className="text-lg font-semibold">Analyse des Performances</h3>
                <p className="text-sm text-gray-500">Évaluation des composants de votre système</p>
              </div>
              <div className="space-y-4 mt-4">
                {performanceData.labels.map((label, idx) => {
                  const value = performanceData.datasets[0].data[idx] as number;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{label}</span>
                        <span className="text-gray-600">{Math.round(value)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Détails des composants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPU */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Processeur</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Modèle:</strong> {hardware?.cpu?.name ?? 'Inconnu'}</p>
                  <p><strong>Cœurs:</strong> {hardware?.cpu?.cores ?? '—'}</p>
                  {hardware?.cpu?.threads !== undefined && (
                    <p><strong>Threads:</strong> {hardware.cpu.threads}</p>
                  )}
                  {hardware?.cpu?.frequency !== undefined && (
                    <p><strong>Fréquence:</strong> {hardware.cpu.frequency} MHz</p>
                  )}
                  {hardware?.cpu?.architecture && (
                    <p><strong>Architecture:</strong> {hardware.cpu.architecture}</p>
                  )}
                </div>
              </div>

              {/* GPU */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Monitor className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Carte Graphique</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  {(hardware?.gpu ?? []).map((gpu: any, index: number) => (
                    <div key={index} className="border-b pb-2 last:border-b-0">
                      <p><strong>Modèle:</strong> {gpu.name}</p>
                      {gpu.memory !== undefined && (
                        <p><strong>Mémoire:</strong> {toMB(gpu.memory)} MB</p>
                      )}
                      {gpu.driver && <p><strong>Driver:</strong> {gpu.driver}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* RAM */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MemoryStick className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold">Mémoire RAM</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Total:</strong> {ramTotalMB} MB</p>
                  {((rawData as any)?.ram?.availableMemory || hardware?.memory?.available) && (
                    <p><strong>Disponible:</strong> {toMB((rawData as any)?.ram?.availableMemory ?? hardware?.memory?.available)} MB</p>
                  )}
                  {((rawData as any)?.ram?.speed) && <p><strong>Vitesse:</strong> {(rawData as any).ram.speed} MHz</p>}
                  {((rawData as any)?.ram?.type) && <p><strong>Type:</strong> {(rawData as any).ram.type}</p>}
                </div>
              </div>

              {/* Stockage */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <HardDrive className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Stockage</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  {(hardware?.storage ?? []).map((storage: any, index: number) => (
                    <div key={index} className="border-b pb-2 last:border-b-0">
                      <p><strong>Nom:</strong> {storage.name}</p>
                      {storage.type && <p><strong>Type:</strong> {storage.type}</p>}
                      <p><strong>Capacité:</strong> {Math.round(((storage.capacity ?? storage.total ?? 0) as number) / 1000 / (storage.capacity ? 1 : 1))} GB</p>
                      <p><strong>Espace libre:</strong> {Math.round(((storage.freeSpace ?? storage.available ?? 0) as number) / 1000)} GB</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Informations système */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Informations Système</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {(() => {
                  const os = rawData?.system?.os ?? rawData?.software?.os;
                  return (
                    <>
                      <p><strong>OS:</strong> {os?.name ?? 'Inconnu'}</p>
                      <p><strong>Version:</strong> {os?.version ?? '—'}</p>
                      <p><strong>Architecture:</strong> {os?.arch ?? '—'}</p>
                    </>
                  );
                })()}
                {rawData?.motherboard?.name && (
                  <p><strong>Carte mère:</strong> {rawData.motherboard.name}</p>
                )}
                {rawData?.motherboard?.chipset && (
                  <p><strong>Chipset:</strong> {rawData.motherboard.chipset}</p>
                )}
              </div>
            </div>

            {/* Sélecteur de profil */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <div>
                <h3 className="font-semibold">Recommandations IA</h3>
                <p className="text-sm text-gray-500">Sélectionnez votre profil d'utilisation pour obtenir des recommandations personnalisées</p>
              </div>

              <select
                value={selectedProfile}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Choisir un profil...
                </option>
                {Object.entries(USER_PROFILES_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {loadingRecommendations && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Génération des recommandations...</span>
                </div>
              )}

              {recommendations && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommandations:</h4>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">
                    {recommendations}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
