// frontend/src/api/assets.js
import axios from './axios';

/**
 * Asset Management API Service
 * Handles all company asset tracking and management operations
 */

/**
 * Get all assets
 * @param {Object} params - Query parameters
 * @returns {Promise} Assets data
 */
export const getAssets = async (params = {}) => {
  try {
    const response = await axios.get('/api/assets', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get asset by ID
 * @param {string} assetId - Asset ID
 * @returns {Promise} Asset data
 */
export const getAssetById = async (assetId) => {
  try {
    const response = await axios.get(`/api/assets/${assetId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new asset
 * @param {Object} assetData - Asset data
 * @returns {Promise} Created asset
 */
export const createAsset = async (assetData) => {
  try {
    const response = await axios.post('/api/assets', assetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update asset
 * @param {string} assetId - Asset ID
 * @param {Object} updates - Updated asset data
 * @returns {Promise} Updated asset
 */
export const updateAsset = async (assetId, updates) => {
  try {
    const response = await axios.put(`/api/assets/${assetId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete asset
 * @param {string} assetId - Asset ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteAsset = async (assetId) => {
  try {
    const response = await axios.delete(`/api/assets/${assetId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Assign asset to employee
 * @param {string} assetId - Asset ID
 * @param {Object} assignmentData - Assignment data (employeeId, assignedDate, notes)
 * @returns {Promise} Assignment confirmation
 */
export const assignAsset = async (assetId, assignmentData) => {
  try {
    const response = await axios.post(`/api/assets/${assetId}/assign`, assignmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Return asset from employee
 * @param {string} assetId - Asset ID
 * @param {Object} returnData - Return data (condition, notes)
 * @returns {Promise} Return confirmation
 */
export const returnAsset = async (assetId, returnData = {}) => {
  try {
    const response = await axios.post(`/api/assets/${assetId}/return`, returnData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get assets assigned to employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise} Employee's assets
 */
export const getEmployeeAssets = async (employeeId) => {
  try {
    const response = await axios.get(`/api/assets/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get my assets (current user)
 * @returns {Promise} User's assigned assets
 */
export const getMyAssets = async () => {
  try {
    const response = await axios.get('/api/assets/my-assets');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get available assets (not assigned)
 * @param {Object} params - Query parameters
 * @returns {Promise} Available assets
 */
export const getAvailableAssets = async (params = {}) => {
  try {
    const response = await axios.get('/api/assets/available', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get assets by category
 * @param {string} category - Asset category
 * @param {Object} params - Additional parameters
 * @returns {Promise} Assets in category
 */
export const getAssetsByCategory = async (category, params = {}) => {
  try {
    const response = await axios.get(`/api/assets/category/${category}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get assets by status
 * @param {string} status - Asset status (available, assigned, maintenance, retired)
 * @param {Object} params - Additional parameters
 * @returns {Promise} Assets with status
 */
export const getAssetsByStatus = async (status, params = {}) => {
  try {
    const response = await axios.get(`/api/assets/status/${status}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update asset status
 * @param {string} assetId - Asset ID
 * @param {string} status - New status
 * @param {string} notes - Status change notes
 * @returns {Promise} Updated asset
 */
export const updateAssetStatus = async (assetId, status, notes = '') => {
  try {
    const response = await axios.put(`/api/assets/${assetId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get asset history
 * @param {string} assetId - Asset ID
 * @returns {Promise} Asset history
 */
export const getAssetHistory = async (assetId) => {
  try {
    const response = await axios.get(`/api/assets/${assetId}/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add asset maintenance record
 * @param {string} assetId - Asset ID
 * @param {Object} maintenanceData - Maintenance data
 * @returns {Promise} Maintenance record
 */
export const addMaintenanceRecord = async (assetId, maintenanceData) => {
  try {
    const response = await axios.post(`/api/assets/${assetId}/maintenance`, maintenanceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get asset maintenance records
 * @param {string} assetId - Asset ID
 * @returns {Promise} Maintenance records
 */
export const getMaintenanceRecords = async (assetId) => {
  try {
    const response = await axios.get(`/api/assets/${assetId}/maintenance`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Schedule asset maintenance
 * @param {string} assetId - Asset ID
 * @param {Object} scheduleData - Schedule data (date, type, description)
 * @returns {Promise} Scheduled maintenance
 */
export const scheduleMainten = async (assetId, scheduleData) => {
  try {
    const response = await axios.post(`/api/assets/${assetId}/schedule-maintenance`, scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload asset document/image
 * @param {string} assetId - Asset ID
 * @param {File} file - File to upload
 * @returns {Promise} Upload confirmation
 */
export const uploadAssetDocument = async (assetId, file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);

    const response = await axios.post(`/api/assets/${assetId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get asset documents
 * @param {string} assetId - Asset ID
 * @returns {Promise} Asset documents
 */
export const getAssetDocuments = async (assetId) => {
  try {
    const response = await axios.get(`/api/assets/${assetId}/documents`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete asset document
 * @param {string} assetId - Asset ID
 * @param {string} documentId - Document ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteAssetDocument = async (assetId, documentId) => {
  try {
    const response = await axios.delete(`/api/assets/${assetId}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Bulk import assets
 * @param {Array} assetsData - Array of asset data
 * @returns {Promise} Import results
 */
export const bulkImportAssets = async (assetsData) => {
  try {
    const response = await axios.post('/api/assets/bulk-import', { assets: assetsData });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get asset statistics
 * @returns {Promise} Asset statistics
 */
export const getAssetStatistics = async () => {
  try {
    const response = await axios.get('/api/assets/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get asset categories
 * @returns {Promise} Asset categories with counts
 */
export const getAssetCategories = async () => {
  try {
    const response = await axios.get('/api/assets/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Export assets to CSV
 * @param {Object} params - Export parameters
 * @returns {Promise} CSV file
 */
export const exportAssetsToCSV = async (params = {}) => {
  try {
    const response = await axios.get('/api/assets/export/csv', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Export assets to PDF
 * @param {Object} params - Export parameters
 * @returns {Promise} PDF file
 */
export const exportAssetsToPDF = async (params = {}) => {
  try {
    const response = await axios.get('/api/assets/export/pdf', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Generate asset QR code
 * @param {string} assetId - Asset ID
 * @returns {Promise} QR code image
 */
export const generateAssetQRCode = async (assetId) => {
  try {
    const response = await axios.get(`/api/assets/${assetId}/qr-code`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Request asset
 * @param {Object} requestData - Asset request data
 * @returns {Promise} Request confirmation
 */
export const requestAsset = async (requestData) => {
  try {
    const response = await axios.post('/api/assets/requests', requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get asset requests
 * @param {Object} params - Query parameters
 * @returns {Promise} Asset requests
 */
export const getAssetRequests = async (params = {}) => {
  try {
    const response = await axios.get('/api/assets/requests', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Approve asset request
 * @param {string} requestId - Request ID
 * @returns {Promise} Approval confirmation
 */
export const approveAssetRequest = async (requestId) => {
  try {
    const response = await axios.put(`/api/assets/requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Reject asset request
 * @param {string} requestId - Request ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} Rejection confirmation
 */
export const rejectAssetRequest = async (requestId, reason = '') => {
  try {
    const response = await axios.put(`/api/assets/requests/${requestId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getEmployeeAssets,
  getMyAssets,
  getAvailableAssets,
  getAssetsByCategory,
  getAssetsByStatus,
  updateAssetStatus,
  getAssetHistory,
  addMaintenanceRecord,
  getMaintenanceRecords,
  scheduleMainten,
  uploadAssetDocument,
  getAssetDocuments,
  deleteAssetDocument,
  bulkImportAssets,
  getAssetStatistics,
  getAssetCategories,
  exportAssetsToCSV,
  exportAssetsToPDF,
  generateAssetQRCode,
  requestAsset,
  getAssetRequests,
  approveAssetRequest,
  rejectAssetRequest
};