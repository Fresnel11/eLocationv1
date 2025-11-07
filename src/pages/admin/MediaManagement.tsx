import React, { useState, useEffect } from 'react';
import { Image, Video, Trash2, HardDrive, Filter, Search, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  type: 'image' | 'video';
  size: number;
  url: string;
  uploadedAt: string;
  usedBy?: {
    type: string;
    id: string;
    title: string;
  };
}

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  imageFiles: number;
  videoFiles: number;
  unusedFiles: number;
  storageUsed: number;
}

export const MediaManagement: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.type && { type: filters.type })
      });

      const response = await api.get(`/admin/media/files?${params}`);
      setFiles(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (err) {
      error('Erreur', 'Impossible de charger les fichiers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/media/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques');
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;
    
    setDeleteLoading(filename);
    try {
      await api.delete(`/admin/media/files/${filename}`);
      success('Fichier supprimé', 'Le fichier a été supprimé avec succès');
      await fetchFiles();
      await fetchStats();
    } catch (err) {
      error('Erreur', 'Impossible de supprimer le fichier');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      file.filename.toLowerCase().includes(searchTerm) ||
      file.originalName.toLowerCase().includes(searchTerm) ||
      (file.usedBy?.title.toLowerCase().includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HardDrive className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Médias</h1>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total fichiers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">{stats.imageFiles}</p>
              </div>
              <Image className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vidéos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.videoFiles}</p>
              </div>
              <Video className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non utilisés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unusedFiles}</p>
              </div>
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stockage</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
              </div>
              <div className="text-right">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${stats.storageUsed}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{stats.storageUsed}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Rechercher..."
              className="pl-10"
            />
          </div>
          <Select
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            options={[
              { value: '', label: 'Tous les types' },
              { value: 'image', label: 'Images' },
              { value: 'video', label: 'Vidéos' }
            ]}
          />
          <Button
            onClick={() => setFilters({ type: '', search: '' })}
            variant="outline"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Liste des fichiers */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fichier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisé par
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date upload
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {file.type === 'image' ? (
                          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Image className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Video className="h-5 w-5 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{file.originalName}</div>
                        <div className="text-sm text-gray-500">{file.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      file.type === 'image' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {file.type === 'image' ? 'Image' : 'Vidéo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {file.usedBy ? (
                      <span className="text-blue-600">{file.usedBy.title}</span>
                    ) : (
                      <span className="text-red-600">Non utilisé</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedFile(file)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </Button>
                      <Button
                        onClick={() => handleDelete(file.filename)}
                        disabled={deleteLoading === file.filename}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleteLoading === file.filename ? 'Suppression...' : 'Supprimer'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            variant="outline"
          >
            Précédent
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedFile.originalName}</h3>
              <Button
                onClick={() => setSelectedFile(null)}
                variant="outline"
                size="sm"
              >
                Fermer
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nom du fichier:</span>
                  <p className="text-gray-900">{selectedFile.filename}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Taille:</span>
                  <p className="text-gray-900">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900">{selectedFile.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date upload:</span>
                  <p className="text-gray-900">{new Date(selectedFile.uploadedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              {selectedFile.usedBy && (
                <div>
                  <span className="font-medium text-gray-700">Utilisé par:</span>
                  <p className="text-gray-900">{selectedFile.usedBy.title}</p>
                </div>
              )}
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500">Prévisualisation non disponible</p>
                <p className="text-sm text-gray-400">URL: {selectedFile.url}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};