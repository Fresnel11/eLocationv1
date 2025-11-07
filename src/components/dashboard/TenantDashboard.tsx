import React from 'react';
import { Heart, MessageSquare, Search, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

const savedListings = [
  {
    id: 1,
    title: 'Appartement 3 pièces - Fidjrossè',
    price: '75,000 F/mois',
    location: 'Cotonou',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    title: 'Villa moderne - Akpakpa',
    price: '150,000 F/mois',
    location: 'Cotonou',
    image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const recentSearches = [
  'Appartement 2 pièces Cotonou',
  'Villa Calavi',
  'Studio meublé'
];

export const TenantDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Locataire</h1>
        <p className="text-gray-600 mt-2">Gérez vos recherches et favoris</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Saved Listings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Annonces sauvegardées ({savedListings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedListings.map((listing) => (
                <div key={listing.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                    <p className="text-blue-600 font-medium">{listing.price}</p>
                    <p className="text-sm text-gray-500">{listing.location}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button size="sm">Voir</Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Nouvelle recherche
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Alertes (3 nouvelles)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages (5)
              </Button>
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Recherches récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};