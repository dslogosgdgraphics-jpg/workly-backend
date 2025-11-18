// frontend/src/store/employeeStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Employee Store - Manages employee state across the application
 */
export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      // State
      employees: [],
      selectedEmployee: null,
      filters: {
        search: '',
        department: '',
        status: 'active',
        role: '',
        sortBy: 'name',
        sortOrder: 'asc'
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      loading: false,
      error: null,

      // Actions

      /**
       * Set employees list
       * @param {Array} employees - Array of employee objects
       */
      setEmployees: (employees) => {
        set({ employees, error: null });
      },

      /**
       * Add employee to the list
       * @param {Object} employee - Employee object
       */
      addEmployee: (employee) => {
        set((state) => ({
          employees: [employee, ...state.employees],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1
          }
        }));
      },

      /**
       * Update employee in the list
       * @param {string} employeeId - Employee ID
       * @param {Object} updates - Updated fields
       */
      updateEmployee: (employeeId, updates) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp._id === employeeId ? { ...emp, ...updates } : emp
          ),
          selectedEmployee:
            state.selectedEmployee?._id === employeeId
              ? { ...state.selectedEmployee, ...updates }
              : state.selectedEmployee
        }));
      },

      /**
       * Remove employee from the list
       * @param {string} employeeId - Employee ID
       */
      removeEmployee: (employeeId) => {
        set((state) => ({
          employees: state.employees.filter((emp) => emp._id !== employeeId),
          selectedEmployee:
            state.selectedEmployee?._id === employeeId
              ? null
              : state.selectedEmployee,
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1)
          }
        }));
      },

      /**
       * Set selected employee
       * @param {Object|null} employee - Employee object or null
       */
      setSelectedEmployee: (employee) => {
        set({ selectedEmployee: employee });
      },

      /**
       * Get employee by ID
       * @param {string} employeeId - Employee ID
       * @returns {Object|undefined} Employee object
       */
      getEmployeeById: (employeeId) => {
        return get().employees.find((emp) => emp._id === employeeId);
      },

      /**
       * Set filters
       * @param {Object} filters - Filter object
       */
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 } // Reset to page 1 on filter change
        }));
      },

      /**
       * Reset filters to default
       */
      resetFilters: () => {
        set({
          filters: {
            search: '',
            department: '',
            status: 'active',
            role: '',
            sortBy: 'name',
            sortOrder: 'asc'
          },
          pagination: { ...get().pagination, page: 1 }
        });
      },

      /**
       * Set pagination
       * @param {Object} pagination - Pagination object
       */
      setPagination: (pagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination }
        }));
      },

      /**
       * Set loading state
       * @param {boolean} loading - Loading status
       */
      setLoading: (loading) => {
        set({ loading });
      },

      /**
       * Set error state
       * @param {string|null} error - Error message
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * Get filtered and sorted employees
       * @returns {Array} Filtered employees
       */
      getFilteredEmployees: () => {
        const { employees, filters } = get();
        let filtered = [...employees];

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(
            (emp) =>
              emp.name?.toLowerCase().includes(searchLower) ||
              emp.email?.toLowerCase().includes(searchLower) ||
              emp.designation?.toLowerCase().includes(searchLower) ||
              emp.phone?.includes(filters.search)
          );
        }

        // Department filter
        if (filters.department) {
          filtered = filtered.filter(
            (emp) => emp.department === filters.department
          );
        }

        // Status filter
        if (filters.status) {
          filtered = filtered.filter((emp) => emp.status === filters.status);
        }

        // Role filter
        if (filters.role) {
          filtered = filtered.filter((emp) => emp.role === filters.role);
        }

        // Sorting
        filtered.sort((a, b) => {
          let aValue = a[filters.sortBy];
          let bValue = b[filters.sortBy];

          // Handle null/undefined values
          if (aValue === null || aValue === undefined) aValue = '';
          if (bValue === null || bValue === undefined) bValue = '';

          // Convert to string for comparison if needed
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        return filtered;
      },

      /**
       * Get employees by department
       * @param {string} departmentId - Department ID
       * @returns {Array} Employees in department
       */
      getEmployeesByDepartment: (departmentId) => {
        return get().employees.filter((emp) => emp.department === departmentId);
      },

      /**
       * Get employees by status
       * @param {string} status - Employee status
       * @returns {Array} Employees with status
       */
      getEmployeesByStatus: (status) => {
        return get().employees.filter((emp) => emp.status === status);
      },

      /**
       * Get employees by role
       * @param {string} role - Employee role
       * @returns {Array} Employees with role
       */
      getEmployeesByRole: (role) => {
        return get().employees.filter((emp) => emp.role === role);
      },

      /**
       * Get employee statistics
       * @returns {Object} Statistics object
       */
      getStatistics: () => {
        const { employees } = get();

        return {
          total: employees.length,
          active: employees.filter((e) => e.status === 'active').length,
          inactive: employees.filter((e) => e.status === 'inactive').length,
          suspended: employees.filter((e) => e.status === 'suspended').length,
          admins: employees.filter((e) => e.role === 'admin').length,
          employees: employees.filter((e) => e.role === 'employee').length,
          totalSalary: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0)
        };
      },

      /**
       * Search employees
       * @param {string} query - Search query
       * @returns {Array} Matching employees
       */
      searchEmployees: (query) => {
        const { employees } = get();
        const searchLower = query.toLowerCase();

        return employees.filter(
          (emp) =>
            emp.name?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower) ||
            emp.designation?.toLowerCase().includes(searchLower) ||
            emp.phone?.includes(query)
        );
      },

      /**
       * Update employee status
       * @param {string} employeeId - Employee ID
       * @param {string} status - New status
       */
      updateEmployeeStatus: (employeeId, status) => {
        get().updateEmployee(employeeId, { status });
      },

      /**
       * Bulk update employees
       * @param {Array} employeeIds - Array of employee IDs
       * @param {Object} updates - Updates to apply
       */
      bulkUpdateEmployees: (employeeIds, updates) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            employeeIds.includes(emp._id) ? { ...emp, ...updates } : emp
          )
        }));
      },

      /**
       * Clear all employees
       */
      clearEmployees: () => {
        set({
          employees: [],
          selectedEmployee: null,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        });
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set({
          employees: [],
          selectedEmployee: null,
          filters: {
            search: '',
            department: '',
            status: 'active',
            role: '',
            sortBy: 'name',
            sortOrder: 'asc'
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          },
          loading: false,
          error: null
        });
      }
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        // Only persist filters and pagination
        filters: state.filters,
        pagination: state.pagination
      })
    }
  )
);

export default useEmployeeStore;