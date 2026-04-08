import api from './api';

export const notificationService = {
  async getAll() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllRead() {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },
};
