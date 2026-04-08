// import api from './api';

export const authService = {
  async createSession(sessionId) {
    // ---- GOOGLE OAUTH COMMENTED OUT TEMPORARILY ----
    // const response = await api.post('/auth/session', { session_id: sessionId });
    // return response.data;
    return { success: true };
  },

  async getMe() {
    // ---- GOOGLE OAUTH COMMENTED OUT TEMPORARILY ----
    // const response = await api.get('/auth/me');
    // return response.data;
    
    // DUMMY LOGIN: read from local storage
    const dummyUser = localStorage.getItem('dummy_user');
    if (dummyUser) {
      return JSON.parse(dummyUser);
    }
    throw new Error('Not authenticated');
  },

  async selectRole(role) {
    // ---- GOOGLE OAUTH COMMENTED OUT TEMPORARILY ----
    // const response = await api.post('/auth/select-role', { role });
    // return response.data;

    // DUMMY LOGIN: save role in local storage
    const dummyUser = { id: 1, name: 'Dummy User', email: 'dummy@example.com', role };
    localStorage.setItem('dummy_user', JSON.stringify(dummyUser));
    return dummyUser;
  },

  async logout() {
    // ---- GOOGLE OAUTH COMMENTED OUT TEMPORARILY ----
    // const response = await api.post('/auth/logout');
    // return response.data;

    // DUMMY LOGIN: remove from local storage
    localStorage.removeItem('dummy_user');
    return { success: true };
  },
};