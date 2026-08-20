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
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-50/40 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs">
              Simplicité & Sécurité
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Comment ça <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500">marche ?</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed text-balance">
            Louez tout ce dont vous avez besoin au Bénin en 4 étapes simples et totalement sécurisées.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.step} className="relative group">
                <Card className="h-full rounded-3xl border border-slate-200/80 bg-white shadow-md hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Header Section */}
                    <div className={`${step.bgColor} p-8 text-center relative border-b border-slate-100`}>
                      {/* Step Number */}
                      <div className="absolute top-4 right-4">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md shadow-slate-900/10`}>
                          <span className="text-xs font-black text-white">{step.step}</span>
                        </div>
                      </div>
                      
                      {/* Icon */}
                      <div className="mb-4">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-black/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                          <IconComponent className={`h-8 w-8 ${step.textColor}`} />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-extrabold text-xl text-slate-900 mb-1">
                        {step.title}
                      </h3>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6 flex-1 flex items-center bg-white">
                      <p className="text-slate-600 text-sm leading-relaxed text-center">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Arrow Connector (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div className="bg-white rounded-full p-2.5 shadow-md border border-slate-200/80 text-blue-600">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Toutes vos transactions sont vérifiées et 100% sécurisées</span>
          </div>
        </div>
      </div>
    </section>
  );
};