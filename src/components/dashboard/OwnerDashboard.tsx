import React from 'react';
import { PlusCircle, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

const stats = [
  { label: 'Annonces actives', value: '12', change: '+2 ce mois' },
  { label: 'Vues totales', value: '3,847', change: '+15%' },
  { label: 'Messages reçus', value: '28', change: '8 non lus' },
  { label: 'Revenus ce mois', value: '485,000 F', change: '+22%' }
];

const recentListings = [
  {
    id: 1,
    title: 'Appartement 2 pièces - Cotonou',
    price: '65,000 F/mois',
    status: 'active',
    views: 234,
    messages: 5
  },
  {
    id: 2,
    title: 'Villa 4 chambres - Calavi',
    price: '120,000 F/mois',
    status: 'active',
    views: 189,
    messages: 3
  },
  {
    id: 3,
    title: 'Studio meublé - Akpakpa',
    price: '45,000 F/mois',
    status: 'pending',
    views: 67,
    messages: 1
  }
];

export const OwnerDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Propriétaire</h1>
        <p className="text-gray-600 mt-2">Gérez vos annonces et suivez vos performances</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-green-600 mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Listings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mes annonces récentes</CardTitle>
            <Button size="sm" asChild>
              <a href="#">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                    <p className="text-blue-600 font-medium">{listing.price}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={listing.status === 'active' ? 'success' : 'warning'}>
                      {listing.status === 'active' ? 'Active' : 'En attente'}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>{listing.views}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      <span>{listing.messages}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start">
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer une annonce
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="h-4 w-4 mr-2" />
              Voir mes statistiques
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages (8 non lus)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};