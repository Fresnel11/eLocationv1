import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSlider } from '../components/hero/HeroSlider';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { CTASection } from '../components/sections/CTASection';
import { RecommendationsSection } from '../components/ui/RecommendationsSection';

/**
 * Identifiants d'ancre de la page d'accueil.
 * Repris par la barre de navigation (voir LANDING_ANCHORS dans AppTopBar) :
 * modifier une valeur ici sans l'y répercuter casserait le lien correspondant.
 */
export const LANDING_SECTIONS = {
  categories: 'categories',
  howItWorks: 'devenir-demarcheur',
  testimonials: 'temoignages',
} as const;

export const LandingPage: React.FC = () => {
  const { hash } = useLocation();

  // Arrivée depuis une autre page via /#ancre : React Router ne défile pas
  // jusqu'au fragment, il faut le faire à l'affichage.
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <>
      <HeroSlider />

      {/* scroll-mt : compense l'en-tête collant, sinon le titre de section
          se retrouve caché dessous à l'arrivée sur l'ancre. */}
      <section id={LANDING_SECTIONS.categories} className="scroll-mt-24">
        <CategoriesSection />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RecommendationsSection />
      </div>

      <section id={LANDING_SECTIONS.howItWorks} className="scroll-mt-24">
        <HowItWorksSection />
      </section>

      <section id={LANDING_SECTIONS.testimonials} className="scroll-mt-24">
        <TestimonialsSection />
      </section>

      <CTASection />
    </>
  );
};
