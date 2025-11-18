// frontend/src/api/shifts.js
import axios from './axios';

/**
 * Shift Management API Service
 * Handles all shift scheduling and management operations
 */

/**
 * Get all shifts
 * @param {Object} params - Query parameters
 * @returns {Promise} Shifts data
 */
export const getShifts = async (params = {}) => {
  try {
    const response = await axios.get('/api/shifts', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get shift by ID
 * @param {string} shiftId - Shift ID
 * @returns {Promise} Shift data
 */
export const getShiftById = async (shiftId) => {
  try {
    const response = await axios.get(`/api/shifts/${shiftId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new shift
 * @param {Object} shiftData - Shift data
 * @returns {Promise} Created shift
 */
export const createShift = async (shiftData) => {
  try {
    const response = await axios.post('/api/shifts', shiftData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update shift
 * @param {string} shiftId - Shift ID
 * @param {Object} updates - Updated shift data
 * @returns {Promise} Updated shift
 */
export const updateShift = async (shiftId, updates) => {
  try {
    const response = await axios.put(`/api/shifts/${shiftId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete shift
 * @param {string} shiftId - Shift ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteShift = async (shiftId) => {
  try {
    const response = await axios.delete(`/api/shifts/${shiftId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get shifts by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} filters - Additional filters
 * @returns {Promise} Shifts in date range
 */
export const getShiftsByDateRange = async (startDate, endDate, filters = {}) => {
  try {
    const response = await axios.get('/api/shifts/range', {
      params: { startDate, endDate, ...filters }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get shifts for specific employee
 * @param {string} employeeId - Employee ID
 * @param {Object} params - Query parameters
 * @returns {Promise} Employee shifts
 */
export const getEmployeeShifts = async (employeeId, params = {}) => {
  try {
    const response = await axios.get(`/api/shifts/employee/${employeeId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get my shifts (current user)
 * @param {Object} params - Query parameters
 * @returns {Promise} User's shifts
 */
export const getMyShifts = async (params = {}) => {
  try {
    const response = await axios.get('/api/shifts/my-shifts', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Assign shift to employee
 * @param {string} shiftId - Shift ID
 * @param {string} employeeId - Employee ID
 * @returns {Promise} Assignment confirmation
 */
export const assignShift = async (shiftId, employeeId) => {
  try {
    const response = await axios.post(`/api/shifts/${shiftId}/assign`, { employeeId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Unassign shift from employee
 * @param {string} shiftId - Shift ID
 * @param {string} employeeId - Employee ID
 * @returns {Promise} Unassignment confirmation
 */
export const unassignShift = async (shiftId, employeeId) => {
  try {
    const response = await axios.post(`/api/shifts/${shiftId}/unassign`, { employeeId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Request shift swap
 * @param {Object} swapRequest - Swap request data
 * @returns {Promise} Swap request
 */
export const requestShiftSwap = async (swapRequest) => {
  try {
    const response = await axios.post('/api/shifts/swap-request', swapRequest);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get shift swap requests
 * @param {Object} params - Query parameters
 * @returns {Promise} Swap requests
 */
export const getShiftSwapRequests = async (params = {}) => {
  try {
    const response = await axios.get('/api/shifts/swap-requests', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Approve shift swap request
 * @param {string} requestId - Swap request ID
 * @returns {Promise} Approval confirmation
 */
export const approveShiftSwap = async (requestId) => {
  try {
    const response = await axios.put(`/api/shifts/swap-requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Reject shift swap request
 * @param {string} requestId - Swap request ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} Rejection confirmation
 */
export const rejectShiftSwap = async (requestId, reason = '') => {
  try {
    const response = await axios.put(`/api/shifts/swap-requests/${requestId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create shift template
 * @param {Object} templateData - Template data
 * @returns {Promise} Created template
 */
export const createShiftTemplate = async (templateData) => {
  try {
    const response = await axios.post('/api/shifts/templates', templateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get shift templates
 * @returns {Promise} Shift templates
 */
export const getShiftTemplates = async () => {
  try {
    const response = await axios.get('/api/shifts/templates');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Apply shift template
 * @param {string} templateId - Template ID
 * @param {Object} applicationData - Application data (dates, employees, etc.)
 * @returns {Promise} Applied shifts
 */
export const applyShiftTemplate = async (templateId, applicationData) => {
  try {
    const response = await axios.post(`/api/shifts/templates/${templateId}/apply`, applicationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete shift template
 * @param {string} templateId - Template ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteShiftTemplate = async (templateId) => {
  try {
    const response = await axios.delete(`/api/shifts/templates/${templateId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Bulk create shifts
 * @param {Array} shiftsData - Array of shift data
 * @returns {Promise} Created shifts
 */
export const bulkCreateShifts = async (shiftsData) => {
  try {
    const response = await axios.post('/api/shifts/bulk-create', { shifts: shiftsData });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get shift statistics
 * @param {Object} params - Query parameters
 * @returns {Promise} Shift statistics
 */
export const getShiftStatistics = async (params = {}) => {
  try {
    const response = await axios.get('/api/shifts/statistics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Check shift availability
 * @param {string} employeeId - Employee ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @returns {Promise} Availability status
 */
export const checkShiftAvailability = async (employeeId, date, startTime, endTime) => {
  try {
    const response = await axios.post('/api/shifts/check-availability', {
      employeeId,
      date,
      startTime,
      endTime
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Export shifts to calendar
 * @param {Object} params - Export parameters
 * @returns {Promise} Calendar file/data
 */
export const exportShiftsToCalendar = async (params = {}) => {
  try {
    const response = await axios.get('/api/shifts/export/calendar', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Export shifts to CSV
 * @param {Object} params - Export parameters
 * @returns {Promise} CSV file
 */
export const exportShiftsToCSV = async (params = {}) => {
  try {
    const response = await axios.get('/api/shifts/export/csv', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  getShiftsByDateRange,
  getEmployeeShifts,
  getMyShifts,
  assignShift,
  unassignShift,
  requestShiftSwap,
  getShiftSwapRequests,
  approveShiftSwap,
  rejectShiftSwap,
  createShiftTemplate,
  getShiftTemplates,
  applyShiftTemplate,
  deleteShiftTemplate,
  bulkCreateShifts,
  getShiftStatistics,
  checkShiftAvailability,
  exportShiftsToCalendar,
  exportShiftsToCSV
};