import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  MoreVertical,
  X,
  Save,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Eye,
  UserPlus,
  Filter
} from 'lucide-react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments';
import { getEmployees } from '../../api/employees';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

/**
 * DepartmentList Page
 * Manage company departments and their details
 */
const DepartmentList = () => {
  // State
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
    location: '',
    budget: '',
    email: '',
    phone: ''
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartments();
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      headOfDepartment: '',
      location: '',
      budget: '',
      email: '',
      phone: ''
    });
  };

  const handleCreateClick = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditClick = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name || '',
      description: department.description || '',
      headOfDepartment: department.headOfDepartment?._id || '',
      location: department.location || '',
      budget: department.budget || '',
      email: department.email || '',
      phone: department.phone || ''
    });
    setShowEditModal(true);
  };

  const handleDetailsClick = (department) => {
    setSelectedDepartment(department);
    setShowDetailsModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createDepartment(formData);
      setSuccess('Department created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await updateDepartment(selectedDepartment._id, formData);
      setSuccess('Department updated successfully!');
      setShowEditModal(false);
      setSelectedDepartment(null);
      resetForm();
      fetchDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (departmentId, departmentName) => {
    if (!window.confirm(`Are you sure you want to delete "${departmentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDepartment(departmentId);
      setSuccess('Department deleted successfully!');
      fetchDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete department');
    }
  };

  const getEmployeeCount = (departmentId) => {
    return employees.filter(emp => emp.department?._id === departmentId).length;
  };

  const getDepartmentEmployees = (departmentId) => {
    return employees.filter(emp => emp.department?._id === departmentId);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filter departments
  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    totalDepartments: departments.length,
    totalEmployees: employees.length,
    avgEmployeesPerDept: departments.length > 0 
      ? Math.round(employees.length / departments.length) 
      : 0,
    totalBudget: departments.reduce((sum, dept) => sum + (Number(dept.budget) || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Building className="w-7 h-7 text-white" />
                </div>
                Departments
              </h1>
              <p className="text-gray-600 mt-2">Manage company departments and organizational structure</p>
            </div>

            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Department
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}

        {success && (
          <div className="mb-6">
            <Alert type="success" message={success} dismissible onClose={() => setSuccess('')} />
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalDepartments}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Departments</h3>
            <p className="text-xs text-gray-500 mt-1">Active departments</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Employees</h3>
            <p className="text-xs text-gray-500 mt-1">Across all departments</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.avgEmployeesPerDept}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Average Team Size</h3>
            <p className="text-xs text-gray-500 mt-1">Employees per department</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Budget</h3>
            <p className="text-xs text-gray-500 mt-1">Combined department budgets</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredDepartments.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{departments.length}</span> departments
          </div>
        </div>

        {/* Departments List/Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" text="Loading departments..." />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Building className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No departments found</p>
              <p className="text-sm mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first department'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateClick}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Department
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <DepartmentCard
                key={department._id}
                department={department}
                employeeCount={getEmployeeCount(department._id)}
                onEdit={() => handleEditClick(department)}
                onDelete={() => handleDelete(department._id, department.name)}
                onViewDetails={() => handleDetailsClick(department)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredDepartments.map((department) => (
                <DepartmentListItem
                  key={department._id}
                  department={department}
                  employeeCount={getEmployeeCount(department._id)}
                  onEdit={() => handleEditClick(department)}
                  onDelete={() => handleDelete(department._id, department.name)}
                  onViewDetails={() => handleDetailsClick(department)}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <DepartmentModal
          title="Create Department"
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleCreate}
          onClose={() => setShowCreateModal(false)}
          submitting={submitting}
          employees={employees}
        />
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <DepartmentModal
          title="Edit Department"
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDepartment(null);
          }}
          submitting={submitting}
          employees={employees}
          isEdit
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDepartment && (
        <DepartmentDetailsModal
          department={selectedDepartment}
          employees={getDepartmentEmployees(selectedDepartment._id)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDepartment(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            handleEditClick(selectedDepartment);
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

/**
 * DepartmentCard Component
 * Grid view card for department
 */
const DepartmentCard = ({ department, employeeCount, onEdit, onDelete, onViewDetails, formatCurrency }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 relative">
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onViewDetails();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Department Icon */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center">
            <Building className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-6 pb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{department.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
          {department.description || 'No description available'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Employees</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{employeeCount}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Budget</span>
            </div>
            <p className="text-lg font-bold text-green-900">{formatCurrency(department.budget)}</p>
          </div>
        </div>

        {/* Head of Department */}
        {department.headOfDepartment && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 mb-1">Head of Department</p>
            <p className="font-semibold text-gray-900">{department.headOfDepartment.name}</p>
          </div>
        )}

        {/* Location */}
        {department.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{department.location}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onViewDetails}
          className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/**
 * DepartmentListItem Component
 * List view item for department
 */
const DepartmentListItem = ({ department, employeeCount, onEdit, onDelete, onViewDetails, formatCurrency }) => {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Building className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{department.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">Employees</p>
            <p className="text-2xl font-bold text-gray-900">{employeeCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(department.budget)}</p>
          </div>
          {department.headOfDepartment && (
            <div className="text-center">
              <p className="text-sm text-gray-600">Head</p>
              <p className="font-semibold text-gray-900">{department.headOfDepartment.name}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onViewDetails}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * DepartmentModal Component
 * Modal for creating/editing department
 */
const DepartmentModal = ({ title, formData, onInputChange, onSubmit, onClose, submitting, employees, isEdit = false }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            {/* Department Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Engineering"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Brief description of the department..."
              />
            </div>

            {/* Head of Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Head of Department
              </label>
              <select
                name="headOfDepartment"
                value={formData.headOfDepartment}
                onChange={onInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Office location"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="dept@company.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Update Department' : 'Create Department'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * DepartmentDetailsModal Component
 * Modal showing department details and employees
 */
const DepartmentDetailsModal = ({ department, employees, onClose, onEdit, formatCurrency }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl border-4 border-white flex items-center justify-center">
              <Building className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          {/* Department Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{department.name}</h2>
                <p className="text-gray-600">{department.description || 'No description available'}</p>
              </div>
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Employees</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">{employees.length}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Budget</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(department.budget)}</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Avg Salary</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {employees.length > 0
                  ? formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length)
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-6">
              {department.headOfDepartment && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Head of Department</p>
                    <p className="font-semibold text-gray-900">{department.headOfDepartment.name}</p>
                  </div>
                </div>
              )}
              {department.location && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{department.location}</p>
                  </div>
                </div>
              )}
              {department.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{department.email}</p>
                  </div>
                </div>
              )}
              {department.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{department.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employees List */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Department Employees ({employees.length})</h3>
            {employees.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No employees in this department</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-200 max-h-80 overflow-y-auto">
                {employees.map((employee) => (
                  <div key={employee._id} className="p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {employee.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.designation}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;