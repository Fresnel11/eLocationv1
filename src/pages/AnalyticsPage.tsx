import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Eye, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface AnalyticsData {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  monthlyStats: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
  topPerformingAds: Array<{
    id: string;
    title: string;
    views: number;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur de chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Mes Statistiques</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Annonces</p>
                <p className="text-xl font-bold">{data.totalAds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vues totales</p>
                <p className="text-xl font-bold">{data.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Réservations</p>
                <p className="text-xl font-bold">{data.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenus</p>
                <p className="text-xl font-bold">{data.totalRevenue.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taux d'occupation */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Taux d'occupation</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(data.occupancyRate, 100)}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {data.occupancyRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Évolution mensuelle */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Évolution des 6 derniers mois</h3>
          <div className="space-y-3">
            {data.monthlyStats.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{month.month}</span>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{month.bookings} réservations</p>
                  <p className="font-semibold">{month.revenue.toLocaleString()} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top annonces */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Annonces les plus vues</h3>
          <div className="space-y-3">
            {data.topPerformingAds.map((ad, index) => (
              <div key={ad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{ad.title}</span>
                </div>
                <span className="text-blue-600 font-semibold">{ad.views} vues</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;