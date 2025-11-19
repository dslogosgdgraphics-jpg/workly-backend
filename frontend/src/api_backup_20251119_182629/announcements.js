import axios from './axios';

export const getAnnouncements = async (params) => {
  try {
    const response = await axios.get('/announcements', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

export const getAnnouncementById = async (id) => {
  try {
    const response = await axios.get(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
};

export const createAnnouncement = async (data) => {
  try {
    const response = await axios.post('/announcements', data);
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const updateAnnouncement = async (id, data) => {
  try {
    const response = await axios.put(`/announcements/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    const response = await axios.delete(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

export const announcementsAPI = {
  getAll: getAnnouncements,
  getById: getAnnouncementById,
  create: createAnnouncement,
  update: updateAnnouncement,
  delete: deleteAnnouncement,
};

export const announcementApi = announcementsAPI;
export const announcementsApi = announcementsAPI;

export default announcementsAPI;