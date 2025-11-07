import React from 'react';

export const AdCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded mb-2"></div>
        
        {/* Location */}
        <div className="flex items-center mb-3">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Details */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-4 w-8 bg-gray-200 rounded"></div>
          <div className="h-4 w-8 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
          <div className="h-4 w-8 bg-gray-200 rounded ml-auto"></div>
        </div>
        
        {/* Amenities */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-7 h-7 bg-gray-200 rounded-md"></div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const AdCardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <AdCardSkeleton key={index} />
      ))}
    </div>
  );
};