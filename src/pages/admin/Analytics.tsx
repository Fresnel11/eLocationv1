import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react';

import { api } from '../../services/api';

interface AnalyticsData {
  usersGrowth: Array<{ month: string; count: number }>;
  adsGrowth: Array<{ month: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  bookingsStats: Array<{ status: string; count: number }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      // Convertir les strings en numbers pour les graphiques
      const processedData = {
        ...response.data,
        topCategories: response.data.topCategories.map((item: any) => ({
          ...item,
          count: parseInt(item.count)
        })),
        bookingsStats: response.data.bookingsStats.map((item: any) => ({
          ...item,
          count: parseInt(item.count)
        })),
        usersGrowth: response.data.usersGrowth.map((item: any) => ({
          ...item,
          count: parseInt(item.count)
        })),
        adsGrowth: response.data.adsGrowth.map((item: any) => ({
          ...item,
          count: parseInt(item.count)
        }))
      };
      setData(processedData);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Tableau de bord des performances et statistiques de la plateforme</p>
        </div>

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution des utilisateurs */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Évolution des utilisateurs</h2>
                    <p className="text-sm text-gray-500">Croissance mensuelle</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.usersGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Évolution des annonces */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Évolution des annonces</h2>
                    <p className="text-sm text-gray-500">Publications mensuelles</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.adsGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top catégories */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Top catégories</h2>
                    <p className="text-sm text-gray-500">Répartition par catégorie</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.topCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Statistiques des réservations */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Réservations par statut</h2>
                    <p className="text-sm text-gray-500">Distribution des statuts</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.bookingsStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} stroke="#6B7280" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#F59E0B" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
  );
};