import api from './axios';

export const attendanceApi = {
  getAll: (params) => api.get('/attendance', { params }),
  
  checkIn: () => api.post('/attendance/checkin'),
  
  checkOut: () => api.post('/attendance/checkout'),
  
  getTodayStatus: () => api.get('/attendance/today/status'),
  
  markAttendance: (data) => api.post('/attendance', data),
  
  delete: (id) => api.delete(`/attendance/${id}`),
};