// frontend/src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for notification management
 * @param {Object} options - Configuration options
 * @returns {Object} Notification methods and state
 */
export const useNotifications = (options = {}) => {
  const {
    autoFetch = true,
    pollInterval = 30000, // 30 seconds
    limit = 50
  } = options;

  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    removeNotification: storeRemoveNotification,
    setUnreadCount
  } = useNotificationStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  /**
   * Fetch notifications from server
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Notifications array
   */
  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get('/api/notifications', {
        params: { limit, ...params }
      });

      if (data.success) {
        const fetchedNotifications = data.data || [];
        setNotifications(fetchedNotifications);
        
        // Update unread count
        const unread = fetchedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);

        return fetchedNotifications;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Notification fetch error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [limit, setNotifications, setUnreadCount]);

  /**
   * Fetch unread count only
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications/unread-count');
      
      if (data.success) {
        setUnreadCount(data.data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [setUnreadCount]);

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { data } = await axios.put(`/api/notifications/${notificationId}/read`);

      if (data.success) {
        storeMarkAsRead(notificationId);
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, [storeMarkAsRead, setUnreadCount]);

  /**
   * Mark all notifications as read
   * @returns {Promise<boolean>} Success status
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const { data } = await axios.put('/api/notifications/read-all');

      if (data.success) {
        storeMarkAllAsRead();
        setUnreadCount(0);
        toast.success('All notifications marked as read');
        return true;
      }
    } catch (err) {
      toast.error('Failed to mark all as read');
      return false;
    }
  }, [storeMarkAllAsRead, setUnreadCount]);

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const { data } = await axios.delete(`/api/notifications/${notificationId}`);

      if (data.success) {
        const notification = notifications.find(n => n._id === notificationId);
        
        storeRemoveNotification(notificationId);
        
        // Decrease unread count if notification was unread
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return true;
      }
    } catch (err) {
      toast.error('Failed to delete notification');
      return false;
    }
  }, [notifications, storeRemoveNotification, setUnreadCount]);

  /**
   * Clear all notifications
   * @returns {Promise<boolean>} Success status
   */
  const clearAll = useCallback(async () => {
    try {
      const { data } = await axios.delete('/api/notifications/clear-all');

      if (data.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications cleared');
        return true;
      }
    } catch (err) {
      toast.error('Failed to clear notifications');
      return false;
    }
  }, [setNotifications, setUnreadCount]);

  /**
   * Send test notification (admin only)
   * @param {Object} notificationData - Notification data
   * @returns {Promise<boolean>} Success status
   */
  const sendNotification = useCallback(async (notificationData) => {
    try {
      const { data } = await axios.post('/api/notifications', notificationData);

      if (data.success) {
        toast.success('Notification sent successfully');
        return true;
      }
    } catch (err) {
      toast.error('Failed to send notification');
      return false;
    }
  }, []);

  /**
   * Start polling for new notifications
   */
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, pollInterval);
  }, [pollInterval, fetchUnreadCount]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  /**
   * Get notifications by type
   * @param {string} type - Notification type
   * @returns {Array} Filtered notifications
   */
  const getByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  /**
   * Get unread notifications
   * @returns {Array} Unread notifications
   */
  const getUnread = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  /**
   * Get read notifications
   * @returns {Array} Read notifications
   */
  const getRead = useCallback(() => {
    return notifications.filter(n => n.read);
  }, [notifications]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  // Start polling on mount, stop on unmount
  useEffect(() => {
    if (autoFetch && pollInterval > 0) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoFetch, pollInterval, startPolling, stopPolling]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,

    // Methods
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    sendNotification,
    startPolling,
    stopPolling,
    
    // Helpers
    getByType,
    getUnread,
    getRead
  };
};

export default useNotifications;