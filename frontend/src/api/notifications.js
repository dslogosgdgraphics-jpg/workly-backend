import api from './axios';

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  delete: (id) => api.delete(`/notifications/${id}`),
};