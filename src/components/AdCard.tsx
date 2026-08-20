import React from 'react';
import { MapPin, Calendar, Eye } from 'lucide-react';
import { Ad } from '../types/ad';
import SaveForOfflineButton from './SaveForOfflineButton';
import { API_URL } from '../config/env';

interface AdCardProps {
  ad: Ad;
  onClick?: () => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  return (
    <div 
      className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
        {ad.photos && ad.photos.length > 0 && (
          <img 
            src={ad.photos[0].startsWith('http') 
              ? ad.photos[0] 
              : `${API_URL}${ad.photos[0]}`
            }
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-95 transition-all duration-500"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';
            }}
          />
        )}
        <div className="absolute top-3 right-3 z-10">
          <SaveForOfflineButton adId={ad.id} compact />
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {ad.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-slate-500 mb-3 text-xs font-medium">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="truncate">{ad.location}</span>
        </div>
        
        <p className="text-xl font-extrabold text-blue-600 mb-3 tracking-tight">
          {ad.price.toLocaleString()} <span className="text-xs font-bold text-blue-600/80">FCFA</span>
        </p>
        
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>{ad.views || 0} vues</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;