import { Home, Car, Zap, Calendar, Package, Bed, Bath } from 'lucide-react';

export const getCategoryIcon = (categoryName: string, size: number = 16) => {
  const iconProps = { size, className: `h-${size/4} w-${size/4}` };
  
  switch (categoryName?.toLowerCase()) {
    case 'immobilier':
      return <Home {...iconProps} />;
    case 'véhicules':
      return <Car {...iconProps} />;
    case 'électroménager':
      return <Zap {...iconProps} />;
    case 'événementiel':
      return <Calendar {...iconProps} />;
    default:
      return <Package {...iconProps} />;
  }
};

export const getPropertyIcon = (type: string, value: number | string) => {
  const iconProps = { size: 16, className: 'h-4 w-4' };
  
  if (type === 'bedrooms' && value) {
    return <Bed {...iconProps} />;
  }
  if (type === 'bathrooms' && value) {
    return <Bath {...iconProps} />;
  }
  return null;
};