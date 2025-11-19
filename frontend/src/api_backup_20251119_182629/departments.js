import axios from './axios';

// Individual function exports
export const getDepartments = async (params) => {
  try {
    const response = await axios.get('/departments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const getDepartmentById = async (id) => {
  try {
    const response = await axios.get(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching department:', error);
    throw error;
  }
};

export const createDepartment = async (departmentData) => {
  try {
    const response = await axios.post('/departments', departmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

export const updateDepartment = async (id, departmentData) => {
  try {
    const response = await axios.put(`/departments/${id}`, departmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await axios.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

// Object export (uppercase API)
export const departmentsAPI = {
  getAll: getDepartments,
  getById: getDepartmentById,
  create: createDepartment,
  update: updateDepartment,
  delete: deleteDepartment,
};

// Aliases for lowercase "Api"
export const departmentApi = departmentsAPI;
export const departmentsApi = departmentsAPI;

// Default export
export default departmentsAPI;