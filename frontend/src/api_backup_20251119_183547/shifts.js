import axios from './axios';

export const getShifts = async (params) => {
  try {
    const response = await axios.get('/shifts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

export const getShiftById = async (id) => {
  try {
    const response = await axios.get(`/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shift:', error);
    throw error;
  }
};

export const createShift = async (data) => {
  try {
    const response = await axios.post('/shifts', data);
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

export const updateShift = async (id, data) => {
  try {
    const response = await axios.put(`/shifts/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating shift:', error);
    throw error;
  }
};

export const deleteShift = async (id) => {
  try {
    const response = await axios.delete(`/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shift:', error);
    throw error;
  }
};

export const shiftsAPI = {
  getAll: getShifts,
  getById: getShiftById,
  create: createShift,
  update: updateShift,
  delete: deleteShift,
};

export const shiftApi = shiftsAPI;
export const shiftsApi = shiftsAPI;

export default shiftsAPI;