import axios from './axios';

export const getNotifications = async (params) => {
  try {
    const response = await axios.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await axios.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axios.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const notificationsAPI = {
  getAll: getNotifications,
  markAsRead,
  markAllAsRead,
  delete: deleteNotification,
};

export const notificationApi = notificationsAPI;
export const notificationsApi = notificationsAPI;

export default notificationsAPI;