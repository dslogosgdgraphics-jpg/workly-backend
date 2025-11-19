import axios from './axios';

<<<<<<< HEAD
// Individual function exports
=======
// Individual function exports (for LeaveApprovals.jsx style imports)
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
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
    const response = await axios.get(`/leaves/${id}`);
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
    const response = await axios.put(`/leaves/${id}/approve`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error approving leave:', error);
    throw error;
  }
};

export const rejectLeave = async (id, notes = '') => {
  try {
    const response = await axios.put(`/leaves/${id}/reject`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error rejecting leave:', error);
    throw error;
  }
};

export const deleteLeave = async (id) => {
  try {
    const response = await axios.delete(`/leaves/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting leave:', error);
    throw error;
  }
};

<<<<<<< HEAD
// Object export (uppercase API)
export const leavesAPI = {
  getAll: getLeaves,
  getById: getLeaveById,
  apply: applyLeave,
  approve: approveLeave,
  reject: rejectLeave,
  delete: deleteLeave,
};

// Named export as an object (for LeaveList.jsx style imports)
export const leaveApi = leavesAPI;
export const leavesApi = leavesAPI;

// Default export
export default leaveApi;
=======
// Named export as an object (for LeaveList.jsx style imports)
export const leaveApi = {
  getLeaves,
  getLeaveById,
  applyLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
};

// Default export (for default import style)
export default leaveApi;
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
