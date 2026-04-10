import api from './api';

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getCurrentRoleFromToken() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    return decoded?.role ?? null;
  } catch {
    return null;
  }
}

export const ticketService = {
  async getMy() {
    const response = await api.get('/tickets/my');
    return unwrapData(response);
  },

  async getAll(params = {}) {
    try {
      const response = await api.get('/tickets', { params });
      return unwrapData(response);
    } catch (error) {
      const role = getCurrentRoleFromToken();
      const shouldFallbackToMy = error?.response?.status === 500 && role === 'USER';

      if (!shouldFallbackToMy) {
        throw error;
      }

      const myResponse = await api.get('/tickets/my');
      return unwrapData(myResponse);
    }
  },

  async getById(id) {
    const response = await api.get(`/tickets/${id}`);
    return unwrapData(response);
  },

  async create(formData) {
    const response = await api.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapData(response);
  },

  async updateStatus(id, status, notes) {
    const response = await api.put(`/tickets/${id}/status`, {
      status,
      resolution_notes: notes,
    });
    return unwrapData(response);
  },

  async assign(id, technicianId) {
    const response = await api.put(`/tickets/${id}/assign`, {
      technician_id: technicianId,
    });
    return unwrapData(response);
  },

  async addComment(id, text) {
    const response = await api.post(`/tickets/${id}/comments`, { text });
    return unwrapData(response);
  },

  async deleteComment(id, commentId) {
    const response = await api.delete(`/tickets/${id}/comments/${commentId}`);
    return unwrapData(response);
  },

  async escalate(id) {
    const response = await api.post(`/tickets/${id}/escalate`);
    return unwrapData(response);
  },
};
