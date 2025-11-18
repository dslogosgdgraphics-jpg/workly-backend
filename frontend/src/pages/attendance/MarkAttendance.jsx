import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Coffee,
  Save,
  X,
  Search,
  Filter,
  Download,
  Upload,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { getEmployees } from '../../api/employees';
import { markAttendance, getAttendance, deleteAttendance } from '../../api/attendance';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import Dropdown from '../../components/common/Dropdown';

/**
 * MarkAttendance Page
 * Admin page for manually marking employee attendance
 */
const MarkAttendance = () => {
  // State
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkInTime: '09:00',
    checkOutTime: '18:00',
    notes: ''
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch attendance records when date changes
  useEffect(() => {
    fetchAttendanceRecords();
  }, [dateFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await getAttendance({
        startDate: dateFilter,
        endDate: dateFilter
      });
      setAttendanceRecords(response.data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeId) {
      setError('Please select an employee');
      return;
    }

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await markAttendance({
        employeeId: formData.employeeId,
        date: formData.date,
        status: formData.status,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        notes: formData.notes
      });

      setSuccess('Attendance marked successfully!');
      
      // Reset form
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        checkInTime: '09:00',
        checkOutTime: '18:00',
        notes: ''
      });

      // Refresh attendance records
      fetchAttendanceRecords();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const promises = selectedEmployees.map(empId =>
        markAttendance({
          employeeId: empId,
          date: formData.date,
          status: formData.status,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          notes: formData.notes
        })
      );

      await Promise.all(promises);

      setSuccess(`Attendance marked for ${selectedEmployees.length} employee(s)!`);
      setSelectedEmployees([]);
      fetchAttendanceRecords();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to mark bulk attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await deleteAttendance(recordId);
      setSuccess('Attendance record deleted successfully');
      fetchAttendanceRecords();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete attendance record');
    }
  };

  const toggleEmployeeSelection = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const selectAllEmployees = () => {
    const filteredEmpIds = filteredEmployees.map(emp => emp._id);
    setSelectedEmployees(filteredEmpIds);
  };

  const deselectAllEmployees = () => {
    setSelectedEmployees([]);
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      late: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-4 h-4" />
      },
      absent: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="w-4 h-4" />
      },
      'half-day': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Coffee className="w-4 h-4" />
      }
    };

    const badge = badges[status] || badges.present;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get employees who already have attendance for selected date
  const employeesWithAttendance = attendanceRecords.map(record => record.employee?._id);

  // Filter out employees who already have attendance
  const availableEmployees = filteredEmployees.filter(
    emp => !employeesWithAttendance.includes(emp._id)
  );

  const employeeOptions = availableEmployees.map(emp => ({
    value: emp._id,
    label: `${emp.name} - ${emp.designation}`
  }));

  const statusOptions = [
    { value: 'present', label: 'Present' },
    { value: 'late', label: 'Late' },
    { value: 'absent', label: 'Absent' },
    { value: 'half-day', label: 'Half Day' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                Mark Attendance
              </h1>
              <p className="text-gray-600 mt-2">Manually mark attendance for employees</p>
            </div>

            <button
              onClick={() => setShowBulkMode(!showBulkMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                showBulkMode
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showBulkMode ? 'Single Mode' : 'Bulk Mode'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              dismissible
              onClose={() => setError('')}
            />
          </div>
        )}

        {success && (
          <div className="mb-6">
            <Alert
              type="success"
              message={success}
              dismissible
              onClose={() => setSuccess('')}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                {showBulkMode ? 'Bulk Attendance' : 'Mark Attendance'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Employee Selection (Single Mode) */}
                {!showBulkMode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Employee <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      options={employeeOptions}
                      value={formData.employeeId}
                      onChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
                      placeholder="Select employee"
                      searchable
                    />
                    {availableEmployees.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        All employees have attendance marked for this date
                      </p>
                    )}
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Check In Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check In Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Check Out Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check Out Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Add any notes..."
                  />
                </div>

                {/* Submit Button */}
                {!showBulkMode ? (
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Mark Attendance</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    disabled={submitting || selectedEmployees.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        <span>Mark for {selectedEmployees.length} Employee(s)</span>
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Records Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bulk Mode - Employee Selection */}
            {showBulkMode && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Select Employees</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllEmployees}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Select All
                      </button>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={deselectAllEmployees}
                        className="text-sm text-gray-600 hover:text-gray-700 font-semibold"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : availableEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="font-medium">No employees available</p>
                      <p className="text-sm">All employees have attendance marked for this date</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {availableEmployees.map(employee => (
                        <label
                          key={employee._id}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                            selectedEmployees.includes(employee._id)
                              ? 'bg-indigo-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={() => toggleEmployeeSelection(employee._id)}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.designation}</p>
                          </div>
                          {selectedEmployees.includes(employee._id) && (
                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {selectedEmployees.length > 0 && (
                  <div className="p-4 bg-indigo-50 border-t border-indigo-100">
                    <p className="text-sm text-indigo-900 font-semibold">
                      {selectedEmployees.length} employee(s) selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Today's Attendance Records */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Attendance Records for {new Date(dateFilter).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {attendanceRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="font-medium">No attendance records</p>
                    <p className="text-sm">Start marking attendance for employees</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {attendanceRecords.map(record => (
                      <div key={record._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                              {record.employee?.name?.charAt(0) || 'N'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {record.employee?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {record.employee?.designation || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Check In</p>
                              <p className="font-semibold text-gray-900">
                                {record.checkInTime || '--:--'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Check Out</p>
                              <p className="font-semibold text-gray-900">
                                {record.checkOutTime || '--:--'}
                              </p>
                            </div>
                            <div>
                              {getStatusBadge(record.status)}
                            </div>
                            <button
                              onClick={() => handleDelete(record._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="mt-3 pl-16">
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                              <span className="font-semibold">Note:</span> {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {attendanceRecords.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Total: <span className="font-semibold text-gray-900">{attendanceRecords.length}</span> record(s)
                    </span>
                    <div className="flex items-center gap-4">
                      {Object.entries(
                        attendanceRecords.reduce((acc, record) => {
                          acc[record.status] = (acc[record.status] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([status, count]) => (
                        <span key={status} className="text-gray-600">
                          <span className="capitalize">{status}:</span>{' '}
                          <span className="font-semibold text-gray-900">{count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;