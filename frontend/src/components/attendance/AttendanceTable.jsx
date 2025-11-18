import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Coffee,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye
} from 'lucide-react';
import { getAttendance, deleteAttendance } from '../../api/attendance';

const AttendanceTable = ({ employeeId = null, isAdmin = false, onViewDetails = null }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAttendance();
  }, [dateRange, employeeId]);

  useEffect(() => {
    filterAndSortData();
  }, [attendanceData, searchTerm, statusFilter, sortConfig]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(employeeId && { employeeId })
      };

      const response = await getAttendance(params);
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortData = () => {
    let filtered = [...attendanceData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested employee name
      if (sortConfig.key === 'employee') {
        aValue = a.employee?.name || '';
        bValue = b.employee?.name || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await deleteAttendance(id);
      setAttendanceData(attendanceData.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Failed to delete attendance record');
    }
  };

  const handleExport = () => {
    // Convert data to CSV
    const headers = ['Date', 'Employee', 'Check In', 'Check Out', 'Status', 'Notes'];
    const csvData = filteredData.map((item) => [
      new Date(item.date).toLocaleDateString(),
      item.employee?.name || 'N/A',
      item.checkInTime || 'N/A',
      item.checkOutTime || 'N/A',
      item.status,
      item.notes || ''
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            Attendance Records
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>

          {/* Start Date */}
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          {/* End Date */}
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{currentItems.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{filteredData.length}</span> records
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Calendar className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No attendance records found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  onClick={() => handleSort('date')}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Date
                    {getSortIcon('date')}
                  </div>
                </th>
                {!employeeId && (
                  <th
                    onClick={() => handleSort('employee')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Employee
                      {getSortIcon('employee')}
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Check Out
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Hours
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('default', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  {!employeeId && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {record.employee?.name?.charAt(0) || 'N'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.employee?.designation || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {record.checkInTime || '--:--'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {record.checkOutTime || '--:--'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {calculateWorkHours(record.checkInTime, record.checkOutTime)}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(record)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate work hours
const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '--:--';
  
  const [inHour, inMinute] = checkIn.split(':').map(Number);
  const [outHour, outMinute] = checkOut.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMinute;
  const outMinutes = outHour * 60 + outMinute;
  
  const diffMinutes = outMinutes - inMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

export default AttendanceTable;