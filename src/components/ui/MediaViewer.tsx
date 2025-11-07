import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: Array<{ url: string; type: 'image' | 'video' }>;
  initialIndex?: number;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < media.length - 1;

  const goToPrev = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(false);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-white text-sm">
          {currentIndex + 1} / {media.length}
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      {canGoPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {canGoNext && (
        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Media Content */}
      <div 
        className="max-w-[95vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt={`Media ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{ maxWidth: '95vw', maxHeight: '90vh' }}
          />
        ) : (
          <div className="relative">
            <video
              src={currentMedia.url}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{ maxWidth: '95vw', maxHeight: '90vh' }}
              controls
              autoPlay={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white' 
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};