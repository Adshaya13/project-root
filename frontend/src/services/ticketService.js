import api from './api';

export const ticketService = {
  async getMy() {
    const response = await api.get('/tickets/my');
    return response.data;
  },

  async getAll(params = {}) {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  async create(formData) {
    const response = await api.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateStatus(id, status, notes) {
    const response = await api.put(`/tickets/${id}/status`, {
      status,
      resolution_notes: notes,
    });
    return response.data;
  },

  async assign(id, technicianId) {
    const response = await api.put(`/tickets/${id}/assign`, {
      technician_id: technicianId,
    });
    return response.data;
  },

  async addComment(id, text) {
    const response = await api.post(`/tickets/${id}/comments`, { text });
    return response.data;
  },

  async deleteComment(id, commentId) {
    const response = await api.delete(`/tickets/${id}/comments/${commentId}`);
    return response.data;
  },

  async escalate(id) {
    const response = await api.post(`/tickets/${id}/escalate`);
    return response.data;
  },
};
