"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Monitor, Cpu, HardDrive, MemoryStick } from "lucide-react";

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/report/${id}`);
        if (!res.ok) throw new Error("Rapport introuvable");
        const response = await res.json();
        if (response.success) {
          setReport(response.data);
        } else {
          throw new Error(response.message || "Erreur lors du chargement du rapport");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

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

  const { hardwareData, createdAt } = report;

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CPU */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Processeur</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Modèle:</strong> {hardwareData.cpu.name}</p>
              <p><strong>Cœurs:</strong> {hardwareData.cpu.cores}</p>
              <p><strong>Threads:</strong> {hardwareData.cpu.threads}</p>
              <p><strong>Fréquence:</strong> {hardwareData.cpu.frequency} MHz</p>
              <p><strong>Architecture:</strong> {hardwareData.cpu.architecture}</p>
            </div>
          </div>

          {/* GPU */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Monitor className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Carte Graphique</h3>
            </div>
            <div className="space-y-2 text-sm">
              {hardwareData.gpu.map((gpu: any, index: number) => (
                <div key={index}>
                  <p><strong>Modèle:</strong> {gpu.name}</p>
                  <p><strong>Mémoire:</strong> {gpu.memory} MB</p>
                  {gpu.driver && <p><strong>Driver:</strong> {gpu.driver}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* RAM */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MemoryStick className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Mémoire RAM</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Total:</strong> {hardwareData.ram.totalMemory} MB</p>
              <p><strong>Disponible:</strong> {hardwareData.ram.availableMemory} MB</p>
              {hardwareData.ram.speed && <p><strong>Vitesse:</strong> {hardwareData.ram.speed} MHz</p>}
              {hardwareData.ram.type && <p><strong>Type:</strong> {hardwareData.ram.type}</p>}
            </div>
          </div>

          {/* Stockage */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <HardDrive className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Stockage</h3>
            </div>
            <div className="space-y-2 text-sm">
              {hardwareData.storage.map((storage: any, index: number) => (
                <div key={index} className="border-b pb-2 last:border-b-0">
                  <p><strong>Nom:</strong> {storage.name}</p>
                  <p><strong>Type:</strong> {storage.type}</p>
                  <p><strong>Capacité:</strong> {Math.round(storage.capacity / 1000)} GB</p>
                  <p><strong>Espace libre:</strong> {Math.round(storage.freeSpace / 1000)} GB</p>
                </div>
              ))}
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Informations Système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>OS:</strong> {hardwareData.system.os}</p>
                <p><strong>Version:</strong> {hardwareData.system.osVersion}</p>
                <p><strong>Architecture:</strong> {hardwareData.system.architecture}</p>
              </div>
              <div>
                <p><strong>Carte mère:</strong> {hardwareData.motherboard.name}</p>
                {hardwareData.motherboard.chipset && (
                  <p><strong>Chipset:</strong> {hardwareData.motherboard.chipset}</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
