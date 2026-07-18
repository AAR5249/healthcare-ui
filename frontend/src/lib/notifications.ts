import api from './api';
import { Notification } from '@/types';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const response = await api.get(`/notifications/${userId}`);
    return response.data.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const response = await api.patch(`/notifications/${userId}/read-all`);
    return response.data.data;
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
