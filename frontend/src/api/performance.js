import axios from './axios';

export const getPerformanceReviews = async (params) => {
  try {
    const response = await axios.get('/performance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    throw error;
  }
};

export const getPerformanceById = async (id) => {
  try {
    const response = await axios.get(`/performance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching performance review:', error);
    throw error;
  }
};

export const createPerformance = async (data) => {
  try {
    const response = await axios.post('/performance', data);
    return response.data;
  } catch (error) {
    console.error('Error creating performance review:', error);
    throw error;
  }
};

export const updatePerformance = async (id, data) => {
  try {
    const response = await axios.put(`/performance/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating performance review:', error);
    throw error;
  }
};

export const deletePerformance = async (id) => {
  try {
    const response = await axios.delete(`/performance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting performance review:', error);
    throw error;
  }
};

export const performanceAPI = {
  getAll: getPerformanceReviews,
  getById: getPerformanceById,
  create: createPerformance,
  update: updatePerformance,
  delete: deletePerformance,
};

export const performanceApi = performanceAPI;

export default performanceAPI;