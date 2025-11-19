import axios from './axios';

export const getPayroll = async (params) => {
  try {
    const response = await axios.get('/payroll', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payroll:', error);
    throw error;
  }
};

export const getPayrollById = async (id) => {
  try {
    const response = await axios.get(/payroll/+id);
    return response.data;
  } catch (error) {
    console.error('Error fetching payroll:', error);
    throw error;
  }
};

export const generatePayroll = async (data) => {
  try {
    const response = await axios.post('/payroll/generate', data);
    return response.data;
  } catch (error) {
    console.error('Error generating payroll:', error);
    throw error;
  }
};

export const updatePayroll = async (id, data) => {
  try {
    const response = await axios.put(/payroll/+id, data);
    return response.data;
  } catch (error) {
    console.error('Error updating payroll:', error);
    throw error;
  }
};

export const updatePayrollStatus = async (id, status) => {
  try {
    const response = await axios.put(/payroll/+id+/status, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating payroll status:', error);
    throw error;
  }
};

export const deletePayroll = async (id) => {
  try {
    const response = await axios.delete(/payroll/+id);
    return response.data;
  } catch (error) {
    console.error('Error deleting payroll:', error);
    throw error;
  }
};

export const payrollAPI = {
  getAll: getPayroll,
  getById: getPayrollById,
  generate: generatePayroll,
  update: updatePayroll,
  updateStatus: updatePayrollStatus,
  delete: deletePayroll
};

export const payrollApi = payrollAPI;

export default payrollAPI;