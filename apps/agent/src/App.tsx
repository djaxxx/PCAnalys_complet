import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Étape 1: Collecte des informations système
      setSuccess('Collecte des informations système...');
      const systemInfo = await invoke('get_system_info');
      
      // Étape 2: Envoi à l'API
      setSuccess('Envoi des données à l'API...');
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hardwareData: systemInfo }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.id) {
        setSuccess('Analyse créée avec succès! Ouverture du rapport...');
        
        // Ouvre le rapport dans le navigateur par défaut
        await open(`http://localhost:3000/a/${data.id}`);
        
        // Ferme l'agent après 2 secondes
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        throw new Error(data.message || 'Erreur lors de la création du rapport.');
      }
    } catch (e: any) {
      console.error('Erreur d\'analyse:', e);
      setError(e.message || 'Erreur inconnue lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">PcAnalys Agent</h1>
        <p className="text-gray-600">Analyse gratuite et intelligente de votre PC</p>
      </motion.div>

      <motion.button
        whileHover={{ scale: loading ? 1 : 1.05 }}
        whileTap={{ scale: loading ? 1 : 0.95 }}
        className={`px-8 py-4 rounded-lg shadow-lg text-lg font-semibold transition-all duration-200 ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Analyse en cours...
          </div>
        ) : (
          'Lancer l'analyse'
        )}
      </motion.button>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 max-w-md text-center"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 max-w-md text-center"
        >
          <strong>Erreur:</strong> {error}
        </motion.div>
      )}

      <div className="mt-8 text-xs text-gray-500 text-center">
        <p>Agent PcAnalys v0.1.0</p>
        <p>Données traitées localement et de manière sécurisée</p>
      </div>
    </div>
  );
};

export default App;
