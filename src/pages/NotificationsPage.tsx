import React, { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, Bell, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}j`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'booking_confirmed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'booking_cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'booking_expired': return <Clock className="h-5 w-5 text-orange-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg p-4 shadow-sm border ${
                  !notification.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      if (notification.data?.bookingId) {
                        navigate('/bookings');
                      }
                    }}
                  >
                    <p className="font-medium text-gray-900 mb-1">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === notification.id ? null : notification.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                      {activeDropdown === notification.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)}
                          />
                          <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </div>
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