import axios from './axios';

export const getAssets = async (params) => {
  try {
    const response = await axios.get('/assets', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

export const getAssetById = async (id) => {
  try {
    const response = await axios.get(`/assets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching asset:', error);
    throw error;
  }
};

export const createAsset = async (data) => {
  try {
    const response = await axios.post('/assets', data);
    return response.data;
  } catch (error) {
    console.error('Error creating asset:', error);
    throw error;
  }
};

export const updateAsset = async (id, data) => {
  try {
    const response = await axios.put(`/assets/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
};

export const deleteAsset = async (id) => {
  try {
    const response = await axios.delete(`/assets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};

export const assetsAPI = {
  getAll: getAssets,
  getById: getAssetById,
  create: createAsset,
  update: updateAsset,
  delete: deleteAsset,
};

export const assetApi = assetsAPI;
export const assetsApi = assetsAPI;

export default assetsAPI;