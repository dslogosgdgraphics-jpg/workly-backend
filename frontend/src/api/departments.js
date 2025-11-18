import api from './axios';

export const departmentApi = {
  getAll: () => api.get('/departments'),
  
  getHierarchy: () => api.get('/departments/hierarchy'),
  
  create: (data) => api.post('/departments', data),
  
  update: (id, data) => api.put(`/departments/${id}`, data),
  
  delete: (id) => api.delete(`/departments/${id}`),
};