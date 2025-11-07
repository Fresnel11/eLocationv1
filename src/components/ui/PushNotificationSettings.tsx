import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { Button } from './Button';
import { pushNotificationService } from '../../services/pushNotificationService';
import { useToast } from '../../context/ToastContext';

export const PushNotificationSettings: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    checkSupport();
    checkSubscriptionStatus();
  }, []);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (isSupported) {
      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const hasPermission = await pushNotificationService.requestPermission();
      if (!hasPermission) {
        error('Permission refusée', 'Vous devez autoriser les notifications pour continuer');
        return;
      }

      const subscription = await pushNotificationService.subscribe();
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        success('Notifications activées', 'Vous recevrez maintenant des notifications push');
      } else {
        error('Erreur', 'Impossible d\'activer les notifications push');
      }
    } catch (err) {
      error('Erreur', 'Une erreur est survenue lors de l\'activation des notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
        success('Notifications désactivées', 'Vous ne recevrez plus de notifications push');
      } else {
        error('Erreur', 'Impossible de désactiver les notifications push');
      }
    } catch (err) {
      error('Erreur', 'Une erreur est survenue lors de la désactivation des notifications');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 text-gray-600">
          <BellOff className="h-5 w-5" />
          <div>
            <p className="font-medium">Notifications push non supportées</p>
            <p className="text-sm">Votre navigateur ne supporte pas les notifications push</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">Notifications push</h3>
            <p className="text-sm text-gray-600">
              {isSubscribed 
                ? 'Recevez des notifications instantanées sur votre appareil'
                : 'Activez les notifications pour ne rien manquer'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {permission === 'denied' && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              Bloquées
            </span>
          )}
          
          {isSubscribed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsubscribe}
              loading={loading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <BellOff className="h-4 w-4 mr-1" />
              Désactiver
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubscribe}
              loading={loading}
              disabled={permission === 'denied'}
            >
              <Bell className="h-4 w-4 mr-1" />
              Activer
            </Button>
          )}
        </div>
      </div>
      
      {permission === 'denied' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            Les notifications sont bloquées. Vous pouvez les réactiver dans les paramètres de votre navigateur.
          </p>
        </div>
      )}
    </div>
  );
};