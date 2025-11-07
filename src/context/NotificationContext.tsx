import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { websocketService } from '../services/websocketService';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read?: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Charger les notifications existantes
    loadNotifications();

    // Connexion WebSocket avec délai pour éviter les conflits
    const connectTimeout = setTimeout(() => {
      if (!websocketService.isConnected) {
        websocketService.connect();
      }
    }, 1000);

    const handleConnect = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    const handleConnected = (data: any) => {
      console.log('WebSocket authenticated:', data);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    const handleNotification = (notification: Notification) => {
      console.log('Notification reçue:', notification);
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Garder max 50
      setUnreadCount(prev => prev + 1);
      
      // Notification browser si permission accordée
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    };

    const handleNewVerification = (verification: any) => {
      console.log('Nouvelle vérification reçue:', verification);
      // Ajouter à window pour que AdminVerificationPage puisse l'écouter
      window.dispatchEvent(new CustomEvent('new_verification', { detail: verification }));
    };

    // Écouter les événements WebSocket
    websocketService.on('connect', handleConnect);
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnect', handleDisconnect);
    websocketService.on('error', handleError);
    websocketService.on('notification', handleNotification);
    websocketService.on('new_verification', handleNewVerification);

    // Demander permission pour notifications browser
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      clearTimeout(connectTimeout);
      websocketService.off('connect', handleConnect);
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnect', handleDisconnect);
      websocketService.off('error', handleError);
      websocketService.off('notification', handleNotification);
      websocketService.off('new_verification', handleNewVerification);
      // Ne pas déconnecter automatiquement pour éviter les conflits
      // websocketService.disconnect();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:3000/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === id);
          return notification && !notification.read ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:3000/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        
        // Compter les non lues
        const unread = (data.data || []).filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isConnected,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};