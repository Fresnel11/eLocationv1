import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Cpu, HardDrive, Wifi, Database, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface SystemHealth {
  status: string;
  uptime: number;
  version: string;
  environment: string;
  services: Record<string, { status: string; responseTime?: number; usage?: number }>;
  resources: {
    cpu: { usage: number; cores: number };
    memory: { usage: number; total: number; used: number };
    disk: { usage: number; total: number; used: number };
    network: { inbound: number; outbound: number };
  };
  lastCheck: string;
}

interface PerformanceMetrics {
  period: string;
  metrics: Array<{
    timestamp: string;
    responseTime: number;
    requests: number;
    errors: number;
    cpuUsage: number;
    memoryUsage: number;
    activeUsers: number;
  }>;
  summary: {
    avgResponseTime: number;
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    peakCpu: number;
    peakMemory: number;
    peakUsers: number;
  };
}

interface ErrorLog {
  id: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'critical';
  message: string;
  source: string;
  stack: string;
  userId?: string;
  requestId: string;
  resolved: boolean;
}

interface Alert {
  id: string;
  type: string;
  severity: 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  createdAt: string;
  acknowledged: boolean;
  threshold: number;
  currentValue: number;
}

export const SystemMonitoring: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('24h');
  const [severityFilter, setSeverityFilter] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [period, severityFilter]);

  const fetchMonitoringData = async () => {
    try {
      const [healthRes, metricsRes, errorsRes, alertsRes] = await Promise.all([
        api.get('/admin/monitoring/system-health'),
        api.get(`/admin/monitoring/performance?period=${period}`),
        api.get(`/admin/monitoring/errors?severity=${severityFilter}&limit=20`),
        api.get('/admin/monitoring/alerts')
      ]);

      setSystemHealth(healthRes.data);
      setPerformanceMetrics(metricsRes.data);
      setErrorLogs(errorsRes.data.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les données de monitoring');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.post(`/admin/monitoring/alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      success('Alerte acquittée', 'L\'alerte a été marquée comme acquittée');
    } catch (err) {
      error('Erreur', 'Impossible d\'acquitter l\'alerte');
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'critical': return 'text-red-700';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Système</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${systemHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {systemHealth?.status === 'healthy' ? 'Système opérationnel' : 'Problème détecté'}
          </span>
        </div>
      </div>

      {/* Alertes actives */}
      {alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-900">Alertes actives</h3>
          </div>
          <div className="space-y-2">
            {alerts.filter(alert => !alert.acknowledged).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white rounded p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="font-medium text-gray-900">{alert.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                </div>
                <Button
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                  size="sm"
                  variant="outline"
                >
                  Acquitter
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* État du système */}
      {systemHealth && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">État du système</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className={`font-medium ${getStatusColor(systemHealth.status)}`}>
                  {systemHealth.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">{formatUptime(systemHealth.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">{systemHealth.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environnement</span>
                <span className="font-medium">{systemHealth.environment}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Services</h3>
            <div className="space-y-3">
              {Object.entries(systemHealth.services).map(([service, data]) => (
                <div key={service} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${data.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="capitalize">{service}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.responseTime && `${data.responseTime}ms`}
                    {data.usage && `${data.usage}%`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ressources système */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span className="font-medium">CPU</span>
              </div>
              <span className="text-lg font-bold">{systemHealth.resources.cpu.usage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${systemHealth.resources.cpu.usage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{systemHealth.resources.cpu.cores} cores</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                <span className="font-medium">Mémoire</span>
              </div>
              <span className="text-lg font-bold">{systemHealth.resources.memory.usage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${systemHealth.resources.memory.usage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {systemHealth.resources.memory.used}MB / {systemHealth.resources.memory.total}MB
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Disque</span>
              </div>
              <span className="text-lg font-bold">{systemHealth.resources.disk.usage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${systemHealth.resources.disk.usage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {systemHealth.resources.disk.used}GB / {systemHealth.resources.disk.total}GB
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Réseau</span>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entrant</span>
                <span className="font-medium">{systemHealth.resources.network.inbound} KB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sortant</span>
                <span className="font-medium">{systemHealth.resources.network.outbound} KB/s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métriques de performance */}
      {performanceMetrics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Performance</h3>
            <Select
              value={period}
              onChange={setPeriod}
              options={[
                { value: '1h', label: '1 heure' },
                { value: '24h', label: '24 heures' },
                { value: '7d', label: '7 jours' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceMetrics.metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString('fr-FR')}
                formatter={(value, name) => [
                  name === 'responseTime' ? `${value}ms` : value,
                  name === 'responseTime' ? 'Temps de réponse' : 
                  name === 'requests' ? 'Requêtes' : 
                  name === 'errors' ? 'Erreurs' : name
                ]}
              />
              <Line type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={2} name="responseTime" />
              <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="errors" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Logs d'erreur */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Logs d'erreur récents</h3>
          <Select
            value={severityFilter}
            onChange={setSeverityFilter}
            options={[
              { value: '', label: 'Toutes les sévérités' },
              { value: 'critical', label: 'Critique' },
              { value: 'error', label: 'Erreur' },
              { value: 'warning', label: 'Avertissement' }
            ]}
          />
        </div>
        <div className="space-y-3">
          {errorLogs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                  <span className="font-medium text-gray-900">{log.source}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {log.resolved ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs text-gray-500">
                    {log.resolved ? 'Résolu' : 'Non résolu'}
                  </span>
                </div>
              </div>
              <p className="text-gray-900 mb-2">{log.message}</p>
              <details className="text-xs text-gray-600">
                <summary className="cursor-pointer hover:text-gray-800">Stack trace</summary>
                <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">{log.stack}</pre>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};