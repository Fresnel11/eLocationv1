import React, { useEffect, useState } from 'react';
import { Users, Home, Calendar, TrendingUp, Activity, Target } from 'lucide-react';
import { StatsCard } from '../../components/admin/StatsCard';
import { SimpleChart } from '../../components/admin/SimpleChart';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  totalBookings: number;
  activeUsers: number;
  inactiveAds: number;
  recentUsers: any[];
}

interface Analytics {
  usersGrowth: { month: string; count: number }[];
  adsGrowth: { month: string; count: number }[];
  topCategories: { category: string; count: number }[];
  bookingsStats: { status: string; count: number }[];
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics')
      ]);
      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 sm:h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-48 sm:h-64 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Vue d'ensemble de la plateforme eLocation</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatsCard
            title="Total Utilisateurs"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.activeUsers || 0} actifs`}
            icon={Users}
            color="bg-blue-500"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Annonces"
            value={stats?.totalAds || 0}
            subtitle={`${stats?.inactiveAds || 0} inactives`}
            icon={Home}
            color="bg-green-500"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Réservations"
            value={stats?.totalBookings || 0}
            icon={Calendar}
            color="bg-purple-500"
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Taux d'activité"
            value={`${Math.round(((stats?.activeUsers || 0) / (stats?.totalUsers || 1)) * 100)}%`}
            icon={Activity}
            color="bg-orange-500"
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {analytics?.topCategories && (
            <SimpleChart
              title="Top Catégories"
              type="bar"
              data={analytics.topCategories.map(cat => ({
                label: cat.category || 'Autre',
                value: cat.count,
                color: 'bg-blue-500'
              }))}
            />
          )}
          
          {analytics?.bookingsStats && (
            <SimpleChart
              title="Statut des Réservations"
              type="doughnut"
              data={analytics.bookingsStats.map(booking => ({
                label: booking.status,
                value: booking.count
              }))}
            />
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Utilisateurs récents</h2>
          </div>
          <div className="p-4 sm:p-6">
            {stats?.recentUsers?.length ? (
              <div className="space-y-3 sm:space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">Aucun utilisateur récent</p>
            )}
          </div>
        </div>
      </div>
  );
};