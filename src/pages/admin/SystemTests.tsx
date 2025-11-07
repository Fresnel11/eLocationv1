import React, { useState, useEffect } from 'react';
import { Shield, Play, CheckCircle, AlertTriangle, XCircle, Clock, Wrench, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface IntegrityTest {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
}

interface TestResult {
  testId: string;
  passed: boolean;
  issues: Array<{
    type: string;
    description: string;
    severity: string;
    [key: string]: any;
  }>;
  fixed?: number;
  duration: number;
}

interface TestHistory {
  tests: Array<{
    id: string;
    date: string;
    testsRun: number;
    issuesFound: number;
    issuesFixed: number;
    duration: string;
    status: string;
    triggeredBy: string;
  }>;
}

export const SystemTests: React.FC = () => {
  const [availableTests, setAvailableTests] = useState<IntegrityTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [history, setHistory] = useState<TestHistory | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
  const [lastRun, setLastRun] = useState<string>('');
  const [totalIssues, setTotalIssues] = useState(0);
  const { success, error } = useToast();

  useEffect(() => {
    loadIntegrityTests();
    loadTestHistory();
  }, []);

  const loadIntegrityTests = async () => {
    try {
      const response = await api.get('/admin/tests/integrity');
      setAvailableTests(response.data.availableTests);
      setLastRun(response.data.lastRun);
      setTotalIssues(response.data.totalIssues);
      setSelectedTests(response.data.availableTests.slice(0, 3).map((t: IntegrityTest) => t.id));
    } catch (err) {
      console.error('Erreur lors du chargement des tests:', err);
    }
  };

  const loadTestHistory = async () => {
    try {
      const response = await api.get('/admin/tests/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    }
  };

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleRunTests = async () => {
    if (selectedTests.length === 0) {
      error('Erreur', 'Veuillez sélectionner au moins un test');
      return;
    }

    setIsRunning(true);
    setTestResults({});
    
    try {
      const response = await api.post('/admin/tests/run', {
        testIds: selectedTests,
        autoFix
      });

      setTestResults(response.data.testResults);
      
      const { summary } = response.data;
      if (summary.failed === 0) {
        success('Tests réussis', 'Tous les tests ont été exécutés avec succès');
      } else {
        success('Tests terminés', `${summary.issues} problèmes détectés${autoFix ? `, ${summary.autoFixed} corrigés` : ''}`);
      }
      
      loadTestHistory();
    } catch (err) {
      error('Erreur', 'Échec de l\'exécution des tests');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFixIssues = async (issueIds: string[]) => {
    try {
      await api.post('/admin/tests/fix', {
        issueIds,
        fixType: 'manual'
      });
      success('Correction réussie', `${issueIds.length} problèmes corrigés`);
      handleRunTests(); // Re-run tests to verify fixes
    } catch (err) {
      error('Erreur', 'Échec de la correction');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'referential_integrity': return Shield;
      case 'file_integrity': return BarChart3;
      case 'data_quality': return CheckCircle;
      case 'data_validation': return AlertTriangle;
      case 'business_logic': return Wrench;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tests système</h1>
        <div className="text-sm text-gray-500">
          Dernier test: {lastRun ? new Date(lastRun).toLocaleString() : 'Jamais'}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tests disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{availableTests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Problèmes détectés</p>
              <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tests sélectionnés</p>
              <p className="text-2xl font-bold text-gray-900">{selectedTests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Statut</p>
              <p className="text-2xl font-bold text-gray-900">
                {isRunning ? 'En cours' : 'Prêt'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration des tests */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Tests d'intégrité
          </h2>

          <div className="space-y-4">
            <div className="space-y-3">
              {availableTests.map(test => {
                const Icon = getCategoryIcon(test.category);
                return (
                  <label key={test.id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => handleTestToggle(test.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{test.name}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(test.severity)}`}>
                          {test.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{test.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center pt-4 border-t">
              <input
                type="checkbox"
                id="autoFix"
                checked={autoFix}
                onChange={(e) => setAutoFix(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoFix" className="ml-2 text-sm text-gray-700">
                Correction automatique des problèmes détectés
              </label>
            </div>

            <Button
              onClick={handleRunTests}
              disabled={isRunning || selectedTests.length === 0}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Exécuter les tests
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Résultats des tests */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultats des tests</h2>
          
          {Object.keys(testResults).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun test exécuté récemment</p>
              <p className="text-sm">Sélectionnez des tests et cliquez sur "Exécuter"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(testResults).map(([testId, result]) => {
                const test = availableTests.find(t => t.id === testId);
                return (
                  <div key={testId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{test?.name}</h3>
                      <div className="flex items-center">
                        {result.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="ml-2 text-sm text-gray-500">
                          {result.duration}ms
                        </span>
                      </div>
                    </div>
                    
                    {result.issues.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          {result.issues.length} problème(s) détecté(s)
                          {result.fixed ? ` • ${result.fixed} corrigé(s)` : ''}
                        </p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {result.issues.slice(0, 3).map((issue, index) => (
                            <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              <span className="ml-2">{issue.description}</span>
                            </div>
                          ))}
                          {result.issues.length > 3 && (
                            <p className="text-xs text-gray-500">
                              ... et {result.issues.length - 3} autres problèmes
                            </p>
                          )}
                        </div>
                        {!autoFix && result.issues.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFixIssues(result.issues.map((_, i) => `${testId}-${i}`))}
                          >
                            <Wrench className="h-4 w-4 mr-1" />
                            Corriger
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      {history && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historique des tests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problèmes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corrigés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Déclencheur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.tests.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(test.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.testsRun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.issuesFound}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.issuesFixed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        test.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.status === 'completed' ? 'Terminé' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.triggeredBy === 'scheduled' ? 'Automatique' : 'Manuel'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};