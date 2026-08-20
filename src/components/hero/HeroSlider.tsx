import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Search, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
// import logoImage from '../../assets/e_location.png';

const slides = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Trouvez votre maison idéale',
    subtitle: 'Des milliers de logements disponibles à travers tout le Bénin',
    category: 'Immobilier'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Louez une voiture facilement',
    subtitle: 'Véhicules fiables pour tous vos déplacements',
    category: 'Transport'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Équipements électroménagers',
    subtitle: 'Tout ce dont vous avez besoin pour votre foyer',
    category: 'Électroménager'
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Organisez vos événements',
    subtitle: 'Matériel et équipements pour des événements réussis',
    category: 'Événementiel'
  }
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    // Précharger les images
    slides.forEach((slide, index) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.src = slide.image;
    });
  }, []);

  useEffect(() => {
    if (imagesLoaded.every(loaded => loaded)) {
      setAllImagesLoaded(true);
    }
  }, [imagesLoaded]);

  useEffect(() => {
    if (!allImagesLoaded) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [allImagesLoaded]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative min-h-[85vh] sm:min-h-screen overflow-hidden bg-slate-950">
      {/* Loader */}
      {!allImagesLoaded && (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-slate-300">Chargement de votre expérience...</p>
          </div>
        </div>
      )}

      {/* Background Images avec dégradés fluides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 transform ${
              index === currentSlide && allImagesLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.category}
              className="w-full h-full object-cover object-center"
            />
            {/* Multi-layered Vignette & Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40"></div>
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/30 to-slate-950/80"></div>
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className={`relative z-10 h-full min-h-[85vh] sm:min-h-screen flex items-center justify-center pt-16 pb-20 transition-all duration-700 ${
        allImagesLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="space-y-8">
            
            {/* Top Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-glass animate-pulse-glow">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                Plateforme N°1 au Bénin
              </span>
              
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-600/85 backdrop-blur-md text-white shadow-md shadow-blue-500/30 border border-blue-400/30">
                {currentSlideData.category}
              </span>
            </div>
            
            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
              {currentSlideData.title.includes('maison') ? (
                <>Trouvez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">maison idéale</span></>
              ) : currentSlideData.title.includes('voiture') ? (
                <>Louez une <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">voiture facilement</span></>
              ) : currentSlideData.title.includes('électroménagers') ? (
                <>Équipements <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-300">électroménagers</span></>
              ) : (
                <>Organisez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-rose-300">événements</span></>
              )}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-2xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed text-balance">
              {currentSlideData.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-2xl shadow-glow-md hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]" 
                asChild
              >
                <Link to="/ads" className="flex items-center justify-center">
                  <Search className="h-5 w-5 mr-2.5 transition-transform duration-300 group-hover:scale-110" />
                  Trouver une annonce
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/25 text-white hover:bg-white hover:text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-glass" 
                asChild
              >
                <Link to="/login" className="flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 mr-2.5" />
                  Publier gratuitement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10 transition-opacity duration-500 ${
        allImagesLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Aller au slide ${index + 1}`}
            className={`transition-all duration-300 ${
              index === currentSlide 
                ? 'w-8 h-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full shadow-glow-sm' 
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70 rounded-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
};