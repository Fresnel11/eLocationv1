import React from 'react';
import { HeroSlider } from '../components/hero/HeroSlider';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { CTASection } from '../components/sections/CTASection';
import { RecommendationsSection } from '../components/ui/RecommendationsSection';

export const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSlider />
      <CategoriesSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RecommendationsSection />
      </div>
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};