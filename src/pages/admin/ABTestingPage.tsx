import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, BarChart3, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { api } from '../../services/api';

interface ABTest {
  id: string;
  name: string;
  description: string;
  algorithms: {
    A: { name: string; config: any };
    B: { name: string; config: any };
  };
  trafficSplit: number;
  isActive: boolean;
  metrics: {
    A: { views: number; clicks: number; conversions: number };
    B: { views: number; clicks: number; conversions: number };
  };
  createdAt: string;
}

export const ABTestingPage: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/admin/ab-testing');
      setTests(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTest = async (testId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/ab-testing/${testId}`, { isActive: !isActive });
      fetchTests();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du test:', error);
    }
  };

  const deleteTest = async (testId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce test ?')) return;
    
    try {
      await api.delete(`/admin/ab-testing/${testId}`);
      fetchTests();
    } catch (error) {
      console.error('Erreur lors de la suppression du test:', error);
    }
  };

  const createTest = async (data: any) => {
    try {
      await api.post('/admin/ab-testing', data);
      setShowCreateModal(false);
      fetchTests();
    } catch (error) {
      console.error('Erreur lors de la création du test:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tests A/B - Algorithmes de tri</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau test
        </Button>
      </div>

      <div className="grid gap-6">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{test.name}</h3>
                  <p className="text-gray-600">{test.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {test.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Split: {test.trafficSplit}% / {100 - test.trafficSplit}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTest(test.id, test.isActive)}
                  >
                    {test.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTest(test.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <h4 className="font-medium mb-2">Algorithme A: {test.algorithms.A.name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Vues:</span>
                      <span>{test.metrics.A.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clics:</span>
                      <span>{test.metrics.A.clicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CTR:</span>
                      <span>
                        {test.metrics.A.views > 0 
                          ? ((test.metrics.A.clicks / test.metrics.A.views) * 100).toFixed(2)
                          : '0.00'
                        }%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h4 className="font-medium mb-2">Algorithme B: {test.algorithms.B.name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Vues:</span>
                      <span>{test.metrics.B.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clics:</span>
                      <span>{test.metrics.B.clicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CTR:</span>
                      <span>
                        {test.metrics.B.views > 0 
                          ? ((test.metrics.B.clicks / test.metrics.B.views) * 100).toFixed(2)
                          : '0.00'
                        }%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de création simplifié */}
      {showCreateModal && (
        <CreateTestModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createTest}
        />
      )}
    </div>
  );
};

const CreateTestModal: React.FC<{ onClose: () => void; onCreate: (data: any) => void }> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trafficSplit: 50
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      algorithms: {
        A: { name: 'Tri géographique', config: { type: 'geographic' } },
        B: { name: 'Tri par popularité', config: { type: 'popularity' } }
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Créer un nouveau test A/B</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du test</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Répartition du trafic (% pour algorithme A)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.trafficSplit}
              onChange={(e) => setFormData({ ...formData, trafficSplit: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Créer</Button>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          </div>
        </form>
      </div>
    </div>
  );
};