import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, Zap, PartyPopper, Briefcase, Gamepad2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const categories = [
  {
    id: 'immobilier',
    name: 'Immobilier',
    icon: Home,
    description: 'Maisons, appartements, bureaux et espaces commerciaux',
    count: '1,250+',
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    overlay: 'bg-blue-600/70',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'vehicules',
    name: 'Véhicules',
    icon: Car,
    description: 'Voitures, motos, utilitaires et véhicules spéciaux',
    count: '850+',
    image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800',
    overlay: 'bg-green-600/70',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'electromenager',
    name: 'Électroménager',
    icon: Zap,
    description: 'Appareils électroménagers et équipements domestiques',
    count: '620+',
    image: 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800',
    overlay: 'bg-orange-600/70',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    id: 'evenementiel',
    name: 'Événementiel',
    icon: PartyPopper,
    description: 'Matériel et équipements pour tous vos événements',
    count: '340+',
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
    overlay: 'bg-purple-600/70',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 'professionnel',
    name: 'Professionnel',
    icon: Briefcase,
    description: 'Équipements et outils professionnels',
    count: '280+',
    image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=800',
    overlay: 'bg-indigo-600/70',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'loisirs',
    name: 'Loisirs',
    icon: Gamepad2,
    description: 'Sport, musique, jeux et divertissement',
    count: '195+',
    image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
    overlay: 'bg-pink-600/70',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  }
];

export const CategoriesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
              Nos Services
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Explorez nos catégories
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez une large gamme de produits et services de location adaptés à tous vos besoins
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} to={`/ads?category=${category.id}`} className="group">
                <Card className="h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    {/* Icon Section */}
                    <div className="p-8 text-center relative overflow-hidden">
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${category.image})` }}
                      ></div>
                      {/* Color Overlay */}
                      <div className={`absolute inset-0 ${category.overlay}`}></div>
                      {/* Animated Overlay */}
                      <div className="absolute inset-0 bg-white/10 transform rotate-12 scale-150 translate-x-1/2 -translate-y-1/2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
                      
                      <div className="relative z-10">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${category.iconBg} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-8 w-8 ${category.iconColor}`} />
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-700">
                            {category.count} annonces
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {category.name}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link 
            to="/login" 
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Voir toutes les annonces
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};