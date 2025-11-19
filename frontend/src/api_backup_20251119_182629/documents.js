import axios from './axios';

export const getDocuments = async (params) => {
  try {
    const response = await axios.get('/documents', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

export const getDocumentById = async (id) => {
  try {
    const response = await axios.get(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

export const uploadDocument = async (formData) => {
  try {
    const response = await axios.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const deleteDocument = async (id) => {
  try {
    const response = await axios.delete(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const documentsAPI = {
  getAll: getDocuments,
  getById: getDocumentById,
  upload: uploadDocument,
  delete: deleteDocument,
};

export const documentApi = documentsAPI;
export const documentsApi = documentsAPI;

export default documentsAPI;