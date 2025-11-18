import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Receipt,
  TrendingUp,
  AlertCircle,
  FileText,
  User,
  Trash2,
  MessageSquare
} from 'lucide-react';
import {
  getExpenses,
  getMyExpenses,
  approveExpense,
  rejectExpense,
  deleteExpense,
  getExpenseCategories,
  exportExpenses
} from '../../api/expenses';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import Tabs from '../../components/common/Tabs';
import { useNavigate } from 'react-router-dom';

/**
 * ExpenseList Page
 * Manage and approve employee expenses
 */
const ExpenseList = () => {
  const navigate = useNavigate();

  // State
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User role (should come from auth context)
  const [userRole] = useState('admin'); // 'admin' or 'employee'

  // Filter state
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [userRole]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = userRole === 'admin' 
        ? await getExpenses()
        : await getMyExpenses();
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getExpenseCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedExpense) return;

    try {
      await approveExpense(selectedExpense._id, { notes });
      setSuccess(`Expense approved for ${selectedExpense.employee?.name}`);
      setShowApprovalModal(false);
      setSelectedExpense(null);
      setNotes('');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to approve expense');
    }
  };

  const handleReject = async () => {
    if (!selectedExpense) return;

    if (!notes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectExpense(selectedExpense._id, { notes });
      setSuccess(`Expense rejected for ${selectedExpense.employee?.name}`);
      setShowRejectionModal(false);
      setSelectedExpense(null);
      setNotes('');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reject expense');
    }
  };

  const handleDelete = async (expenseId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete this expense?`)) {
      return;
    }

    try {
      await deleteExpense(expenseId);
      setSuccess('Expense deleted successfully');
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const handleExport = async () => {
    try {
      await exportExpenses({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        status: activeTab !== 'all' ? activeTab : undefined
      });
      setSuccess('Export started! Your download will begin shortly.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export expenses');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
      reimbursed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <DollarSign className="w-3 h-3" /> }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = [
      'bg-purple-100 text-purple-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800'
    ];
    const colorIndex = category ? category.charCodeAt(0) % colors.length : 0;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${colors[colorIndex]}`}>
        {category || 'Other'}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || expense.status === activeTab;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    let matchesDate = true;
    if (dateRange.startDate && dateRange.endDate) {
      const expenseDate = new Date(expense.date);
      matchesDate = expenseDate >= new Date(dateRange.startDate) && 
                   expenseDate <= new Date(dateRange.endDate);
    }

    return matchesSearch && matchesTab && matchesCategory && matchesDate;
  });

  // Calculate statistics
  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    totalAmount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    pendingAmount: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0)
  };

  const tabs = [
    { id: 'all', label: 'All', count: stats.total, icon: <Receipt className="w-4 h-4" /> },
    { id: 'pending', label: 'Pending', count: stats.pending, icon: <Clock className="w-4 h-4" /> },
    { id: 'approved', label: 'Approved', count: stats.approved, icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'rejected', label: 'Rejected', count: stats.rejected, icon: <XCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
                Expense Management
              </h1>
              <p className="text-gray-600 mt-2">Track and manage employee expenses</p>
            </div>

            <div className="flex items-center gap-3">
              {userRole === 'admin' && (
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
              )}
              <button
                onClick={() => navigate('/expenses/submit')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Submit Expense
              </button>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Expenses</h3>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Pending Amount</h3>
            <p className="text-xs text-gray-500 mt-1">{stats.pending} requests</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.approved}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Approved</h3>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.rejected}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Rejected</h3>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
          </div>

          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Start Date"
              />

              {/* End Date */}
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="End Date"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredExpenses.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{expenses.length}</span> expenses
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" text="Loading expenses..." />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Receipt className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No expenses found</p>
              <p className="text-sm mt-1">Submit your first expense to get started</p>
              <button
                onClick={() => navigate('/expenses/submit')}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Submit Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                userRole={userRole}
                onApprove={() => {
                  setSelectedExpense(expense);
                  setShowApprovalModal(true);
                }}
                onReject={() => {
                  setSelectedExpense(expense);
                  setShowRejectionModal(true);
                }}
                onDelete={() => handleDelete(expense._id, expense.employee?.name)}
                onViewDetails={() => {
                  setSelectedExpense(expense);
                  setShowDetailsModal(true);
                }}
                getStatusBadge={getStatusBadge}
                getCategoryBadge={getCategoryBadge}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedExpense && (
        <ApprovalModal
          expense={selectedExpense}
          notes={notes}
          setNotes={setNotes}
          onApprove={handleApprove}
          onClose={() => {
            setShowApprovalModal(false);
            setNotes('');
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedExpense && (
        <RejectionModal
          expense={selectedExpense}
          notes={notes}
          setNotes={setNotes}
          onReject={handleReject}
          onClose={() => {
            setShowRejectionModal(false);
            setNotes('');
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedExpense && (
        <DetailsModal
          expense={selectedExpense}
          onClose={() => setShowDetailsModal(false)}
          getStatusBadge={getStatusBadge}
          getCategoryBadge={getCategoryBadge}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

/**
 * ExpenseCard Component
 */
const ExpenseCard = ({
  expense,
  userRole,
  onApprove,
  onReject,
  onDelete,
  onViewDetails,
  getStatusBadge,
  getCategoryBadge,
  formatCurrency,
  formatDate
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-500 relative">
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center">
            <Receipt className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <div className="absolute top-3 right-3">
          {getStatusBadge(expense.status)}
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 px-6 pb-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
            {expense.description}
          </h3>
          <div className="flex items-center gap-2">
            {getCategoryBadge(expense.category)}
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">Amount</p>
          <p className="text-3xl font-bold text-emerald-600">{formatCurrency(expense.amount)}</p>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm">
          {userRole === 'admin' && expense.employee && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>{expense.employee.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(expense.date)}</span>
          </div>
          {expense.receiptUrl && (
            <div className="flex items-center gap-2 text-emerald-600">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Receipt attached</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {userRole === 'admin' && expense.status === 'pending' && (
            <>
              <button
                onClick={onApprove}
                className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={onReject}
                className="flex-1 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all text-sm flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
          {expense.status !== 'pending' && (
            <button
              onClick={onViewDetails}
              className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          )}
          {(userRole === 'employee' && expense.status === 'pending') && (
            <button
              onClick={onDelete}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ApprovalModal Component
 */
const ApprovalModal = ({ expense, notes, setNotes, onApprove, onClose, formatCurrency, formatDate }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Approve Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Approve expense submitted by <span className="font-semibold">{expense.employee?.name}</span>?
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-semibold">{expense.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{formatDate(expense.date)}</span>
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
            placeholder="Add any notes..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * RejectionModal Component
 */
const RejectionModal = ({ expense, notes, setNotes, onReject, onClose, formatCurrency, formatDate }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Reject Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Reject expense submitted by <span className="font-semibold">{expense.employee?.name}</span>?
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-semibold">{expense.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{formatDate(expense.date)}</span>
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
            placeholder="Provide a reason for rejection..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onReject}
            disabled={!notes.trim()}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * DetailsModal Component
 */
const DetailsModal = ({ expense, onClose, getStatusBadge, getCategoryBadge, formatCurrency, formatDate }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Expense Details</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Category */}
          <div className="flex items-center gap-3">
            {getStatusBadge(expense.status)}
            {getCategoryBadge(expense.category)}
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
            <p className="text-sm text-gray-600 mb-2">Amount</p>
            <p className="text-4xl font-bold text-emerald-600">{formatCurrency(expense.amount)}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-semibold text-gray-900">{formatDate(expense.date)}</p>
            </div>
            {expense.employee && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Employee</p>
                <p className="font-semibold text-gray-900">{expense.employee.name}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900">{expense.description}</p>
            </div>
          </div>

          {/* Receipt */}
          {expense.receiptUrl && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Receipt</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <FileText className="w-5 h-5" />
                  View Receipt
                </a>
              </div>
            </div>
          )}

          {/* Review Notes */}
          {expense.reviewNotes && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Review Notes</p>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-gray-900">{expense.reviewNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;