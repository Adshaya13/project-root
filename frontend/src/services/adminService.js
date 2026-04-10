import api from './api';

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

export const adminService = {
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return unwrapData(response);
  },

  async updateRole(userId, role) {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return unwrapData(response);
  },
};
