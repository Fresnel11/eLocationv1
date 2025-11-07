import React from 'react';
import { Shield, Users, Globe, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

const values = [
  {
    icon: Shield,
    title: 'Sécurité',
    description: 'Vérification d\'identité et transactions sécurisées pour protéger nos utilisateurs'
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Nous créons des liens durables entre propriétaires et locataires béninois'
  },
  {
    icon: Globe,
    title: 'Accessibilité',
    description: 'Plateforme accessible partout au Bénin, dans toutes les langues locales'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Service client de qualité et support technique disponible 7j/7'
  }
];

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            À propos d'eLocation Bénin
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nous révolutionnons le secteur de la location au Bénin en connectant 
            propriétaires et locataires sur une plateforme moderne, sécurisée et transparente.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Notre histoire
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Fondée en 2023, eLocation Bénin est née d'un constat simple : 
                le marché de la location au Bénin manquait d'une plateforme moderne, 
                fiable et accessible à tous.
              </p>
              <p>
                Notre mission est de faciliter les rencontres entre propriétaires 
                et locataires, en supprimant les intermédiaires coûteux et en 
                offrant une expérience utilisateur exceptionnelle.
              </p>
              <p>
                Aujourd'hui, nous comptons plus de 10,000 utilisateurs actifs 
                et facilitons des centaines de transactions chaque mois à travers 
                tout le territoire béninois.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Équipe eLocation Bénin"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nos valeurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-8">eLocation Bénin en chiffres</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-4xl font-bold mb-2">10,000+</p>
              <p className="text-blue-100">Utilisateurs actifs</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">5,000+</p>
              <p className="text-blue-100">Annonces publiées</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">15</p>
              <p className="text-blue-100">Villes couvertes</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">98%</p>
              <p className="text-blue-100">Satisfaction client</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};