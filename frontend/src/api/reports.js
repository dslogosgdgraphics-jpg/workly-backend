import axios from './axios';

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

export const reportsAPI = {
  getDashboard,
  getAttendanceReport,
  getPayrollReport
};

export const reportApi = reportsAPI;
export const reportsApi = reportsAPI;

export default reportsAPI;