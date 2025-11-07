import React from 'react';
import { Search, MessageCircle, HandHeart, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const steps = [
  {
    icon: Search,
    title: 'Recherchez',
    description: 'Parcourez nos milliers d\'annonces ou utilisez nos filtres avancés pour trouver exactement ce que vous cherchez',
    step: '01',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    icon: MessageCircle,
    title: 'Contactez',
    description: 'Échangez directement avec les propriétaires via notre messagerie sécurisée intégrée',
    step: '02',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    icon: HandHeart,
    title: 'Louez',
    description: 'Finalisez votre location en toute confiance avec nos garanties de sécurité et paiement sécurisé',
    step: '03',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  {
    icon: Shield,
    title: 'Profitez',
    description: 'Bénéficiez de votre location avec le support 24/7 de notre équipe dédiée',
    step: '04',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  }
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
              Processus Simple
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Un processus simple, rapide et sécurisé en 4 étapes pour toutes vos locations
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.step} className="relative group">
                <Card className="h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header Section */}
                    <div className={`${step.bgColor} p-6 text-center relative`}>
                      {/* Step Number */}
                      <div className="absolute top-4 right-4">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                          <span className="text-xs font-bold text-white">{step.step}</span>
                        </div>
                      </div>
                      
                      {/* Icon */}
                      <div className="mb-4">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-8 w-8 ${step.textColor}`} />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-bold text-xl text-gray-900 mb-2">
                        {step.title}
                      </h3>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6">
                      <p className="text-gray-600 leading-relaxed text-center">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Arrow Connector (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Processus 100% sécurisé et garanti</span>
          </div>
        </div>
      </div>
    </section>
  );
};