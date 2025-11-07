import { api } from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  async getNotifications(page = 1, limit = 20) {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  async markAsRead(notificationId: string) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },
};