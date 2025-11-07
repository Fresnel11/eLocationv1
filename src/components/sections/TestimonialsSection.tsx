import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const testimonials = [
  {
    id: 1,
    name: 'Marie Adjovi',
    role: 'Locataire',
    content: 'Grâce à eLocation Bénin, j\'ai trouvé l\'appartement parfait à Cotonou en moins d\'une semaine. Le processus était simple et sécurisé.',
    rating: 5,
    location: 'Cotonou'
  },
  {
    id: 2,
    name: 'Kossi Mensah',
    role: 'Propriétaire',
    content: 'En tant que propriétaire, j\'apprécie la facilité de publication d\'annonces et la qualité des locataires que je rencontre sur la plateforme.',
    rating: 5,
    location: 'Porto-Novo'
  },
  {
    id: 3,
    name: 'Fatou Dossou',
    role: 'Locataire',
    content: 'Service client exceptionnel et processus transparent. Je recommande vivement eLocation Bénin à tous ceux qui cherchent à louer.',
    rating: 5,
    location: 'Parakou'
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez pourquoi des milliers de Béninois nous font confiance pour leurs locations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-blue-200 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-600">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};