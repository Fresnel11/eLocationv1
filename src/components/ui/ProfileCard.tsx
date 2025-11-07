import React from 'react';
import { User, Camera, Shield, Star, Award } from 'lucide-react';

interface ProfileCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    profile?: {
      avatar?: string;
      bio?: string;
      verificationStatus: 'pending' | 'verified' | 'rejected';
      badges: string[];
      totalBookings: number;
      averageRating: number;
    };
  };
  isOwner?: boolean;
  onEditProfile?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, isOwner, onEditProfile }) => {
  const getVerificationBadge = () => {
    if (!user.profile?.verificationStatus || user.profile.verificationStatus === 'pending') {
      return null;
    }
    
    if (user.profile.verificationStatus === 'verified') {
      return (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
          <Shield className="h-3 w-3" />
          Vérifié
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
        <Shield className="h-3 w-3" />
        Non vérifié
      </div>
    );
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'verified': return <Shield className="h-4 w-4" />;
      case 'top_host': return <Award className="h-4 w-4" />;
      case 'experienced': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case 'verified': return 'Identité vérifiée';
      case 'top_host': return 'Hôte de confiance';
      case 'experienced': return 'Expérimenté';
      default: return badge;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-start gap-4">
        <div className="relative">
          {user.profile?.avatar ? (
            <img
              src={user.profile.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
          )}
          {isOwner && (
            <button
              onClick={onEditProfile}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            {getVerificationBadge()}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
          
          {user.profile?.bio && (
            <p className="text-gray-700 mb-4">{user.profile.bio}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{user.profile?.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <div>
              {user.profile?.totalBookings || 0} réservation{(user.profile?.totalBookings || 0) > 1 ? 's' : ''}
            </div>
          </div>
          
          {user.profile?.badges && user.profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.profile.badges.filter(badge => badge).map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                >
                  {getBadgeIcon(badge)}
                  {getBadgeLabel(badge)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};