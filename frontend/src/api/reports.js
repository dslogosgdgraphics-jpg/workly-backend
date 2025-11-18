import api from './axios';

export const reportApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  
  getAttendance: (params) => api.get('/reports/attendance', { params }),
  
  getPayroll: (params) => api.get('/reports/payroll', { params }),
};