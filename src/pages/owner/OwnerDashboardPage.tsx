import React, { useState, useEffect } from 'react';
import { Plus, Home, Eye, Edit, Trash2, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  status: 'active' | 'inactive' | 'rented';
  views: number;
  createdAt: string;
}

interface Stats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalRevenue: number;
}

export const OwnerDashboardPage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch owner's ads and stats from API
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'rented': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'rented': return 'Loué';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord propriétaire</h1>
            <p className="text-gray-600">Gérez vos annonces et suivez vos performances</p>
          </div>
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle annonce
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total annonces</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAds}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annonces actives</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAds}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total vues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} FCFA</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ads List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes annonces</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ads.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce</h3>
                <p className="text-gray-600 mb-4">Commencez par créer votre première annonce</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une annonce
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{ad.title}</h3>
                        <p className="text-sm text-gray-600">{ad.location}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm font-medium text-blue-600">
                            {ad.price.toLocaleString()} FCFA
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                            {getStatusText(ad.status)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {ad.views} vues
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};