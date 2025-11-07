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
    <div className="relative h-screen overflow-hidden">
      {/* Loader */}
      {!allImagesLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Chargement...</p>
          </div>
        </div>
      )}

      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide && allImagesLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.category}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className={`relative z-10 h-full flex items-center justify-center transition-opacity duration-500 ${
        allImagesLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentSlideData.category}
              </span>
            </div>
            
            {/* <div className="mb-6">
              <img src={logoImage} alt="eLocation Bénin" className="h-16 w-auto mx-auto mb-4" />
            </div> */}
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {currentSlideData.title}
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {currentSlideData.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" asChild>
                <Link to="/ads" className="flex items-center justify-center">
                  <Search className="h-5 w-5 mr-2" />
                  Chercher une annonce
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3" asChild>
                <Link to="/login" className="flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Publier une annonce
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 transition-opacity duration-500 ${
        allImagesLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};