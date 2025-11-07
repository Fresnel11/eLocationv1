import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from './Button';
import { cookieUtils } from '../../utils/cookies';

export const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const hasConsented = cookieUtils.get('cookieConsent');
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    cookieUtils.set('cookieConsent', 'accepted', 365);
    setShowConsent(false);
  };

  const handleDecline = () => {
    cookieUtils.set('cookieConsent', 'declined', 365);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Nous utilisons des cookies</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience, mémoriser vos préférences et analyser notre trafic. 
                  En continuant, vous acceptez notre utilisation des cookies.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="w-full sm:w-auto text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Refuser
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Accepter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};