import axios from './axios';

/**
 * Expense Management API
 * Handles expense submissions, approvals, and reimbursements
 */

// ==================== EXPENSES ====================

/**
 * Get all expenses
 * @param {Object} params - Query parameters (employeeId, status, category, startDate, endDate)
 * @returns {Promise} Expenses list
 */
export const getExpenses = async (params = {}) => {
  try {
    const response = await axios.get('/expenses', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single expense by ID
 * @param {string} id - Expense ID
 * @returns {Promise} Expense details
 */
export const getExpense = async (id) => {
  try {
    const response = await axios.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get my expenses (current user)
 * @param {Object} params - Query parameters (status, category)
 * @returns {Promise} User's expenses
 */
export const getMyExpenses = async (params = {}) => {
  try {
    const response = await axios.get('/expenses/my-expenses', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new expense
 * @param {Object} expenseData - Expense details
 * @returns {Promise} Created expense
 */
export const createExpense = async (expenseData) => {
  try {
    const response = await axios.post('/expenses', expenseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create expense with receipt upload
 * @param {Object} expenseData - Expense details
 * @param {File} receiptFile - Receipt image/PDF file
 * @returns {Promise} Created expense
 */
export const createExpenseWithReceipt = async (expenseData, receiptFile) => {
  try {
    const formData = new FormData();
    
    // Append expense data
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        formData.append(key, expenseData[key]);
      }
    });
    
    // Append receipt file
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }
    
    const response = await axios.post('/expenses/with-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update expense
 * @param {string} id - Expense ID
 * @param {Object} updateData - Updated expense data
 * @returns {Promise} Updated expense
 */
export const updateExpense = async (id, updateData) => {
  try {
    const response = await axios.put(`/expenses/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Upload/Update expense receipt
 * @param {string} id - Expense ID
 * @param {File} receiptFile - Receipt file
 * @returns {Promise} Updated expense
 */
export const uploadReceipt = async (id, receiptFile) => {
  try {
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    
    const response = await axios.put(`/expenses/${id}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete expense
 * @param {string} id - Expense ID
 * @returns {Promise} Success message
 */
export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== APPROVAL WORKFLOW ====================

/**
 * Get pending expenses for approval
 * @returns {Promise} Pending expenses list
 */
export const getPendingExpenses = async () => {
  try {
    const response = await axios.get('/expenses/pending');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Approve expense
 * @param {string} id - Expense ID
 * @param {Object} approvalData - Approval notes
 * @returns {Promise} Approved expense
 */
export const approveExpense = async (id, approvalData = {}) => {
  try {
    const response = await axios.put(`/expenses/${id}/approve`, approvalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Reject expense
 * @param {string} id - Expense ID
 * @param {Object} rejectionData - Rejection reason
 * @returns {Promise} Rejected expense
 */
export const rejectExpense = async (id, rejectionData) => {
  try {
    const response = await axios.put(`/expenses/${id}/reject`, rejectionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Submit expense for approval
 * @param {string} id - Expense ID
 * @returns {Promise} Submitted expense
 */
export const submitExpense = async (id) => {
  try {
    const response = await axios.put(`/expenses/${id}/submit`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== REIMBURSEMENT ====================

/**
 * Mark expense as reimbursed
 * @param {string} id - Expense ID
 * @param {Object} reimbursementData - Reimbursement details (date, method, reference)
 * @returns {Promise} Updated expense
 */
export const markAsReimbursed = async (id, reimbursementData) => {
  try {
    const response = await axios.put(`/expenses/${id}/reimburse`, reimbursementData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get approved expenses pending reimbursement
 * @returns {Promise} Expenses list
 */
export const getExpensesPendingReimbursement = async () => {
  try {
    const response = await axios.get('/expenses/pending-reimbursement');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Bulk reimburse expenses
 * @param {Array} expenseIds - Array of expense IDs
 * @param {Object} reimbursementData - Reimbursement details
 * @returns {Promise} Updated expenses
 */
export const bulkReimburse = async (expenseIds, reimbursementData) => {
  try {
    const response = await axios.post('/expenses/bulk-reimburse', {
      expenseIds,
      ...reimbursementData
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== CATEGORIES ====================

/**
 * Get expense categories
 * @returns {Promise} Categories list
 */
export const getExpenseCategories = async () => {
  try {
    const response = await axios.get('/expenses/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create expense category
 * @param {Object} categoryData - Category details
 * @returns {Promise} Created category
 */
export const createExpenseCategory = async (categoryData) => {
  try {
    const response = await axios.post('/expenses/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update expense category
 * @param {string} id - Category ID
 * @param {Object} updateData - Updated category data
 * @returns {Promise} Updated category
 */
export const updateExpenseCategory = async (id, updateData) => {
  try {
    const response = await axios.put(`/expenses/categories/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete expense category
 * @param {string} id - Category ID
 * @returns {Promise} Success message
 */
export const deleteExpenseCategory = async (id) => {
  try {
    const response = await axios.delete(`/expenses/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== REPORTS & ANALYTICS ====================

/**
 * Get expense statistics
 * @param {Object} params - Query parameters (startDate, endDate, employeeId)
 * @returns {Promise} Expense statistics
 */
export const getExpenseStatistics = async (params = {}) => {
  try {
    const response = await axios.get('/expenses/statistics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get expense report
 * @param {Object} params - Report parameters (startDate, endDate, format)
 * @returns {Promise} Report data
 */
export const getExpenseReport = async (params = {}) => {
  try {
    const response = await axios.get('/expenses/report', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Export expenses to CSV
 * @param {Object} params - Export parameters (startDate, endDate, status)
 * @returns {Promise} CSV file download
 */
export const exportExpenses = async (params = {}) => {
  try {
    const response = await axios.get('/expenses/export', {
      params,
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, message: 'Export completed' };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // Expenses
  getExpenses,
  getExpense,
  getMyExpenses,
  createExpense,
  createExpenseWithReceipt,
  updateExpense,
  uploadReceipt,
  deleteExpense,
  
  // Approval
  getPendingExpenses,
  approveExpense,
  rejectExpense,
  submitExpense,
  
  // Reimbursement
  markAsReimbursed,
  getExpensesPendingReimbursement,
  bulkReimburse,
  
  // Categories
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  
  // Reports
  getExpenseStatistics,
  getExpenseReport,
  exportExpenses
};