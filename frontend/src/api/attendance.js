import axios from './axios';

// Individual function exports
export const getAttendance = async (params) => {
  try {
    const response = await axios.get('/attendance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const getTodayStatus = async () => {
  try {
    const response = await axios.get('/attendance/today/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching today status:', error);
    throw error;
  }
};

export const checkIn = async () => {
  try {
    const response = await axios.post('/attendance/checkin');
    return response.data;
  } catch (error) {
    console.error('Error checking in:', error);
    throw error;
  }
};

export const checkOut = async () => {
  try {
    const response = await axios.post('/attendance/checkout');
    return response.data;
  } catch (error) {
    console.error('Error checking out:', error);
    throw error;
  }
};

export const markAttendance = async (attendanceData) => {
  try {
    const response = await axios.post('/attendance', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

export const deleteAttendance = async (id) => {
  try {
    const response = await axios.delete(`/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};

// Object export (uppercase API)
export const attendanceAPI = {
  getAll: getAttendance,
  getTodayStatus,
  checkIn,
  checkOut,
  markAttendance,
  delete: deleteAttendance,
};

// Alias for lowercase "Api" (for Dashboard.jsx compatibility)
export const attendanceApi = attendanceAPI;

// Default export
<<<<<<< HEAD
export default attendanceAPI;
=======
export default attendanceAPI;
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
