import axios from './axios';

export const authAPI = {
  register: async (data) => {
    try {
      const response = await axios.post('/auth/register', data);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Alias for lowercase "Api"
export const authApi = authAPI;

export default authAPI;