import axios from './axios';

export const getLeaves = async (params) => {
  try {
    const response = await axios.get('/leaves', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching leaves:', error);
    throw error;
  }
};

export const getLeaveById = async (id) => {
  try {
    const response = await axios.get(/leaves/);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave:', error);
    throw error;
  }
};

export const applyLeave = async (leaveData) => {
  try {
    const response = await axios.post('/leaves', leaveData);
    return response.data;
  } catch (error) {
    console.error('Error applying for leave:', error);
    throw error;
  }
};

export const approveLeave = async (id, notes = '') => {
  try {
    const response = await axios.put(/leaves//approve, { notes });
    return response.data;
  } catch (error) {
    console.error('Error approving leave:', error);
    throw error;
  }
};

export const rejectLeave = async (id, notes = '') => {
  try {
    const response = await axios.put(/leaves//reject, { notes });
    return response.data;
  } catch (error) {
    console.error('Error rejecting leave:', error);
    throw error;
  }
};

export const deleteLeave = async (id) => {
  try {
    const response = await axios.delete(/leaves/);
    return response.data;
  } catch (error) {
    console.error('Error deleting leave:', error);
    throw error;
  }
};

export const leavesAPI = {
  getAll: getLeaves,
  getById: getLeaveById,
  apply: applyLeave,
  approve: approveLeave,
  reject: rejectLeave,
  delete: deleteLeave,
};

export const leaveApi = leavesAPI;
export const leavesApi = leavesAPI;

export default leaveApi;