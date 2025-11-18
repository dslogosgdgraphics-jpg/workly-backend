import api from './axios';

export const documentApi = {
  getAll: (params) => api.get('/documents', { params }),
  
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  delete: (id) => api.delete(`/documents/${id}`),
  
  acknowledge: (id, signature) => api.post(`/documents/${id}/acknowledge`, { signature }),
};