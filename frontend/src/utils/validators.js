// frontend/src/utils/validators.js

/**
 * Validation utility functions for form inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, message: string }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false
  } = options;

  if (!password || password.trim() === '') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} { valid: boolean, message: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { valid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @param {boolean} required - Is field required
 * @returns {Object} { valid: boolean, message: string }
 */
export const validatePhone = (phone, required = false) => {
  if (!phone || phone.trim() === '') {
    if (required) {
      return { valid: false, message: 'Phone number is required' };
    }
    return { valid: true, message: '' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return {
      valid: false,
      message: 'Phone number must be between 10 and 15 digits'
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value - Field value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }

  return { valid: true, message: '' };
};

/**
 * Validate name
 * @param {string} name - Name
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateName = (name, minLength = 2, maxLength = 50) => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'Name is required' };
  }

  if (name.trim().length < minLength) {
    return {
      valid: false,
      message: `Name must be at least ${minLength} characters long`
    };
  }

  if (name.trim().length > maxLength) {
    return {
      valid: false,
      message: `Name must not exceed ${maxLength} characters`
    };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return {
      valid: false,
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate salary
 * @param {number|string} salary - Salary amount
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateSalary = (salary, min = 0, max = Infinity) => {
  if (salary === null || salary === undefined || salary === '') {
    return { valid: false, message: 'Salary is required' };
  }

  const salaryNum = Number(salary);

  if (isNaN(salaryNum)) {
    return { valid: false, message: 'Salary must be a valid number' };
  }

  if (salaryNum < min) {
    return { valid: false, message: `Salary must be at least ${min}` };
  }

  if (salaryNum > max) {
    return { valid: false, message: `Salary cannot exceed ${max}` };
  }

  if (salaryNum < 0) {
    return { valid: false, message: 'Salary cannot be negative' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate date
 * @param {string|Date} date - Date value
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateDate = (date, options = {}) => {
  const {
    required = true,
    minDate = null,
    maxDate = null,
    allowPast = true,
    allowFuture = true
  } = options;

  if (!date || date === '') {
    if (required) {
      return { valid: false, message: 'Date is required' };
    }
    return { valid: true, message: '' };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!allowPast && dateObj < today) {
    return { valid: false, message: 'Date cannot be in the past' };
  }

  if (!allowFuture && dateObj > today) {
    return { valid: false, message: 'Date cannot be in the future' };
  }

  if (minDate) {
    const minDateObj = new Date(minDate);
    if (dateObj < minDateObj) {
      return {
        valid: false,
        message: `Date must be on or after ${minDateObj.toLocaleDateString()}`
      };
    }
  }

  if (maxDate) {
    const maxDateObj = new Date(maxDate);
    if (dateObj > maxDateObj) {
      return {
        valid: false,
        message: `Date must be on or before ${maxDateObj.toLocaleDateString()}`
      };
    }
  }

  return { valid: true, message: '' };
};

/**
 * Validate date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, message: 'Both start and end dates are required' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }

  if (end < start) {
    return { valid: false, message: 'End date must be after start date' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate file upload
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    required = true,
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']
  } = options;

  if (!file) {
    if (required) {
      return { valid: false, message: 'File is required' };
    }
    return { valid: true, message: '' };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      message: `File size must not exceed ${maxSizeMB}MB`
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`
    };
  }

  // Check file extension
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      message: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate URL
 * @param {string} url - URL string
 * @param {boolean} required - Is field required
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateUrl = (url, required = false) => {
  if (!url || url.trim() === '') {
    if (required) {
      return { valid: false, message: 'URL is required' };
    }
    return { valid: true, message: '' };
  }

  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlRegex.test(url)) {
    return { valid: false, message: 'Please enter a valid URL' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate number range
 * @param {number|string} value - Number value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateNumberRange = (value, min, max, fieldName = 'Value') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }

  if (num < min) {
    return { valid: false, message: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, message: `${fieldName} must not exceed ${max}` };
  }

  return { valid: true, message: '' };
};

/**
 * Validate text length
 * @param {string} text - Text value
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateTextLength = (text, minLength, maxLength, fieldName = 'This field') => {
  if (!text || text.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (text.length < minLength) {
    return {
      valid: false,
      message: `${fieldName} must be at least ${minLength} characters`
    };
  }

  if (text.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName} must not exceed ${maxLength} characters`
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validate form data
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules object
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];

    for (const rule of rules) {
      const result = rule(value);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { valid: isValid, errors };
};

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // Format: 0XXX-XXXXXXX
    return cleaned.replace(/(\d{4})(\d{7})/, '$1-$2');
  } else if (cleaned.length === 10) {
    // Format: XXX-XXX-XXXX
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};

/**
 * Validate CNIC (Pakistani National ID)
 * @param {string} cnic - CNIC number
 * @param {boolean} required - Is field required
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateCNIC = (cnic, required = false) => {
  if (!cnic || cnic.trim() === '') {
    if (required) {
      return { valid: false, message: 'CNIC is required' };
    }
    return { valid: true, message: '' };
  }

  const cleaned = cnic.replace(/\D/g, '');

  if (cleaned.length !== 13) {
    return { valid: false, message: 'CNIC must be 13 digits' };
  }

  return { valid: true, message: '' };
};

/**
 * Export all validators as default
 */
export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
  validateRequired,
  validateName,
  validateSalary,
  validateDate,
  validateDateRange,
  validateFile,
  validateUrl,
  validateNumberRange,
  validateTextLength,
  validateForm,
  sanitizeInput,
  formatPhoneNumber,
  validateCNIC
};