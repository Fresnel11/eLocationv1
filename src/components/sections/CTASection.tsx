import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 relative overflow-hidden text-white">
      {/* Dynamic Background Accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white ring-1 ring-white/20 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
              Rejoignez l'aventure
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Prêt à réinventer votre façon de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-200">louer au Bénin ?</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-blue-100 mb-10 leading-relaxed text-balance">
            Que vous cherchiez un logement, un véhicule ou des équipements, des milliers d'offres de confiance vous attendent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              asChild
            >
              <Link to="/register" className="flex items-center justify-center text-blue-700">
                <PlusCircle className="h-5 w-5 mr-2.5 text-blue-700" />
                Commencer gratuitement
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-2 border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-blue-700 font-extrabold px-8 py-4 rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              asChild
            >
              <Link to="/ads" className="flex items-center justify-center">
                Explorer les annonces
                <ArrowRight className="h-5 w-5 ml-2.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};