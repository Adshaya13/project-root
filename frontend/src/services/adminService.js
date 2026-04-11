import api from './api';

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

export const adminService = {
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return unwrapData(response);
  },

  async updateUser(userId, payload) {
    const response = await api.put(`/admin/users/${userId}`, payload);
    return unwrapData(response);
  },

  async getUserDetails(userId) {
    const response = await api.get(`/admin/users/${userId}`);
    return unwrapData(response);
  },

  async updateUserStatus(userId, status) {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return unwrapData(response);
  },

  async suspendUser(userId) {
    const response = await api.put(`/admin/users/${userId}/suspend`);
    return unwrapData(response);
  },

  async activateUser(userId) {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return unwrapData(response);
  },
};
