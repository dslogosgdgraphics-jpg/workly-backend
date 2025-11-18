import api from './axios';

export const leaveApi = {
  getAll: (params) => api.get('/leaves', { params }),
  
  getById: (id) => api.get(`/leaves/${id}`),
  
  apply: (data) => api.post('/leaves', data),
  
  approve: (id, notes) => api.put(`/leaves/${id}/approve`, { notes }),
  
  reject: (id, notes) => api.put(`/leaves/${id}/reject`, { notes }),
  
  delete: (id) => api.delete(`/leaves/${id}`),
};