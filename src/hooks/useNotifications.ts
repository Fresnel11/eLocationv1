import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationsService, Notification } from '../services/notificationsService';
import { pushNotificationService } from '../services/pushNotificationService';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      initializeNotifications();
      initializeSocket();
      initializePushNotifications();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, token]);

  const initializeNotifications = async () => {
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationsService.getNotifications(1, 50),
        notificationsService.getUnreadCount(),
      ]);
      
      setNotifications(notificationsData.data);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const initializeSocket = () => {
    if (!token) return;

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connecté aux notifications en temps réel');
    });

    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Afficher une notification native si l'utilisateur n'est pas sur la page
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/assets/elocation-512.png',
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté des notifications');
    });

    setSocket(newSocket);
  };

  const initializePushNotifications = async () => {
    try {
      await pushNotificationService.initialize();
      
      if (await pushNotificationService.requestPermission()) {
        const isSubscribed = await pushNotificationService.isSubscribed();
        if (!isSubscribed) {
          await pushNotificationService.subscribe();
        }
      }
    } catch (error) {
      console.error('Erreur initialisation push notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: Implémenter l'endpoint de suppression
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: initializeNotifications,
  };
};