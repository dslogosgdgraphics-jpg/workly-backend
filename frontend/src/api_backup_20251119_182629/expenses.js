import axios from './axios';

export const getExpenses = async (params) => {
  try {
    const response = await axios.get('/expenses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const getExpenseById = async (id) => {
  try {
    const response = await axios.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};

export const createExpense = async (data) => {
  try {
    const response = await axios.post('/expenses', data);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const approveExpense = async (id, notes) => {
  try {
    const response = await axios.put(`/expenses/${id}/approve`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error approving expense:', error);
    throw error;
  }
};

export const rejectExpense = async (id, notes) => {
  try {
    const response = await axios.put(`/expenses/${id}/reject`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error rejecting expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const expensesAPI = {
  getAll: getExpenses,
  getById: getExpenseById,
  create: createExpense,
  approve: approveExpense,
  reject: rejectExpense,
  delete: deleteExpense,
};

export const expenseApi = expensesAPI;
export const expensesApi = expensesAPI;

export default expensesAPI;