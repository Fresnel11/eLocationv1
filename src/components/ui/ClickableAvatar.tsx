import React, { useState } from 'react';
import { AvatarPreviewModal } from './AvatarPreviewModal';

interface ClickableAvatarProps {
  avatarUrl?: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ClickableAvatar: React.FC<ClickableAvatarProps> = ({
  avatarUrl,
  userName,
  size = 'md',
  className = ''
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const handleClick = () => {
    if (avatarUrl) {
      setShowPreview(true);
    }
  };

  const fullAvatarUrl = avatarUrl ? 
    (avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:3000${avatarUrl}`) : '';

  return (
    <>
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ${avatarUrl ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={handleClick}
      >
        {fullAvatarUrl ? (
          <img
            src={fullAvatarUrl}
            alt={`Avatar de ${userName}`}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white font-bold">
            {userName?.[0]?.toUpperCase() || 'U'}
          </span>
        )}
      </div>

      {fullAvatarUrl && (
        <AvatarPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          avatarUrl={fullAvatarUrl}
          userName={userName}
        />
      )}
    </>
  );
};