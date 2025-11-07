import React from 'react';

import { useNotifications } from '../../context/NotificationContext';
import { X, Bell } from 'lucide-react';

export const NotificationsManagement: React.FC = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Gérez vos notifications système</p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-500">Vous n'avez aucune notification pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Marquer comme lu
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};