import React, { useState } from 'react';
import { Search, Filter, MapPin, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getCategoryIcon, getPropertyIcon } from '../utils/categoryIcons';

const mockAnnonces = [
  {
    id: 1,
    title: 'Appartement moderne 3 pièces',
    price: '85,000 F/mois',
    location: 'Cotonou, Fidjrossè',
    category: 'Immobilier',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bel appartement meublé dans un quartier résidentiel calme',
    owner: 'Marie Adjovi',
    rating: 4.8,
    featured: true
  },
  {
    id: 2,
    title: 'Toyota Corolla 2020',
    price: '25,000 F/jour',
    location: 'Cotonou, Centre-ville',
    category: 'Véhicules',
    image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Véhicule récent, climatisé, idéal pour vos déplacements',
    owner: 'Kossi Mensah',
    rating: 4.9,
    featured: false
  },
  {
    id: 3,
    title: 'Réfrigérateur 350L Samsung',
    price: '8,000 F/mois',
    location: 'Porto-Novo',
    category: 'Électroménager',
    image: 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Réfrigérateur récent en excellent état',
    owner: 'Jean Kpodo',
    rating: 4.7,
    featured: false
  },
  {
    id: 4,
    title: 'Villa 5 chambres avec piscine',
    price: '200,000 F/mois',
    location: 'Calavi',
    category: 'Immobilier',
    image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Magnifique villa dans un quartier huppé',
    owner: 'Fatou Dossou',
    rating: 5.0,
    featured: true
  }
];

export const AnnoncesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'immobilier', label: 'Immobilier' },
    { value: 'vehicules', label: 'Véhicules' },
    { value: 'electromenager', label: 'Électroménager' },
    { value: 'evenementiel', label: 'Événementiel' }
  ];

  const locationOptions = [
    { value: '', label: 'Toutes les villes' },
    { value: 'cotonou', label: 'Cotonou' },
    { value: 'porto-novo', label: 'Porto-Novo' },
    { value: 'parakou', label: 'Parakou' },
    { value: 'calavi', label: 'Calavi' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Toutes les annonces</h1>
          
          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-1"
              />
              
              <Select
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
              
              <Select
                options={locationOptions}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
              
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-medium">{mockAnnonces.length} annonces</span> trouvées
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </Button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockAnnonces.map((annonce) => (
            <Card key={annonce.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="relative">
                <img
                  src={annonce.image}
                  alt={annonce.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {annonce.featured && (
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                    À la une
                  </Badge>
                )}
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                </button>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    {getCategoryIcon(annonce.category, 12)}
                    {annonce.category}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {annonce.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {annonce.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {annonce.location}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">{annonce.price}</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">{annonce.rating}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">Par {annonce.owner}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Précédent</Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  );
};