import api from './api';

const unwrapApiData = (response) => {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
};

export const bookingService = {
  async getMyBookings() {
    const response = await api.get('/bookings/my');
    return unwrapApiData(response);
  },

  async getAll(params = {}) {
    const response = await api.get('/bookings', { params });
    return unwrapApiData(response);
  },

  async create(data) {
    const response = await api.post('/bookings', data);
    return unwrapApiData(response);
  },

  async approve(id) {
    const response = await api.put(`/bookings/${id}/approve`);
    return unwrapApiData(response);
  },

  async reject(id, reason) {
    const response = await api.put(`/bookings/${id}/reject`, { reason });
    return unwrapApiData(response);
  },

  async cancel(id) {
    const response = await api.put(`/bookings/${id}/cancel`);
    return unwrapApiData(response);
  },
};
