import axios from './axios';

// Get all leaves
export const getLeaves = async (params) => {
  try {
    const response = await axios.get('/leaves', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching leaves:', error);
    throw error;
  }
};

// Get single leave
export const getLeaveById = async (id) => {
  try {
    const response = await axios.get(`/leaves/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave:', error);
    throw error;
  }
};

// Create/Apply for leave
export const applyLeave = async (leaveData) => {
  try {
    const response = await axios.post('/leaves', leaveData);
    return response.data;
  } catch (error) {
    console.error('Error applying for leave:', error);
    throw error;
  }
};

// Approve leave
export const approveLeave = async (id, notes = '') => {
  try {
    const response = await axios.put(`/leaves/${id}/approve`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error approving leave:', error);
    throw error;
  }
};

// Reject leave
export const rejectLeave = async (id, notes = '') => {
  try {
    const response = await axios.put(`/leaves/${id}/reject`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error rejecting leave:', error);
    throw error;
  }
};

// Delete leave
export const deleteLeave = async (id) => {
  try {
    const response = await axios.delete(`/leaves/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting leave:', error);
    throw error;
  }
};

// Export as default object as well
export default {
  getLeaves,
  getLeaveById,
  applyLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
};
