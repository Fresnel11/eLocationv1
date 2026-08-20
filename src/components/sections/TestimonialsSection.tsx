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
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-amber-300 ring-1 ring-white/20 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
              Avis & Témoignages
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
            Ce que dit notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">communauté</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Des milliers de Béninois font quotidiennement confiance à eLocation pour louer et publier en toute sérénité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full rounded-3xl border border-white/10 bg-slate-800/60 backdrop-blur-xl shadow-xl hover:shadow-glow-sm hover:-translate-y-1.5 transition-all duration-300">
              <CardContent className="p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Quote className="h-10 w-10 text-blue-500/40" />
                    <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-slate-200 text-base mb-8 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </div>
                
                <div className="flex items-center pt-4 border-t border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 font-bold text-white shadow-md text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{testimonial.name}</p>
                    <p className="text-xs font-semibold text-blue-400">{testimonial.role} • <span className="text-slate-400">{testimonial.location}</span></p>
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