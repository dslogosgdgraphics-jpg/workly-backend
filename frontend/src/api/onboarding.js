import axios from './axios';

/**
 * Onboarding API
 * Handles employee onboarding workflows and tasks
 */

// ==================== ONBOARDING WORKFLOWS ====================

/**
 * Get all onboarding workflows
 * @param {Object} params - Query parameters (employeeId, status)
 * @returns {Promise} Onboarding workflows list
 */
export const getOnboardingWorkflows = async (params = {}) => {
  try {
    const response = await axios.get('/onboarding', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single onboarding workflow by ID
 * @param {string} id - Workflow ID
 * @returns {Promise} Workflow details
 */
export const getOnboardingWorkflow = async (id) => {
  try {
    const response = await axios.get(`/onboarding/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get onboarding workflow by employee ID
 * @param {string} employeeId - Employee ID
 * @returns {Promise} Employee's onboarding workflow
 */
export const getEmployeeOnboarding = async (employeeId) => {
  try {
    const response = await axios.get(`/onboarding/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get my onboarding workflow (current user)
 * @returns {Promise} Current user's onboarding workflow
 */
export const getMyOnboarding = async () => {
  try {
    const response = await axios.get('/onboarding/my-onboarding');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new onboarding workflow
 * @param {Object} workflowData - Workflow details (employee, startDate, tasks, etc.)
 * @returns {Promise} Created workflow
 */
export const createOnboardingWorkflow = async (workflowData) => {
  try {
    const response = await axios.post('/onboarding', workflowData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update onboarding workflow
 * @param {string} id - Workflow ID
 * @param {Object} updateData - Updated workflow data
 * @returns {Promise} Updated workflow
 */
export const updateOnboardingWorkflow = async (id, updateData) => {
  try {
    const response = await axios.put(`/onboarding/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete onboarding workflow
 * @param {string} id - Workflow ID
 * @returns {Promise} Success message
 */
export const deleteOnboardingWorkflow = async (id) => {
  try {
    const response = await axios.delete(`/onboarding/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== TASKS ====================

/**
 * Complete onboarding task
 * @param {string} workflowId - Workflow ID
 * @param {string} taskId - Task ID
 * @param {Object} taskData - Task completion data (notes, attachments)
 * @returns {Promise} Updated workflow
 */
export const completeTask = async (workflowId, taskId, taskData = {}) => {
  try {
    const response = await axios.put(
      `/onboarding/${workflowId}/tasks/${taskId}/complete`,
      taskData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Uncomplete (reopen) onboarding task
 * @param {string} workflowId - Workflow ID
 * @param {string} taskId - Task ID
 * @returns {Promise} Updated workflow
 */
export const uncompleteTask = async (workflowId, taskId) => {
  try {
    const response = await axios.put(
      `/onboarding/${workflowId}/tasks/${taskId}/uncomplete`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Add task to workflow
 * @param {string} workflowId - Workflow ID
 * @param {Object} taskData - Task details
 * @returns {Promise} Updated workflow
 */
export const addTask = async (workflowId, taskData) => {
  try {
    const response = await axios.post(
      `/onboarding/${workflowId}/tasks`,
      taskData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update task
 * @param {string} workflowId - Workflow ID
 * @param {string} taskId - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise} Updated workflow
 */
export const updateTask = async (workflowId, taskId, taskData) => {
  try {
    const response = await axios.put(
      `/onboarding/${workflowId}/tasks/${taskId}`,
      taskData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete task from workflow
 * @param {string} workflowId - Workflow ID
 * @param {string} taskId - Task ID
 * @returns {Promise} Updated workflow
 */
export const deleteTask = async (workflowId, taskId) => {
  try {
    const response = await axios.delete(
      `/onboarding/${workflowId}/tasks/${taskId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== TEMPLATES ====================

/**
 * Get onboarding templates
 * @returns {Promise} Templates list
 */
export const getOnboardingTemplates = async () => {
  try {
    const response = await axios.get('/onboarding/templates');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single template by ID
 * @param {string} id - Template ID
 * @returns {Promise} Template details
 */
export const getOnboardingTemplate = async (id) => {
  try {
    const response = await axios.get(`/onboarding/templates/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create onboarding template
 * @param {Object} templateData - Template details
 * @returns {Promise} Created template
 */
export const createOnboardingTemplate = async (templateData) => {
  try {
    const response = await axios.post('/onboarding/templates', templateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update onboarding template
 * @param {string} id - Template ID
 * @param {Object} updateData - Updated template data
 * @returns {Promise} Updated template
 */
export const updateOnboardingTemplate = async (id, updateData) => {
  try {
    const response = await axios.put(`/onboarding/templates/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete onboarding template
 * @param {string} id - Template ID
 * @returns {Promise} Success message
 */
export const deleteOnboardingTemplate = async (id) => {
  try {
    const response = await axios.delete(`/onboarding/templates/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create workflow from template
 * @param {string} templateId - Template ID
 * @param {Object} workflowData - Workflow details (employeeId, startDate)
 * @returns {Promise} Created workflow
 */
export const createFromTemplate = async (templateId, workflowData) => {
  try {
    const response = await axios.post(
      `/onboarding/templates/${templateId}/create-workflow`,
      workflowData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== PROGRESS & ANALYTICS ====================

/**
 * Get onboarding progress statistics
 * @param {string} workflowId - Workflow ID
 * @returns {Promise} Progress statistics
 */
export const getOnboardingProgress = async (workflowId) => {
  try {
    const response = await axios.get(`/onboarding/${workflowId}/progress`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get company-wide onboarding analytics
 * @returns {Promise} Onboarding analytics
 */
export const getOnboardingAnalytics = async () => {
  try {
    const response = await axios.get('/onboarding/analytics');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // Workflows
  getOnboardingWorkflows,
  getOnboardingWorkflow,
  getEmployeeOnboarding,
  getMyOnboarding,
  createOnboardingWorkflow,
  updateOnboardingWorkflow,
  deleteOnboardingWorkflow,
  
  // Tasks
  completeTask,
  uncompleteTask,
  addTask,
  updateTask,
  deleteTask,
  
  // Templates
  getOnboardingTemplates,
  getOnboardingTemplate,
  createOnboardingTemplate,
  updateOnboardingTemplate,
  deleteOnboardingTemplate,
  createFromTemplate,
  
  // Analytics
  getOnboardingProgress,
  getOnboardingAnalytics
};