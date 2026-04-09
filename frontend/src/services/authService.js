import api from "./api";

const TOKEN_KEY = "auth_token";

const getApiErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback;
};

export const authService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  startGoogleLogin() {
    const backendUrl =
      process.env.REACT_APP_BACKEND_URL ||
      process.env.REACT_APP_API_URL ||
      "http://localhost:8080";
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  },

  async loginWithPassword({ email, password }) {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data?.data || {};
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Login failed"));
    }
  },

  async register({ name, email, password, role }) {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const data = response.data?.data || {};
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Registration failed"));
    }
  },

  async getMe() {
    try {
      const response = await api.get("/auth/me");
      return response.data?.data || null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Not authenticated"));
    }
  },

  async selectRole(role) {
    try {
      const response = await api.put("/auth/role", { role });
      const data = response.data?.data || {};
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to set role"));
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore logout API failures and clear local auth anyway.
    } finally {
      this.clearToken();
    }
    return { success: true };
  },
};
