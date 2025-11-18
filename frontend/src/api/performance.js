import axios from './axios';

/**
 * Performance Management API
 * Handles performance reviews, goals, and OKRs
 */

// ==================== PERFORMANCE REVIEWS ====================

/**
 * Get all performance reviews
 * @param {Object} params - Query parameters (employeeId, status, year)
 * @returns {Promise} Performance reviews list
 */
export const getPerformanceReviews = async (params = {}) => {
  try {
    const response = await axios.get('/performance/reviews', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single performance review by ID
 * @param {string} id - Review ID
 * @returns {Promise} Performance review details
 */
export const getPerformanceReview = async (id) => {
  try {
    const response = await axios.get(`/performance/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new performance review
 * @param {Object} reviewData - Review details
 * @returns {Promise} Created review
 */
export const createPerformanceReview = async (reviewData) => {
  try {
    const response = await axios.post('/performance/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update performance review
 * @param {string} id - Review ID
 * @param {Object} updateData - Updated review data
 * @returns {Promise} Updated review
 */
export const updatePerformanceReview = async (id, updateData) => {
  try {
    const response = await axios.put(`/performance/reviews/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Submit performance review (employee self-review)
 * @param {string} id - Review ID
 * @param {Object} reviewData - Self-review responses
 * @returns {Promise} Updated review
 */
export const submitSelfReview = async (id, reviewData) => {
  try {
    const response = await axios.put(`/performance/reviews/${id}/submit`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Complete performance review (manager)
 * @param {string} id - Review ID
 * @param {Object} reviewData - Manager review and ratings
 * @returns {Promise} Completed review
 */
export const completePerformanceReview = async (id, reviewData) => {
  try {
    const response = await axios.put(`/performance/reviews/${id}/complete`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete performance review
 * @param {string} id - Review ID
 * @returns {Promise} Success message
 */
export const deletePerformanceReview = async (id) => {
  try {
    const response = await axios.delete(`/performance/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== GOALS & OKRs ====================

/**
 * Get all goals
 * @param {Object} params - Query parameters (employeeId, status, type)
 * @returns {Promise} Goals list
 */
export const getGoals = async (params = {}) => {
  try {
    const response = await axios.get('/performance/goals', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single goal by ID
 * @param {string} id - Goal ID
 * @returns {Promise} Goal details
 */
export const getGoal = async (id) => {
  try {
    const response = await axios.get(`/performance/goals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new goal
 * @param {Object} goalData - Goal details (title, description, targetDate, type, keyResults)
 * @returns {Promise} Created goal
 */
export const createGoal = async (goalData) => {
  try {
    const response = await axios.post('/performance/goals', goalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update goal
 * @param {string} id - Goal ID
 * @param {Object} updateData - Updated goal data
 * @returns {Promise} Updated goal
 */
export const updateGoal = async (id, updateData) => {
  try {
    const response = await axios.put(`/performance/goals/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update goal progress
 * @param {string} id - Goal ID
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} notes - Progress notes
 * @returns {Promise} Updated goal
 */
export const updateGoalProgress = async (id, progress, notes = '') => {
  try {
    const response = await axios.put(`/performance/goals/${id}/progress`, {
      progress,
      notes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update key result progress
 * @param {string} goalId - Goal ID
 * @param {string} keyResultId - Key result ID
 * @param {number} progress - Progress value
 * @returns {Promise} Updated goal
 */
export const updateKeyResultProgress = async (goalId, keyResultId, progress) => {
  try {
    const response = await axios.put(
      `/performance/goals/${goalId}/key-results/${keyResultId}`,
      { progress }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete goal
 * @param {string} id - Goal ID
 * @returns {Promise} Success message
 */
export const deleteGoal = async (id) => {
  try {
    const response = await axios.delete(`/performance/goals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== FEEDBACK ====================

/**
 * Get feedback for an employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise} Feedback list
 */
export const getFeedback = async (employeeId) => {
  try {
    const response = await axios.get('/performance/feedback', {
      params: { employeeId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Submit feedback for an employee
 * @param {Object} feedbackData - Feedback details
 * @returns {Promise} Created feedback
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await axios.post('/performance/feedback', feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== REVIEW TEMPLATES ====================

/**
 * Get review templates
 * @returns {Promise} Templates list
 */
export const getReviewTemplates = async () => {
  try {
    const response = await axios.get('/performance/templates');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create review template
 * @param {Object} templateData - Template details
 * @returns {Promise} Created template
 */
export const createReviewTemplate = async (templateData) => {
  try {
    const response = await axios.post('/performance/templates', templateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // Reviews
  getPerformanceReviews,
  getPerformanceReview,
  createPerformanceReview,
  updatePerformanceReview,
  submitSelfReview,
  completePerformanceReview,
  deletePerformanceReview,
  
  // Goals
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateGoalProgress,
  updateKeyResultProgress,
  deleteGoal,
  
  // Feedback
  getFeedback,
  submitFeedback,
  
  // Templates
  getReviewTemplates,
  createReviewTemplate
};