import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
  <div
    className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"
  ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Prêt à commencer votre expérience de location ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Rejoignez des milliers d'utilisateurs satisfaits et découvrez une nouvelle façon de louer au Bénin
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-700 px-8 py-3 font-semibold"
              asChild
            >
              <Link to="/register" className="flex items-center justify-center text-blue-600">
                <PlusCircle className="h-5 w-5 mr-2 text-blue-600" />
                Commencer maintenant
              </Link>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold"
              asChild
            >
              <Link to="/login" className="flex items-center justify-center">
                Voir toutes les annonces
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};