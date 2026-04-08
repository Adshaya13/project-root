import api from './api';

export const authService = {
  async createSession(sessionId) {
    const response = await api.post('/auth/session', { session_id: sessionId });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async selectRole(role) {
    const response = await api.post('/auth/select-role', { role });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};