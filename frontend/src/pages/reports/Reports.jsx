import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  PieChart,
  Activity,
  Filter,
  Search,
  ChevronRight,
  Briefcase,
  Target,
  Receipt,
  Award,
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Printer,
  Mail
} from 'lucide-react';
import {
  getAttendanceReport,
  getPayrollReport,
  getLeaveReport,
  getPerformanceReport,
  getExpenseReport,
  getDashboardStats
} from '../../api/reports';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { LineChart, BarChart, PieChart as PieChartComponent } from '../../components/charts';

/**
 * Reports Page
 * Comprehensive reporting and analytics dashboard
 */
const Reports = () => {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dashboardStats, setDashboardStats] = useState(null);

  // Filter state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStats();
      setDashboardStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    setGeneratingReport(true);
    setError('');
    setReportData(null);

    try {
      let response;
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      switch (reportType) {
        case 'attendance':
          response = await getAttendanceReport(params);
          break;
        case 'payroll':
          response = await getPayrollReport(params);
          break;
        case 'leave':
          response = await getLeaveReport(params);
          break;
        case 'performance':
          response = await getPerformanceReport(params);
          break;
        case 'expense':
          response = await getExpenseReport(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReportData(response.data);
      setSelectedReport(reportType);
      setSuccess('Report generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExportReport = (format = 'pdf') => {
    if (!reportData) return;

    setSuccess(`Exporting report as ${format.toUpperCase()}...`);
    // Implement actual export logic here
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const reportTypes = [
    {
      id: 'attendance',
      name: 'Attendance Report',
      description: 'Employee attendance tracking and analysis',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'payroll',
      name: 'Payroll Report',
      description: 'Salary payments and compensation summary',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'leave',
      name: 'Leave Report',
      description: 'Time-off requests and leave balances',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Employee performance reviews and ratings',
      icon: <Award className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'expense',
      name: 'Expense Report',
      description: 'Employee expenses and reimbursements',
      icon: <Receipt className="w-8 h-8" />,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200'
    },
    {
      id: 'employee',
      name: 'Employee Report',
      description: 'Headcount, turnover, and demographics',
      icon: <Users className="w-8 h-8" />,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">Generate comprehensive reports and insights</p>
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

        {/* Quick Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" text="Loading statistics..." />
          </div>
        ) : dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{dashboardStats.totalEmployees || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Employees</h3>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{dashboardStats.attendanceRate || 0}%</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Attendance Rate</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.monthlyPayroll || 0)}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Monthly Payroll</h3>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{dashboardStats.activeProjects || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Active Goals</h3>
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            Report Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchDashboardStats}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Report Types Grid */}
        {!selectedReport ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select Report Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onGenerate={() => handleGenerateReport(report.id)}
                  loading={generatingReport}
                />
              ))}
            </div>
          </div>
        ) : (
          <ReportViewer
            reportType={selectedReport}
            reportData={reportData}
            dateRange={dateRange}
            onBack={() => {
              setSelectedReport(null);
              setReportData(null);
            }}
            onExport={handleExportReport}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

/**
 * ReportCard Component
 */
const ReportCard = ({ report, onGenerate, loading }) => {
  return (
    <div className={`bg-gradient-to-br ${report.bgColor} rounded-xl p-6 border ${report.borderColor} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-16 h-16 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {report.icon}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{report.name}</h3>
      <p className="text-sm text-gray-600 mb-6">{report.description}</p>

      <button
        onClick={onGenerate}
        disabled={loading}
        className={`w-full py-2.5 bg-gradient-to-r ${report.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            <span>Generate Report</span>
          </>
        )}
      </button>
    </div>
  );
};

/**
 * ReportViewer Component
 */
const ReportViewer = ({ reportType, reportData, dateRange, onBack, onExport, formatCurrency, formatDate }) => {
  if (!reportData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Spinner size="lg" text="Loading report..." />
        </div>
      </div>
    );
  }

  const getReportTitle = () => {
    const titles = {
      attendance: 'Attendance Report',
      payroll: 'Payroll Report',
      leave: 'Leave Report',
      performance: 'Performance Report',
      expense: 'Expense Report',
      employee: 'Employee Report'
    };
    return titles[reportType] || 'Report';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Reports
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getReportTitle()}</h2>
          <p className="text-sm text-gray-600">
            Period: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
          </p>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'attendance' && <AttendanceReport data={reportData} formatDate={formatDate} />}
      {reportType === 'payroll' && <PayrollReport data={reportData} formatCurrency={formatCurrency} formatDate={formatDate} />}
      {reportType === 'leave' && <LeaveReport data={reportData} formatDate={formatDate} />}
      {reportType === 'performance' && <PerformanceReport data={reportData} />}
      {reportType === 'expense' && <ExpenseReport data={reportData} formatCurrency={formatCurrency} formatDate={formatDate} />}
    </div>
  );
};

/**
 * AttendanceReport Component
 */
const AttendanceReport = ({ data, formatDate }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Days</p>
          <p className="text-3xl font-bold text-gray-900">{data.summary?.totalDays || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-600 mb-1">Present</p>
          <p className="text-3xl font-bold text-green-900">{data.summary?.present || 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-600 mb-1">Absent</p>
          <p className="text-3xl font-bold text-red-900">{data.summary?.absent || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-yellow-600 mb-1">Late</p>
          <p className="text-3xl font-bold text-yellow-900">{data.summary?.late || 0}</p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Detailed Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Late</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.records?.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{record.employee?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{record.employee?.designation || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">{record.present || 0}</td>
                  <td className="px-6 py-4 font-semibold text-red-600">{record.absent || 0}</td>
                  <td className="px-6 py-4 font-semibold text-yellow-600">{record.late || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 rounded-full h-2"
                          style={{ width: `${record.attendanceRate || 0}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900">{record.attendanceRate || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * PayrollReport Component
 */
const PayrollReport = ({ data, formatCurrency, formatDate }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-600 mb-1">Total Payroll</p>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(data.summary?.totalPayroll || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Employees Paid</p>
          <p className="text-3xl font-bold text-blue-900">{data.summary?.employeesPaid || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-600 mb-1">Average Salary</p>
          <p className="text-3xl font-bold text-purple-900">{formatCurrency(data.summary?.averageSalary || 0)}</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Payroll Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bonuses</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.records?.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{record.employee?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{record.employee?.designation || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(record.basicSalary || 0)}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">+{formatCurrency(record.bonuses || 0)}</td>
                  <td className="px-6 py-4 font-semibold text-red-600">-{formatCurrency(record.deductions || 0)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(record.totalSalary || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      record.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * LeaveReport Component
 */
const LeaveReport = ({ data, formatDate }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900">{data.summary?.totalRequests || 0}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-900">{data.summary?.approved || 0}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-yellow-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-900">{data.summary?.pending || 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-900">{data.summary?.rejected || 0}</p>
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Leave Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.records?.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{record.employee?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize font-medium text-gray-900">{record.type || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{formatDate(record.startDate)}</td>
                  <td className="px-6 py-4 text-gray-900">{formatDate(record.endDate)}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{record.days || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      record.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * PerformanceReport Component
 */
const PerformanceReport = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-600 mb-1">Total Reviews</p>
          <p className="text-3xl font-bold text-orange-900">{data.summary?.totalReviews || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-600 mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-green-900">{data.summary?.averageRating || 0}/5</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">Completed Reviews</p>
          <p className="text-3xl font-bold text-blue-900">{data.summary?.completed || 0}</p>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Performance Reviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Overall Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Work Quality</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Productivity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teamwork</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.records?.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{record.employee?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{record.employee?.designation || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-orange-600 text-lg">{record.overallRating || 0}</span>
                      <span className="text-gray-600">/5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{record.workQuality || 0}/5</td>
                  <td className="px-6 py-4 text-gray-900">{record.productivity || 0}/5</td>
                  <td className="px-6 py-4 text-gray-900">{record.teamwork || 0}/5</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      record.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * ExpenseReport Component
 */
const ExpenseReport = ({ data, formatCurrency, formatDate }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
          <p className="text-sm text-teal-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-teal-900">{formatCurrency(data.summary?.totalExpenses || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(data.summary?.approved || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-yellow-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-900">{formatCurrency(data.summary?.pending || 0)}</p>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Expense Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.records?.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{record.employee?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{record.description || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-900">{record.category || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{formatDate(record.date)}</td>
                  <td className="px-6 py-4 font-bold text-teal-600">{formatCurrency(record.amount || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      record.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;