import axios from './axios';

// Individual function exports
export const getDashboard = async () => {
  try {
    const response = await axios.get('/reports/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

export const getAttendanceReport = async (params) => {
  try {
    const response = await axios.get('/reports/attendance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    throw error;
  }
};

export const getPayrollReport = async (params) => {
  try {
    const response = await axios.get('/reports/payroll', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payroll report:', error);
    throw error;
  }
};

export const getLeaveReport = async (params) => {
  try {
    const response = await axios.get('/reports/leave', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching leave report:', error);
    throw error;
  }
};

export const getEmployeeReport = async (params) => {
  try {
    const response = await axios.get('/reports/employee', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employee report:', error);
    throw error;
  }
};

<<<<<<< HEAD
export const exportReport = async (type, params) => {
  try {
    const response = await axios.get(`/reports/export/${type}`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};

=======
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
// Object export (uppercase API)
export const reportsAPI = {
  getDashboard,
  getAttendanceReport,
  getPayrollReport,
  getLeaveReport,
  getEmployeeReport,
<<<<<<< HEAD
  exportReport,
=======
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
};

// Alias for lowercase "Api" (for Dashboard.jsx compatibility)
export const reportApi = reportsAPI;
<<<<<<< HEAD
export const reportsApi = reportsAPI;

// Default export
export default reportsAPI;
=======

// Default export
export default reportsAPI;
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
