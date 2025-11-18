import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Calculator,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  Plus,
  Trash2,
  Save,
  FileText,
  Clock,
  Award,
  Minus
} from 'lucide-react';
import { getEmployees } from '../../api/employees';
import { generatePayroll, getPayroll } from '../../api/payroll';
import { getAttendance } from '../../api/attendance';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';

/**
 * GeneratePayroll Page
 * Admin page for generating monthly payroll
 */
const GeneratePayroll = () => {
  // State
  const [employees, setEmployees] = useState([]);
  const [existingPayroll, setExistingPayroll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Custom adjustments
  const [customAdjustments, setCustomAdjustments] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (month) {
      fetchExistingPayroll();
    }
  }, [month]);

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

  const fetchExistingPayroll = async () => {
    try {
      const response = await getPayroll({ month });
      setExistingPayroll(response.data || []);
    } catch (err) {
      console.error('Error fetching payroll:', err);
    }
  };

  const handleGeneratePayroll = async () => {
    if (!month) {
      setError('Please select a month');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await generatePayroll({ month });
      
      if (response.errors && response.errors.length > 0) {
        setError(`Payroll generated with some errors: ${response.errors.join(', ')}`);
      } else {
        setSuccess(`Payroll generated successfully for ${response.data?.length || 0} employees!`);
      }

      fetchExistingPayroll();
      setSelectedEmployees([]);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!month) {
      setError('Please select a month');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate preview data
      const [year, monthNum] = month.split('-').map(Number);
      const totalDays = new Date(year, monthNum, 0).getDate();

      const preview = await Promise.all(
        employees
          .filter(emp => emp.status === 'active')
          .map(async (emp) => {
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0);

            // Get attendance
            const attendanceResponse = await getAttendance({
              employeeId: emp._id,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0]
            });

            const daysPresent = attendanceResponse.data?.filter(
              a => a.status === 'present' || a.status === 'late'
            ).length || 0;

            const adjustment = customAdjustments[emp._id] || {
              overtime: 0,
              bonuses: 0,
              deductions: 0
            };

            const dailyRate = emp.salary / totalDays;
            const earnedSalary = dailyRate * daysPresent;
            const totalSalary = Math.round(
              earnedSalary + adjustment.overtime + adjustment.bonuses - adjustment.deductions
            );

            return {
              employee: emp,
              totalDays,
              daysPresent,
              basicSalary: emp.salary,
              overtime: adjustment.overtime,
              bonuses: adjustment.bonuses,
              deductions: adjustment.deductions,
              totalSalary
            };
          })
      );

      setPreviewData(preview);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentChange = (employeeId, field, value) => {
    setCustomAdjustments(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: Number(value) || 0
      }
    }));
  };

  const toggleEmployeeSelection = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(filteredEmployees.map(emp => emp._id));
  };

  const deselectAllEmployees = () => {
    setSelectedEmployees([]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && emp.status === 'active';
  });

  // Get employees who already have payroll
  const employeesWithPayroll = existingPayroll.map(p => p.employee?._id);

  // Calculate totals
  const stats = {
    totalEmployees: employees.filter(e => e.status === 'active').length,
    payrollGenerated: existingPayroll.length,
    remaining: employees.filter(e => e.status === 'active').length - existingPayroll.length,
    totalAmount: existingPayroll.reduce((sum, p) => sum + p.totalSalary, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                Generate Payroll
              </h1>
              <p className="text-gray-600 mt-2">Generate monthly payroll for employees</p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Report
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Employees</h3>
            <p className="text-xs text-gray-500 mt-1">Active employees</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.payrollGenerated}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Payroll Generated</h3>
            <p className="text-xs text-gray-500 mt-1">For selected month</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.remaining}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Remaining</h3>
            <p className="text-xs text-gray-500 mt-1">Not yet generated</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Amount</h3>
            <p className="text-xs text-gray-500 mt-1">For this month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Payroll Controls
              </h2>

              <div className="space-y-4">
                {/* Month Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Month <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Payroll Calculation</p>
                      <p className="text-xs text-blue-700">
                        Payroll is calculated based on attendance records, overtime, bonuses, and deductions for the selected month.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Existing Payroll Warning */}
                {existingPayroll.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">Existing Payroll Found</p>
                        <p className="text-xs text-amber-700">
                          Payroll already exists for {existingPayroll.length} employee(s) in this month. Generating again will skip existing records.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <button
                    onClick={handlePreview}
                    disabled={loading || !month}
                    className="w-full py-2.5 bg-white border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Preview Calculation
                  </button>

                  <button
                    onClick={handleGeneratePayroll}
                    disabled={generating || !month}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        <span>Generate Payroll</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={fetchExistingPayroll}
                    disabled={loading}
                    className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Payroll List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Generated Payroll for {month ? new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Selected Month'}
                  </h3>
                </div>
              </div>

              <div className="max-h-[700px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Spinner size="lg" />
                  </div>
                ) : existingPayroll.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Calculator className="w-20 h-20 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No payroll generated</p>
                    <p className="text-sm">Generate payroll for this month to see records</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {existingPayroll.map((payroll) => (
                      <div key={payroll._id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                              {payroll.employee?.name?.charAt(0) || 'N'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {payroll.employee?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {payroll.employee?.designation || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Days Present</p>
                              <p className="font-bold text-gray-900">
                                {payroll.daysPresent}/{payroll.totalDays}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Basic Salary</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(payroll.basicSalary)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Net Salary</p>
                              <p className="font-bold text-green-600 text-lg">
                                {formatCurrency(payroll.totalSalary)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payroll.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : payroll.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown */}
                        {(payroll.overtime > 0 || payroll.bonuses > 0 || payroll.deductions > 0) && (
                          <div className="mt-3 pl-16 grid grid-cols-3 gap-4 text-sm">
                            {payroll.overtime > 0 && (
                              <div className="bg-blue-50 rounded-lg p-2">
                                <p className="text-xs text-blue-600">Overtime</p>
                                <p className="font-semibold text-blue-900">
                                  +{formatCurrency(payroll.overtime)}
                                </p>
                              </div>
                            )}
                            {payroll.bonuses > 0 && (
                              <div className="bg-green-50 rounded-lg p-2">
                                <p className="text-xs text-green-600">Bonuses</p>
                                <p className="font-semibold text-green-900">
                                  +{formatCurrency(payroll.bonuses)}
                                </p>
                              </div>
                            )}
                            {payroll.deductions > 0 && (
                              <div className="bg-red-50 rounded-lg p-2">
                                <p className="text-xs text-red-600">Deductions</p>
                                <p className="font-semibold text-red-900">
                                  -{formatCurrency(payroll.deductions)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Footer */}
              {existingPayroll.length > 0 && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Payroll</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(stats.totalAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Generated For</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {existingPayroll.length} Employee{existingPayroll.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payroll Preview</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {month ? new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Selected Month'}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  <FileText className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {previewData.map((data) => (
                  <div key={data.employee._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {data.employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{data.employee.name}</p>
                          <p className="text-sm text-gray-600">{data.employee.designation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(data.totalSalary)}
                        </p>
                        <p className="text-xs text-gray-500">Net Salary</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Basic Salary</p>
                        <p className="font-bold text-gray-900">{formatCurrency(data.basicSalary)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Days Present</p>
                        <p className="font-bold text-gray-900">{data.daysPresent}/{data.totalDays}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 mb-1">Overtime</p>
                        <p className="font-bold text-blue-900">+{formatCurrency(data.overtime)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 mb-1">Bonuses</p>
                        <p className="font-bold text-green-900">+{formatCurrency(data.bonuses)}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 mb-1">Deductions</p>
                        <p className="font-bold text-red-900">-{formatCurrency(data.deductions)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Payroll Amount</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(previewData.reduce((sum, d) => sum + d.totalSalary, 0))}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-white transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      handleGeneratePayroll();
                    }}
                    disabled={generating}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    Confirm & Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePayroll;