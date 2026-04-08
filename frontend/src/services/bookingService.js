import api from './api';

export const bookingService = {
  async getMyBookings() {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  async getAll(params = {}) {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  async create(data) {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async approve(id) {
    const response = await api.put(`/bookings/${id}/approve`);
    return response.data;
  },

  async reject(id, reason) {
    const response = await api.put(`/bookings/${id}/reject`, { reason });
    return response.data;
  },

  async cancel(id) {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};
