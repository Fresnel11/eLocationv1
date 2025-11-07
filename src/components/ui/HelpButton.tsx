import React, { useState } from 'react';
import { HelpCircle, MessageCircle, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatWidget } from './ChatWidget';
import { useAuth } from '../../context/AuthContext';

export const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { user } = useAuth();

  const helpOptions = [
    {
      title: 'Centre d\'aide',
      description: 'FAQ et guides',
      icon: HelpCircle,
      link: '/faq'
    },
    {
      title: 'Chat support',
      description: 'Aide en direct',
      icon: MessageCircle,
      action: () => {
        setShowChat(true);
        setIsOpen(false);
      }
    },

  ];

  const isMobile = window.innerWidth < 1024;
  const shouldHideOnMobile = user && isMobile;

  return (
    <>
      {/* Indicateur sur le bord gauche quand caché sur mobile */}
      {shouldHideOnMobile && isHidden && (
        <div 
          className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer"
          onClick={() => setIsHidden(false)}
        >
          <div className="bg-blue-600 text-white p-2 rounded-r-lg shadow-lg">
            <HelpCircle className="h-4 w-4" />
          </div>
        </div>
      )}

      <div className={`fixed bottom-6 left-6 z-40 transition-transform duration-300 ${
        shouldHideOnMobile && isHidden ? 'lg:translate-x-0 lg:opacity-100 -translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}>
        {isOpen && (
          <div className="mb-4 bg-white rounded-lg shadow-lg border p-2 min-w-48">
            {helpOptions.map((option) => {
              const Icon = option.icon;
              const content = (
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors cursor-pointer">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{option.title}</p>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </div>
                </div>
              );

              return option.link ? (
                <Link key={option.title} to={option.link} onClick={() => setIsOpen(false)}>
                  {content}
                </Link>
              ) : (
                <div key={option.title} onClick={option.action}>
                  {content}
                </div>
              );
            })}
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${
              isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <HelpCircle className="h-6 w-6" />
            )}
          </button>
          
          {/* Bouton X pour cacher sur mobile quand utilisateur connecté */}
          {shouldHideOnMobile && !isHidden && (
            <button
              onClick={() => {
                setIsHidden(true);
                setIsOpen(false);
              }}
              className="lg:hidden absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {showChat && (
        <ChatWidget onClose={() => setShowChat(false)} />
      )}
    </>
  );
};