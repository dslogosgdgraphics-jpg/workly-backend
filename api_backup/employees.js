import axios from './axios';

// Individual function exports
export const getEmployees = async (params) => {
  try {
    const response = await axios.get('/employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const getEmployeeById = async (id) => {
  try {
    const response = await axios.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await axios.post('/employees', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await axios.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

<<<<<<< HEAD
// Object export (uppercase API)
=======
// Object export for alternative import style
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
export const employeesAPI = {
  getAll: getEmployees,
  getById: getEmployeeById,
  create: createEmployee,
  update: updateEmployee,
  delete: deleteEmployee,
};

<<<<<<< HEAD
// Aliases for lowercase "Api"
export const employeeApi = employeesAPI;
export const employeesApi = employeesAPI;

// Default export
export default employeesAPI;
=======
// Default export
export default employeesAPI;
>>>>>>> c29ef6ccc02fcc05af5ebfab1062810cf8e5eade
