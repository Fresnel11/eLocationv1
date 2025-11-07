import React, { useState } from 'react';
import { Share2, Facebook, Twitter, MessageCircle, Send, Link, Copy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface ShareButtonProps {
  adId: string;
  title: string;
  description: string;
  imageUrl?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  adId,
  title,
  description,
  imageUrl,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { success } = useToast();

  const shareUrl = `${window.location.origin}/annonce/${adId}`;
  const shareText = `${title} - ${description.substring(0, 100)}...`;

  const trackShare = async (platform: string) => {
    try {
      await api.post('/social/share', { adId, platform });
    } catch (error) {
      console.error('Erreur tracking partage:', error);
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        trackShare('facebook');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        trackShare('twitter');
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        trackShare('whatsapp');
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
      }
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        trackShare('telegram');
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
      }
    },
    {
      name: 'Copier le lien',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        trackShare('link');
        navigator.clipboard.writeText(shareUrl);
        success('Lien copié !', 'Le lien a été copié dans le presse-papiers');
        setIsOpen(false);
      }
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        trackShare('native');
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Partager</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 min-w-48">
            <div className="p-3 border-b">
              <h3 className="font-medium text-gray-900">Partager cette annonce</h3>
            </div>
            <div className="p-2">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className={`p-2 rounded-full text-white ${option.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};