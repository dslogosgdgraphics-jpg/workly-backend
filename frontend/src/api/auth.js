import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  
  login: (data) => api.post('/auth/login', data),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data) => api.put('/auth/me', data),
};