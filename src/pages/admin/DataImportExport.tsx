import React, { useState, useEffect } from 'react';
import { Download, Upload, Database, Calendar, FileText, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ExportStats {
  totalExports: number;
  lastExportDate: string;
  averageExportSize: string;
  exportsByMonth: Array<{ month: string; count: number }>;
  tableStats: Record<string, { records: number; size: string }>;
}

interface ExportHistory {
  exports: Array<{
    id: string;
    date: string;
    tables: string[];
    size: string;
    records: number;
    status: string;
    downloadUrl?: string;
  }>;
}

export const DataImportExport: React.FC = () => {
  const [exportStats, setExportStats] = useState<ExportStats | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistory | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>(['users', 'ads', 'bookings']);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const { success, error } = useToast();

  const availableTables = [
    { id: 'users', name: 'Utilisateurs', description: 'Données des utilisateurs' },
    { id: 'ads', name: 'Annonces', description: 'Annonces publiées' },
    { id: 'bookings', name: 'Réservations', description: 'Réservations effectuées' },
    { id: 'categories', name: 'Catégories', description: 'Catégories et sous-catégories' },
    { id: 'reviews', name: 'Avis', description: 'Avis et commentaires' },
    { id: 'payments', name: 'Paiements', description: 'Transactions financières' },
    { id: 'settings', name: 'Paramètres', description: 'Configuration système' }
  ];

  useEffect(() => {
    loadExportStats();
    loadExportHistory();
  }, []);

  const loadExportStats = async () => {
    try {
      const response = await api.get('/admin/export/stats');
      setExportStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const loadExportHistory = async () => {
    try {
      const response = await api.get('/admin/export/history');
      setExportHistory(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    }
  };

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev =>
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      error('Erreur', 'Veuillez sélectionner au moins une table');
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.get(`/admin/export/data?tables=${selectedTables.join(',')}`);
      
      // Créer et télécharger le fichier
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elocation-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success('Export réussi', `${response.data.size} octets exportés`);
      loadExportHistory();
    } catch (err) {
      error('Erreur', 'Échec de l\'export des données');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      error('Erreur', 'Veuillez sélectionner un fichier');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await api.post('/admin/import/data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      success('Import réussi', `${response.data.summary.successfulImports} enregistrements importés`);
      setImportFile(null);
      loadExportStats();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Échec de l\'import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleScheduleExport = async () => {
    try {
      await api.post('/admin/export/schedule', {
        frequency: scheduleFrequency,
        tables: selectedTables
      });
      success('Planification créée', 'Export automatique configuré');
    } catch (err) {
      error('Erreur', 'Échec de la planification');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Import/Export de données</h1>
      </div>

      {/* Statistiques */}
      {exportStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total exports</p>
                <p className="text-2xl font-bold text-gray-900">{exportStats.totalExports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dernier export</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(exportStats.lastExportDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taille moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{exportStats.averageExportSize}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exportStats.exportsByMonth[exportStats.exportsByMonth.length - 1]?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Exporter les données
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tables à exporter
              </label>
              <div className="space-y-2">
                {availableTables.map(table => (
                  <label key={table.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTables.includes(table.id)}
                      onChange={() => handleTableToggle(table.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">{table.name}</span>
                      <p className="text-xs text-gray-500">{table.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleExport}
                disabled={isExporting || selectedTables.length === 0}
                className="flex-1"
              >
                {isExporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter maintenant
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Export automatique</h3>
              <div className="flex space-x-2">
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
                <Button onClick={handleScheduleExport} variant="outline">
                  Planifier
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Importer les données
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier d'import (JSON)
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {importFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Fichier sélectionné: {importFile.name} ({formatFileSize(importFile.size)})
                </p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    L'import remplacera les données existantes. Assurez-vous d'avoir une sauvegarde.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleImport}
              disabled={isImporting || !importFile}
              className="w-full"
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer les données
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Historique des exports */}
      {exportHistory && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historique des exports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tables
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enregistrements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exportHistory.exports.map((exportItem) => (
                  <tr key={exportItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(exportItem.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exportItem.tables.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exportItem.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exportItem.records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        exportItem.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {exportItem.status === 'COMPLETED' ? 'Terminé' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {exportItem.downloadUrl ? (
                        <a
                          href={exportItem.downloadUrl}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Télécharger
                        </a>
                      ) : null}
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistiques des tables */}
      {exportStats && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Statistiques par table</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(exportStats.tableStats).map(([table, stats]) => (
                <div key={table} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 capitalize">{table}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Enregistrements: <span className="font-medium">{stats.records.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Taille: <span className="font-medium">{stats.size}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};