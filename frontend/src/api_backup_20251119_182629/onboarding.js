import axios from './axios';

export const getOnboardingTasks = async (params) => {
  try {
    const response = await axios.get('/onboarding', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching onboarding tasks:', error);
    throw error;
  }
};

export const getOnboardingById = async (id) => {
  try {
    const response = await axios.get(`/onboarding/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching onboarding:', error);
    throw error;
  }
};

export const createOnboarding = async (data) => {
  try {
    const response = await axios.post('/onboarding', data);
    return response.data;
  } catch (error) {
    console.error('Error creating onboarding:', error);
    throw error;
  }
};

export const updateOnboarding = async (id, data) => {
  try {
    const response = await axios.put(`/onboarding/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating onboarding:', error);
    throw error;
  }
};

export const deleteOnboarding = async (id) => {
  try {
    const response = await axios.delete(`/onboarding/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting onboarding:', error);
    throw error;
  }
};

export const onboardingAPI = {
  getAll: getOnboardingTasks,
  getById: getOnboardingById,
  create: createOnboarding,
  update: updateOnboarding,
  delete: deleteOnboarding,
};

export const onboardingApi = onboardingAPI;

export default onboardingAPI;