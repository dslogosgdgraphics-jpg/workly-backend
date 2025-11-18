// frontend/src/hooks/useApi.js
import { useState, useCallback, useRef, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for API calls with loading and error states
 * @param {Object} config - Configuration options
 * @returns {Object} API methods and state
 */
export const useApi = (config = {}) => {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation successful',
    onSuccess = null,
    onError = null
  } = config;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const cancelTokenSourceRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  /**
   * Generic request handler
   * @param {Function} apiCall - Axios API call function
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  const request = useCallback(async (apiCall, options = {}) => {
    const {
      showSuccess = showSuccessToast,
      showError = showErrorToast,
      successMsg = successMessage,
      errorMsg = null,
      onSuccessCallback = onSuccess,
      onErrorCallback = onError
    } = options;

    // Cancel previous request if exists
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('New request started');
    }

    // Create new cancel token
    cancelTokenSourceRef.current = axios.CancelToken.source();

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall({
        cancelToken: cancelTokenSourceRef.current.token
      });

      const responseData = response.data?.data || response.data;
      setData(responseData);

      if (showSuccess) {
        toast.success(successMsg);
      }

      if (onSuccessCallback) {
        onSuccessCallback(responseData);
      }

      return responseData;
    } catch (err) {
      // Check if request was cancelled
      if (axios.isCancel(err)) {
        console.log('Request cancelled:', err.message);
        return null;
      }

      const errorMessage = errorMsg || err.response?.data?.message || 'An error occurred';
      setError(errorMessage);

      if (showError) {
        toast.error(errorMessage);
      }

      if (onErrorCallback) {
        onErrorCallback(err);
      }

      throw err;
    } finally {
      setLoading(false);
      cancelTokenSourceRef.current = null;
    }
  }, [showSuccessToast, showErrorToast, successMessage, onSuccess, onError]);

  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  const get = useCallback((url, options = {}) => {
    return request(() => axios.get(url), options);
  }, [request]);

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {Object} payload - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  const post = useCallback((url, payload, options = {}) => {
    return request(() => axios.post(url, payload), options);
  }, [request]);

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {Object} payload - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  const put = useCallback((url, payload, options = {}) => {
    return request(() => axios.put(url, payload), options);
  }, [request]);

  /**
   * PATCH request
   * @param {string} url - API endpoint
   * @param {Object} payload - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  const patch = useCallback((url, payload, options = {}) => {
    return request(() => axios.patch(url, payload), options);
  }, [request]);

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  const del = useCallback((url, options = {}) => {
    return request(() => axios.delete(url), {
      successMsg: 'Deleted successfully',
      ...options
    });
  }, [request]);

  /**
   * Upload file
   * @param {string} url - API endpoint
   * @param {File} file - File to upload
   * @param {string} fieldName - Form field name
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  const upload = useCallback((url, file, fieldName = 'file', options = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    return request(() => axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }), {
      successMsg: 'File uploaded successfully',
      ...options
    });
  }, [request]);

  /**
   * Cancel ongoing request
   */
  const cancel = useCallback(() => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Request cancelled by user');
      setLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    // State
    loading,
    error,
    data,
    
    // Methods
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    cancel,
    reset
  };
};

export default useApi;