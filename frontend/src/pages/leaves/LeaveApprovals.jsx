import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Filter,
  Search,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  TrendingUp,
  Users,
  Download,
  X
} from 'lucide-react';
import { getLeaves, approveLeave, rejectLeave } from '../../api/leaves';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';

/**
 * LeaveApprovals Page
 * Admin page for approving/rejecting employee leave requests
 */
const LeaveApprovals = () => {
  // State
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [notes, setNotes] = useState('');

  // Fetch leaves on mount and when filters change
  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, activeTab, searchTerm, typeFilter, dateRange]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await getLeaves();
      setLeaves(response.data || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];

    // Filter by status (tab)
    if (activeTab !== 'all') {
      filtered = filtered.filter(leave => leave.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(leave =>
        leave.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(leave => leave.type === typeFilter);
    }

    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(leave => {
        const leaveStart = new Date(leave.startDate);
        const filterStart = new Date(dateRange.startDate);
        const filterEnd = new Date(dateRange.endDate);
        return leaveStart >= filterStart && leaveStart <= filterEnd;
      });
    }

    setFilteredLeaves(filtered);
  };

  const handleApproveClick = (leave) => {
    setSelectedLeave(leave);
    setNotes('');
    setShowApprovalModal(true);
  };

  const handleRejectClick = (leave) => {
    setSelectedLeave(leave);
    setNotes('');
    setShowRejectionModal(true);
  };

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const handleApprove = async () => {
    if (!selectedLeave) return;

    setProcessing(true);
    setError('');

    try {
      await approveLeave(selectedLeave._id, { notes });
      setSuccess(`Leave request approved for ${selectedLeave.employee?.name}`);
      setShowApprovalModal(false);
      setSelectedLeave(null);
      setNotes('');
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to approve leave request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;

    if (!notes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await rejectLeave(selectedLeave._id, { notes });
      setSuccess(`Leave request rejected for ${selectedLeave.employee?.name}`);
      setShowRejectionModal(false);
      setSelectedLeave(null);
      setNotes('');
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reject leave request');
    } finally {
      setProcessing(false);
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const getLeaveTypeBadge = (type) => {
    const badges = {
      sick: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Sick Leave'
      },
      casual: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Casual Leave'
      },
      annual: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Annual Leave'
      },
      unpaid: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Unpaid Leave'
      }
    };

    const badge = badges[type] || badges.casual;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-3 h-3" />
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-3 h-3" />
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="w-3 h-3" />
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: stats.pending, icon: <Clock className="w-4 h-4" /> },
    { id: 'approved', label: 'Approved', count: stats.approved, icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'rejected', label: 'Rejected', count: stats.rejected, icon: <XCircle className="w-4 h-4" /> },
    { id: 'all', label: 'All Requests', count: stats.total, icon: <FileText className="w-4 h-4" /> }
  ];

  const leaveTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'annual', label: 'Annual Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' }
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
                Leave Approvals
              </h1>
              <p className="text-gray-600 mt-2">Review and manage employee leave requests</p>
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
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Pending Requests</h3>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.approved}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Approved</h3>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.rejected}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Rejected</h3>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Requests</h3>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="underline"
            />
          </div>

          {/* Filters */}
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employee or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Start Date"
              />

              {/* End Date */}
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="End Date"
              />
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredLeaves.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{leaves.length}</span> requests
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Calendar className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No leave requests found</p>
              <p className="text-sm">
                {activeTab === 'pending' 
                  ? "No pending requests to review" 
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLeaves.map((leave) => (
                <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    {/* Employee Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                        {leave.employee?.name?.charAt(0) || 'N'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {leave.employee?.name || 'Unknown Employee'}
                          </h3>
                          {getLeaveTypeBadge(leave.type)}
                          {getStatusBadge(leave.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {leave.employee?.designation || 'N/A'} • {leave.employee?.email || 'N/A'}
                        </p>
                        
                        {/* Leave Duration */}
                        <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{formatDate(leave.startDate)}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium">{formatDate(leave.endDate)}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                            {calculateDuration(leave.startDate, leave.endDate)} day(s)
                          </span>
                        </div>

                        {/* Reason */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-700">Reason:</span> {leave.reason}
                          </p>
                        </div>

                        {/* Review Info */}
                        {leave.status !== 'pending' && leave.reviewedBy && (
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>
                              Reviewed by <span className="font-semibold">{leave.reviewedBy?.name || 'Admin'}</span>
                            </span>
                            <span>•</span>
                            <span>{formatDate(leave.reviewedAt)}</span>
                            {leave.reviewNotes && (
                              <>
                                <span>•</span>
                                <span className="italic">"{leave.reviewNotes}"</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2 flex-shrink-0">
                      {leave.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveClick(leave)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(leave)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleViewDetails(leave)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Approve Leave</h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to approve the leave request for{' '}
                <span className="font-semibold">{selectedLeave.employee?.name}</span>?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold capitalize">{selectedLeave.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">
                    {calculateDuration(selectedLeave.startDate, selectedLeave.endDate)} day(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates:</span>
                  <span className="font-semibold">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Add any notes for the employee..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve Leave</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Reject Leave</h3>
              </div>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject the leave request for{' '}
                <span className="font-semibold">{selectedLeave.employee?.name}</span>?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold capitalize">{selectedLeave.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">
                    {calculateDuration(selectedLeave.startDate, selectedLeave.endDate)} day(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates:</span>
                  <span className="font-semibold">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Please provide a reason for rejection..."
              />
              <p className="text-xs text-gray-500 mt-1">This message will be visible to the employee</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !notes.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Reject Leave</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Leave Request Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  {selectedLeave.employee?.name?.charAt(0) || 'N'}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{selectedLeave.employee?.name}</h4>
                  <p className="text-sm text-gray-600">{selectedLeave.employee?.designation}</p>
                  <p className="text-sm text-gray-500">{selectedLeave.employee?.email}</p>
                </div>
                {getStatusBadge(selectedLeave.status)}
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Leave Type</p>
                  {getLeaveTypeBadge(selectedLeave.type)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {calculateDuration(selectedLeave.startDate, selectedLeave.endDate)} day(s)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedLeave.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedLeave.endDate)}</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Reason</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedLeave.reason}</p>
                </div>
              </div>

              {/* Review Info */}
              {selectedLeave.status !== 'pending' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Review Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reviewed By:</span>
                      <span className="font-semibold">{selectedLeave.reviewedBy?.name || 'Admin'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reviewed At:</span>
                      <span className="font-semibold">{formatDate(selectedLeave.reviewedAt)}</span>
                    </div>
                    {selectedLeave.reviewNotes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <p className="font-semibold mt-1">{selectedLeave.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;