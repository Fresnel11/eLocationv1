import React, { useState, useEffect } from 'react';
import { Flag, Eye, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Report {
  id: string;
  type: 'ad' | 'user';
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reporter: {
    firstName: string;
    lastName: string;
  };
  reportedAd?: {
    id: string;
    title: string;
  };
  reportedUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  adminNotes?: string;
}

export const ReportsManagement: React.FC = () => {
  const { success, error } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les signalements');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, adminNotes?: string) => {
    try {
      await api.patch(`/reports/${reportId}/status`, { status, adminNotes });
      success('Statut mis à jour', 'Le signalement a été traité');
      fetchReports();
    } catch (err) {
      error('Erreur', 'Impossible de mettre à jour le signalement');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'dismissed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'reviewed': return 'Examiné';
      case 'resolved': return 'Résolu';
      case 'dismissed': return 'Rejeté';
      default: return status;
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      inappropriate_content: 'Contenu inapproprié',
      spam: 'Spam',
      fraud: 'Fraude',
      harassment: 'Harcèlement',
      fake_listing: 'Annonce factice',
      offensive_behavior: 'Comportement offensant',
      other: 'Autre'
    };
    return labels[reason] || reason;
  };

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des signalements</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tous' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun signalement
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Aucun signalement trouvé'
                  : `Aucun signalement ${getStatusLabel(filter).toLowerCase()}`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Flag className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {report.type === 'ad' ? 'Annonce signalée' : 'Utilisateur signalé'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.type === 'ad' 
                          ? report.reportedAd?.title
                          : `${report.reportedUser?.firstName} ${report.reportedUser?.lastName}`
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Raison</p>
                    <p className="text-sm text-gray-600">{getReasonLabel(report.reason)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Signalé par</p>
                    <p className="text-sm text-gray-600">
                      {report.reporter.firstName} {report.reporter.lastName}
                    </p>
                  </div>
                </div>

                {report.description && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {report.description}
                    </p>
                  </div>
                )}

                {report.adminNotes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes admin</p>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {report.adminNotes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Signalé le {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReportStatus(report.id, 'reviewed')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Examiner
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'resolved', 'Signalement traité et résolu')}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Résoudre
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReportStatus(report.id, 'dismissed', 'Signalement non fondé')}
                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};