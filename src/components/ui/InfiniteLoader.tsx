import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface InfiniteLoaderProps {
  loading: boolean;
  hasMore: boolean;
  error?: string;
}

export const InfiniteLoader: React.FC<InfiniteLoaderProps> = ({ loading, hasMore, error }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-red-500 mb-2">Erreur de chargement</div>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex items-center gap-3 mb-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">Chargement...</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-gray-600 font-medium mb-1">Vous avez tout vu !</p>
        <p className="text-gray-500 text-sm">Toutes les annonces ont été chargées</p>
      </div>
    );
  }

  return null;
};