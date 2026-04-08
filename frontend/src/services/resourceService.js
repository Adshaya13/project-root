import api from './api';

export const resourceService = {
  async getAll(params = {}) {
    const response = await api.get('/resources', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/resources', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};
