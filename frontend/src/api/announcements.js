import axios from './axios';

/**
 * Announcements API
 * Handles company-wide announcements and notifications
 */

// ==================== ANNOUNCEMENTS ====================

/**
 * Get all announcements
 * @param {Object} params - Query parameters (priority, isActive, limit)
 * @returns {Promise} Announcements list
 */
export const getAnnouncements = async (params = {}) => {
  try {
    const response = await axios.get('/announcements', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get active announcements
 * @returns {Promise} Active announcements list
 */
export const getActiveAnnouncements = async () => {
  try {
    const response = await axios.get('/announcements/active');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get pinned announcements
 * @returns {Promise} Pinned announcements list
 */
export const getPinnedAnnouncements = async () => {
  try {
    const response = await axios.get('/announcements/pinned');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single announcement by ID
 * @param {string} id - Announcement ID
 * @returns {Promise} Announcement details
 */
export const getAnnouncement = async (id) => {
  try {
    const response = await axios.get(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new announcement
 * @param {Object} announcementData - Announcement details
 * @returns {Promise} Created announcement
 */
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await axios.post('/announcements', announcementData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create announcement with attachment
 * @param {Object} announcementData - Announcement details
 * @param {File} file - Attachment file
 * @returns {Promise} Created announcement
 */
export const createAnnouncementWithAttachment = async (announcementData, file) => {
  try {
    const formData = new FormData();
    
    // Append announcement data
    Object.keys(announcementData).forEach(key => {
      if (announcementData[key] !== null && announcementData[key] !== undefined) {
        if (key === 'targetAudience' || key === 'departments') {
          formData.append(key, JSON.stringify(announcementData[key]));
        } else {
          formData.append(key, announcementData[key]);
        }
      }
    });
    
    // Append file
    if (file) {
      formData.append('attachment', file);
    }
    
    const response = await axios.post('/announcements/with-attachment', formData, {
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
 * Update announcement
 * @param {string} id - Announcement ID
 * @param {Object} updateData - Updated announcement data
 * @returns {Promise} Updated announcement
 */
export const updateAnnouncement = async (id, updateData) => {
  try {
    const response = await axios.put(`/announcements/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete announcement
 * @param {string} id - Announcement ID
 * @returns {Promise} Success message
 */
export const deleteAnnouncement = async (id) => {
  try {
    const response = await axios.delete(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ANNOUNCEMENT ACTIONS ====================

/**
 * Pin announcement
 * @param {string} id - Announcement ID
 * @returns {Promise} Updated announcement
 */
export const pinAnnouncement = async (id) => {
  try {
    const response = await axios.put(`/announcements/${id}/pin`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Unpin announcement
 * @param {string} id - Announcement ID
 * @returns {Promise} Updated announcement
 */
export const unpinAnnouncement = async (id) => {
  try {
    const response = await axios.put(`/announcements/${id}/unpin`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Publish announcement
 * @param {string} id - Announcement ID
 * @returns {Promise} Published announcement
 */
export const publishAnnouncement = async (id) => {
  try {
    const response = await axios.put(`/announcements/${id}/publish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Archive announcement
 * @param {string} id - Announcement ID
 * @returns {Promise} Archived announcement
 */
export const archiveAnnouncement = async (id) => {
  try {
    const response = await axios.put(`/announcements/${id}/archive`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== READ TRACKING ====================

/**
 * Mark announcement as read
 * @param {string} id - Announcement ID
 * @returns {Promise} Success message
 */
export const markAsRead = async (id) => {
  try {
    const response = await axios.post(`/announcements/${id}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get read status for announcement
 * @param {string} id - Announcement ID
 * @returns {Promise} Read status and readers list
 */
export const getReadStatus = async (id) => {
  try {
    const response = await axios.get(`/announcements/${id}/read-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get unread announcements count
 * @returns {Promise} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await axios.get('/announcements/unread-count');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== COMMENTS & REACTIONS ====================

/**
 * Add comment to announcement
 * @param {string} id - Announcement ID
 * @param {Object} commentData - Comment text
 * @returns {Promise} Updated announcement
 */
export const addComment = async (id, commentData) => {
  try {
    const response = await axios.post(`/announcements/${id}/comments`, commentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete comment from announcement
 * @param {string} announcementId - Announcement ID
 * @param {string} commentId - Comment ID
 * @returns {Promise} Updated announcement
 */
export const deleteComment = async (announcementId, commentId) => {
  try {
    const response = await axios.delete(
      `/announcements/${announcementId}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Add reaction to announcement
 * @param {string} id - Announcement ID
 * @param {string} emoji - Reaction emoji (👍, ❤️, 🎉, etc.)
 * @returns {Promise} Updated announcement
 */
export const addReaction = async (id, emoji) => {
  try {
    const response = await axios.post(`/announcements/${id}/reactions`, { emoji });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Remove reaction from announcement
 * @param {string} id - Announcement ID
 * @param {string} emoji - Reaction emoji to remove
 * @returns {Promise} Updated announcement
 */
export const removeReaction = async (id, emoji) => {
  try {
    const response = await axios.delete(`/announcements/${id}/reactions/${emoji}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ANALYTICS ====================

/**
 * Get announcement analytics
 * @param {string} id - Announcement ID
 * @returns {Promise} Analytics data (views, reads, engagement)
 */
export const getAnnouncementAnalytics = async (id) => {
  try {
    const response = await axios.get(`/announcements/${id}/analytics`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get company-wide announcement statistics
 * @param {Object} params - Query parameters (startDate, endDate)
 * @returns {Promise} Statistics
 */
export const getAnnouncementStatistics = async (params = {}) => {
  try {
    const response = await axios.get('/announcements/statistics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== SCHEDULING ====================

/**
 * Schedule announcement for future publication
 * @param {string} id - Announcement ID
 * @param {Date} publishDate - Scheduled publish date
 * @returns {Promise} Updated announcement
 */
export const scheduleAnnouncement = async (id, publishDate) => {
  try {
    const response = await axios.put(`/announcements/${id}/schedule`, {
      publishDate
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get scheduled announcements
 * @returns {Promise} Scheduled announcements list
 */
export const getScheduledAnnouncements = async () => {
  try {
    const response = await axios.get('/announcements/scheduled');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // CRUD
  getAnnouncements,
  getActiveAnnouncements,
  getPinnedAnnouncements,
  getAnnouncement,
  createAnnouncement,
  createAnnouncementWithAttachment,
  updateAnnouncement,
  deleteAnnouncement,
  
  // Actions
  pinAnnouncement,
  unpinAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
  
  // Read Tracking
  markAsRead,
  getReadStatus,
  getUnreadCount,
  
  // Engagement
  addComment,
  deleteComment,
  addReaction,
  removeReaction,
  
  // Analytics
  getAnnouncementAnalytics,
  getAnnouncementStatistics,
  
  // Scheduling
  scheduleAnnouncement,
  getScheduledAnnouncements
};