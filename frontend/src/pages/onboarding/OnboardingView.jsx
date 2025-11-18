import React, { useState, useEffect } from 'react';
import {
  Clipboard,
  CheckCircle,
  Circle,
  Clock,
  User,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Target,
  TrendingUp,
  FileText,
  Award,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import {
  getOnboardingWorkflows,
  getMyOnboarding,
  completeTask,
  createOnboardingWorkflow,
  deleteOnboardingWorkflow,
  getOnboardingTemplates
} from '../../api/onboarding';
import { getEmployees } from '../../api/employees';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import Tabs from '../../components/common/Tabs';
import { useNavigate } from 'react-router-dom';

/**
 * OnboardingView Page
 * Manage employee onboarding workflows and tasks
 */
const OnboardingView = () => {
  const navigate = useNavigate();

  // State
  const [workflows, setWorkflows] = useState([]);
  const [myOnboarding, setMyOnboarding] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User role (this should come from auth context)
  const [userRole] = useState('admin'); // 'admin' or 'employee'

  // Filter state
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkflow, setExpandedWorkflow] = useState(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (userRole === 'admin') {
        const [workflowsRes, templatesRes, employeesRes] = await Promise.all([
          getOnboardingWorkflows(),
          getOnboardingTemplates(),
          getEmployees()
        ]);
        setWorkflows(workflowsRes.data || []);
        setTemplates(templatesRes.data || []);
        setEmployees(employeesRes.data || []);
      } else {
        const response = await getMyOnboarding();
        setMyOnboarding(response.data);
      }
    } catch (err) {
      console.error('Error fetching onboarding data:', err);
      setError('Failed to fetch onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (workflowId, taskId) => {
    try {
      await completeTask(workflowId, taskId);
      setSuccess('Task completed!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to complete task');
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedTemplate) {
      setError('Please select both employee and template');
      return;
    }

    try {
      await createOnboardingWorkflow({
        employee: selectedEmployee,
        template: selectedTemplate,
        startDate
      });
      setSuccess('Onboarding workflow created successfully!');
      setShowCreateModal(false);
      setSelectedEmployee('');
      setSelectedTemplate('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create workflow');
    }
  };

  const handleDeleteWorkflow = async (workflowId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete onboarding for ${employeeName}?`)) {
      return;
    }

    try {
      await deleteOnboardingWorkflow(workflowId);
      setSuccess('Workflow deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete workflow');
    }
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'not-started': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Started' },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'overdue': { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' }
    };
    const badge = badges[status] || badges['not-started'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
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

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || workflow.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Calculate statistics
  const stats = {
    total: workflows.length,
    notStarted: workflows.filter(w => w.status === 'not-started').length,
    inProgress: workflows.filter(w => w.status === 'in-progress').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    avgProgress: workflows.length > 0
      ? Math.round(workflows.reduce((sum, w) => sum + calculateProgress(w.tasks), 0) / workflows.length)
      : 0
  };

  const tabs = [
    { id: 'all', label: 'All', count: stats.total, icon: <Clipboard className="w-4 h-4" /> },
    { id: 'in-progress', label: 'In Progress', count: stats.inProgress, icon: <Clock className="w-4 h-4" /> },
    { id: 'completed', label: 'Completed', count: stats.completed, icon: <CheckCircle className="w-4 h-4" /> }
  ];

  // Employee View
  if (userRole === 'employee') {
    return <EmployeeOnboardingView 
      onboarding={myOnboarding} 
      onCompleteTask={handleCompleteTask}
      loading={loading}
      error={error}
      success={success}
      setError={setError}
      setSuccess={setSuccess}
    />;
  }

  // Admin View
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Clipboard className="w-7 h-7 text-white" />
                </div>
                Employee Onboarding
              </h1>
              <p className="text-gray-600 mt-2">Manage new employee onboarding workflows</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Start Onboarding
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Onboarding</h3>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Circle className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.notStarted}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Not Started</h3>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.inProgress}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">In Progress</h3>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.avgProgress}%</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Avg Progress</h3>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
          </div>

          <div className="p-6 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Workflows List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" text="Loading onboarding workflows..." />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Clipboard className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No onboarding workflows found</p>
              <p className="text-sm mt-1">Start onboarding for new employees</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Start Onboarding
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <OnboardingWorkflowCard
                key={workflow._id}
                workflow={workflow}
                expanded={expandedWorkflow === workflow._id}
                onToggle={() => setExpandedWorkflow(expandedWorkflow === workflow._id ? null : workflow._id)}
                onCompleteTask={handleCompleteTask}
                onDelete={handleDeleteWorkflow}
                calculateProgress={calculateProgress}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                getDaysRemaining={getDaysRemaining}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Start Onboarding</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Select template</option>
                  {templates.map(template => (
                    <option key={template._id} value={template._id}>
                      {template.name} ({template.tasks?.length || 0} tasks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * OnboardingWorkflowCard Component
 * Display individual onboarding workflow
 */
const OnboardingWorkflowCard = ({
  workflow,
  expanded,
  onToggle,
  onCompleteTask,
  onDelete,
  calculateProgress,
  getStatusBadge,
  formatDate,
  getDaysRemaining
}) => {
  const progress = calculateProgress(workflow.tasks);
  const daysRemaining = workflow.endDate ? getDaysRemaining(workflow.endDate) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {workflow.employee?.name?.charAt(0) || 'N'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{workflow.employee?.name || 'Unknown'}</h3>
              <p className="text-sm text-gray-600">{workflow.employee?.designation || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {getStatusBadge(workflow.status)}
            <button
              onClick={onToggle}
              className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-cyan-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Info Row */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Start Date</p>
            <p className="font-semibold text-gray-900">{formatDate(workflow.startDate)}</p>
          </div>
          {workflow.endDate && (
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">End Date</p>
              <p className="font-semibold text-gray-900">{formatDate(workflow.endDate)}</p>
            </div>
          )}
          {daysRemaining !== null && (
            <div className={`rounded-lg p-3 ${
              daysRemaining < 0 ? 'bg-red-50' : daysRemaining < 7 ? 'bg-yellow-50' : 'bg-white'
            }`}>
              <p className="text-xs text-gray-600 mb-1">Days Remaining</p>
              <p className={`font-semibold ${
                daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-gray-900'
              }`}>
                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} overdue` : daysRemaining}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task List (Expanded) */}
      {expanded && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Tasks ({workflow.tasks?.filter(t => t.completed).length || 0}/{workflow.tasks?.length || 0})
            </h4>
            <button
              onClick={() => onDelete(workflow._id, workflow.employee?.name)}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Workflow
            </button>
          </div>

          {workflow.tasks && workflow.tasks.length > 0 ? (
            <div className="space-y-2">
              {workflow.tasks.map((task, index) => (
                <div
                  key={task._id || index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    task.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-cyan-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => !task.completed && onCompleteTask(workflow._id, task._id)}
                      disabled={task.completed}
                      className={`mt-0.5 flex-shrink-0 ${task.completed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {task.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-cyan-600 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h5 className={`font-semibold ${task.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h5>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.assignedTo}</span>
                          </div>
                        )}
                        {task.completedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Completed: {formatDate(task.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No tasks in this workflow</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * EmployeeOnboardingView Component
 * Employee's personal onboarding view
 */
const EmployeeOnboardingView = ({ onboarding, onCompleteTask, loading, error, success, setError, setSuccess }) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" text="Loading your onboarding..." />
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Clipboard className="w-20 h-20 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No onboarding workflow assigned</p>
              <p className="text-sm mt-1">Contact your manager to get started</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = onboarding.tasks ? Math.round((onboarding.tasks.filter(t => t.completed).length / onboarding.tasks.length) * 100) : 0;
  const completedTasks = onboarding.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = onboarding.tasks?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            Welcome to EmplyStack! 🎉
          </h1>
          <p className="text-gray-600 mt-2">Complete your onboarding checklist to get started</p>
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

        {/* Progress Card */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
              <p className="text-cyan-100">{completedTasks} of {totalTasks} tasks completed</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-2">{progress}%</div>
              {progress === 100 && (
                <div className="flex items-center gap-2 text-cyan-100">
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete!</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-600" />
              Your Onboarding Checklist
            </h3>
          </div>

          <div className="p-6">
            {onboarding.tasks && onboarding.tasks.length > 0 ? (
              <div className="space-y-3">
                {onboarding.tasks.map((task, index) => (
                  <div
                    key={task._id || index}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-cyan-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => !task.completed && onCompleteTask(onboarding._id, task._id)}
                        disabled={task.completed}
                        className={`mt-1 flex-shrink-0 ${task.completed ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {task.completed ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 border-2 border-gray-300 rounded-full hover:border-cyan-500 transition-colors" />
                        )}
                      </button>

                      <div className="flex-1">
                        <h4 className={`text-lg font-semibold mb-1 ${
                          task.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {task.dueDate && (
                            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.completedAt && (
                            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>No tasks assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Completion Message */}
        {progress === 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h3>
            <p className="text-gray-700 mb-4">
              You've completed your onboarding. Welcome to the team!
            </p>
            <p className="text-sm text-gray-600">
              If you have any questions, don't hesitate to reach out to your manager.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingView;