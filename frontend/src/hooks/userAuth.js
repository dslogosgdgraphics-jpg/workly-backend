// frontend/src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for authentication operations
 * @returns {Object} Authentication methods and state
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, setAuth, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Check authentication status on mount
  useEffect(() => {
    setIsAuthenticated(!!token && !!user);
  }, [token, user]);

  /**
   * Login user
   * @param {Object} credentials - Email and password
   * @returns {Promise<boolean>} Success status
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', credentials);
      
      if (data.success) {
        const { token, user } = data.data;
        setAuth(user, token);
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Login successful!');
        
        // Navigate based on role
        navigate(user.role === 'admin' ? '/dashboard' : '/dashboard');
        
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth]);

  /**
   * Register new company and admin user
   * @param {Object} registrationData - Company and admin details
   * @returns {Promise<boolean>} Success status
   */
  const register = useCallback(async (registrationData) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', registrationData);
      
      if (data.success) {
        const { token, user } = data.data;
        setAuth(user, token);
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Registration successful! Welcome to EmplyStack!');
        navigate('/dashboard');
        
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    // Clear store
    storeLogout();
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    toast.success('Logged out successfully');
    navigate('/login');
  }, [navigate, storeLogout]);

  /**
   * Get current user from server
   * @returns {Promise<Object|null>} User data or null
   */
  const getCurrentUser = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      
      if (data.success) {
        const updatedUser = data.data;
        setAuth(updatedUser, token);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  }, [token, setAuth, logout]);

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<boolean>} Success status
   */
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const { data } = await axios.put('/api/employees/profile', profileData);
      
      if (data.success) {
        const updatedUser = { ...user, ...profileData };
        setAuth(updatedUser, token);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, token, setAuth]);

  /**
   * Change password
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<boolean>} Success status
   */
  const changePassword = useCallback(async (passwordData) => {
    setLoading(true);
    try {
      const { data } = await axios.put('/api/auth/change-password', passwordData);
      
      if (data.success) {
        toast.success('Password changed successfully');
        return true;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user has specific role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean} Has role
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  /**
   * Restore session from localStorage
   */
  const restoreSession = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuth(parsedUser, storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        return true;
      } catch (error) {
        console.error('Failed to restore session:', error);
        logout();
        return false;
      }
    }
    return false;
  }, [setAuth, logout]);

  return {
    // State
    user,
    token,
    loading,
    isAuthenticated,
    
    // Methods
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    hasRole,
    restoreSession
  };
};

export default useAuth;