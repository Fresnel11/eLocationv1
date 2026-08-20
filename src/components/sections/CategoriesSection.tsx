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
    <section className="py-24 bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 relative overflow-hidden">
      {/* Ambient Decorative Background Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-1.5 bg-blue-100/80 text-blue-700 ring-1 ring-blue-500/20 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs">
              Nos Catégories Prédilectes
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Explorez l'univers <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">eLocation</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed text-balance">
            Découvrez une sélection inégalée de logements, véhicules, équipements et matériels disponibles partout au Bénin.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} to={`/ads?category=${category.id}`} className="group">
                <Card className="h-full rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-md hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Image & Icon Header Section */}
                    <div className="p-8 text-center relative overflow-hidden min-h-[160px] flex items-center justify-center">
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${category.image})` }}
                      ></div>
                      {/* Color Overlay */}
                      <div className={`absolute inset-0 ${category.overlay} mix-blend-multiply transition-opacity duration-300 opacity-90 group-hover:opacity-95`}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      
                      {/* Content Overlay */}
                      <div className="relative z-10 w-full flex items-center justify-between">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${category.iconBg} shadow-lg shadow-black/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                          <IconComponent className={`h-7 w-7 ${category.iconColor}`} />
                        </div>
                        
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-white/50">
                          {category.count} annonces
                        </span>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                            {category.name}
                          </h3>
                          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-300" />
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {category.description}
                        </p>
                      </div>
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
            to="/ads" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 hover:-translate-y-0.5"
          >
            Explorer toutes les annonces
            <ArrowRight className="ml-2.5 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};