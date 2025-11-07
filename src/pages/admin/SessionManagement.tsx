import React, { useState, useEffect } from 'react';
import { Users, Monitor, Smartphone, MapPin, Clock, LogOut, AlertCircle, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface UserSession {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  deviceInfo: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  isActive: boolean;
  sessionDuration: number;
  actions: number;
}

interface SessionStats {
  totalActiveSessions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  peakConcurrentSessions: number;
  sessionsByDevice: Record<string, number>;
  sessionsByLocation: Record<string, number>;
  recentLogins: number;
  suspiciousActivity: number;
}

export const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const [searchUserId, setSearchUserId] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [pagination.page, searchUserId]);

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchUserId && { userId: searchUserId })
      });

      const response = await api.get(`/admin/sessions/active?${params}`);
      setSessions(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (err) {
      error('Erreur', 'Impossible de charger les sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/sessions/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir terminer cette session ?')) return;

    setTerminatingSession(sessionId);
    try {
      await api.post(`/admin/sessions/${sessionId}/terminate`);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      success('Session terminée', 'La session a été terminée avec succès');
      await fetchStats();
    } catch (err) {
      error('Erreur', 'Impossible de terminer la session');
    } finally {
      setTerminatingSession(null);
    }
  };

  const handleTerminateAllUserSessions = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir terminer toutes les sessions de ${userName} ?`)) return;

    try {
      await api.post(`/admin/sessions/user/${userId}/terminate-all`);
      setSessions(prev => prev.filter(session => session.userId !== userId));
      success('Sessions terminées', `Toutes les sessions de ${userName} ont été terminées`);
      await fetchStats();
    } catch (err) {
      error('Erreur', 'Impossible de terminer les sessions');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.includes('Android') || deviceInfo.includes('iOS')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getActivityStatus = (lastActivity: string, isActive: boolean) => {
    const lastActivityTime = new Date(lastActivity);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastActivityTime.getTime()) / (1000 * 60));

    if (!isActive) return { color: 'text-gray-500', text: 'Inactive' };
    if (diffMinutes < 5) return { color: 'text-green-600', text: 'En ligne' };
    if (diffMinutes < 30) return { color: 'text-yellow-600', text: `Il y a ${diffMinutes}m` };
    return { color: 'text-red-600', text: 'Inactive' };
  };

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
        <Users className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Sessions</h1>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessions actives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActiveSessions}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs uniques</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
              <Monitor className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Durée moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.averageSessionDuration)}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activité suspecte</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suspiciousActivity}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="Rechercher par ID utilisateur..."
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setSearchUserId('')}
            variant="outline"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appareil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => {
                const activityStatus = getActivityStatus(session.lastActivity, session.isActive);
                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {session.user.firstName} {session.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{session.user.email}</div>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                            session.user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.deviceInfo)}
                        <div>
                          <div className="text-sm text-gray-900">{session.deviceInfo}</div>
                          <div className="text-sm text-gray-500 font-mono">{session.ipAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{session.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`text-sm font-medium ${activityStatus.color}`}>
                          {activityStatus.text}
                        </span>
                        <div className="text-xs text-gray-500">
                          {session.actions} actions
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{formatDuration(session.sessionDuration)}</div>
                        <div className="text-xs text-gray-500">
                          Depuis {new Date(session.loginTime).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleTerminateSession(session.id)}
                          disabled={terminatingSession === session.id}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                        >
                          <LogOut className="w-4 h-4" />
                          {terminatingSession === session.id ? 'Terminaison...' : 'Terminer'}
                        </Button>
                        <Button
                          onClick={() => handleTerminateAllUserSessions(
                            session.userId, 
                            `${session.user.firstName} ${session.user.lastName}`
                          )}
                          variant="outline"
                          size="sm"
                          className="text-red-700 border-red-400 hover:bg-red-50"
                        >
                          Tout terminer
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Répartition par appareil et localisation */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par appareil</h3>
            <div className="space-y-3">
              {Object.entries(stats.sessionsByDevice).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {device === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    <span className="capitalize">{device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / stats.totalActiveSessions) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par localisation</h3>
            <div className="space-y-3">
              {Object.entries(stats.sessionsByLocation).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(count / stats.totalActiveSessions) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count}</span>
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