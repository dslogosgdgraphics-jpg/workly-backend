import api from './axios';

export const payrollApi = {
  getAll: (params) => api.get('/payroll', { params }),
  
  getById: (id) => api.get(`/payroll/${id}`),
  
  generate: (data) => api.post('/payroll/generate', data),
  
  update: (id, data) => api.put(`/payroll/${id}`, data),
  
  updateStatus: (id, status) => api.put(`/payroll/${id}/status`, { status }),
  
  delete: (id) => api.delete(`/payroll/${id}`),
};