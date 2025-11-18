import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Target,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Star,
  TrendingDown
} from 'lucide-react';
import { getPerformanceReviews, deletePerformanceReview, getGoals } from '../../api/performance';
import { getEmployees } from '../../api/employees';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import Tabs from '../../components/common/Tabs';
import { useNavigate } from 'react-router-dom';

/**
 * PerformanceList Page
 * Manage performance reviews and employee goals
 */
const PerformanceList = () => {
  const navigate = useNavigate();

  // State
  const [reviews, setReviews] = useState([]);
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [activeTab, setActiveTab] = useState('reviews');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, goalsRes, employeesRes] = await Promise.all([
        getPerformanceReviews(),
        getGoals(),
        getEmployees()
      ]);
      setReviews(reviewsRes.data || []);
      setGoals(goalsRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete the review for ${employeeName}?`)) {
      return;
    }

    try {
      await deletePerformanceReview(reviewId);
      setSuccess('Review deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <Clock className="w-3 h-3" /> },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-3 h-3" /> }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-semibold text-gray-700">{rating}/5</span>
      </div>
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesYear = review.reviewPeriod?.startDate 
      ? new Date(review.reviewPeriod.startDate).getFullYear().toString() === yearFilter
      : true;
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalReviews: reviews.length,
    pendingReviews: reviews.filter(r => r.status === 'pending' || r.status === 'draft').length,
    completedReviews: reviews.filter(r => r.status === 'completed').length,
    activeGoals: goals.filter(g => g.status === 'in-progress').length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / reviews.length).toFixed(1)
      : 0
  };

  const tabs = [
    { id: 'reviews', label: 'Performance Reviews', icon: <Award className="w-4 h-4" />, count: reviews.length },
    { id: 'goals', label: 'Goals & OKRs', icon: <Target className="w-4 h-4" />, count: goals.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                Performance Management
              </h1>
              <p className="text-gray-600 mt-2">Track employee performance, reviews, and goals</p>
            </div>

            <button
              onClick={() => navigate('/performance/create-review')}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Review
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
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalReviews}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Total Reviews</h3>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Pending</h3>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.completedReviews}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.activeGoals}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Active Goals</h3>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.avgRating}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Avg Rating</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />
          </div>

          {/* Filters */}
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'reviews' ? 'reviews' : 'goals'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  {activeTab === 'reviews' ? (
                    <>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </>
                  ) : (
                    <>
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </>
                  )}
                </select>
              </div>

              {activeTab === 'reviews' && (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                  >
                    {[2024, 2023, 2022, 2021].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" text="Loading performance data..." />
          </div>
        ) : activeTab === 'reviews' ? (
          <ReviewsList
            reviews={filteredReviews}
            onDelete={handleDeleteReview}
            getStatusBadge={getStatusBadge}
            getRatingStars={getRatingStars}
            formatDate={formatDate}
            navigate={navigate}
          />
        ) : (
          <GoalsList
            goals={filteredGoals}
            getStatusBadge={getStatusBadge}
            getProgressColor={getProgressColor}
            formatDate={formatDate}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

/**
 * ReviewsList Component
 * Display list of performance reviews
 */
const ReviewsList = ({ reviews, onDelete, getStatusBadge, getRatingStars, formatDate, navigate }) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Award className="w-20 h-20 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No performance reviews found</p>
          <p className="text-sm mt-1">Create your first performance review to get started</p>
          <button
            onClick={() => navigate('/performance/create-review')}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Header */}
          <div className="h-20 bg-gradient-to-r from-orange-500 to-red-500 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 bg-white rounded-xl shadow-lg border-4 border-white flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                  {review.employee?.name?.charAt(0) || 'N'}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-14 px-6 pb-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{review.employee?.name || 'Unknown'}</h3>
              <p className="text-sm text-gray-600">{review.employee?.designation || 'N/A'}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(review.status)}
              </div>
              
              {review.overallRating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  {getRatingStars(review.overallRating)}
                </div>
              )}

              {review.reviewPeriod && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Review Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(review.reviewPeriod.startDate)} - {formatDate(review.reviewPeriod.endDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/performance/review/${review._id}`)}
                className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => navigate(`/performance/review/${review._id}/edit`)}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(review._id, review.employee?.name)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * GoalsList Component
 * Display list of employee goals
 */
const GoalsList = ({ goals, getStatusBadge, getProgressColor, formatDate, navigate }) => {
  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Target className="w-20 h-20 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No goals found</p>
          <p className="text-sm mt-1">Create goals to track employee objectives</p>
          <button
            onClick={() => navigate('/performance/create-goal')}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div key={goal._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center text-orange-600">
                <Target className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{goal.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{goal.employee?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(goal.targetDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            {getStatusBadge(goal.status)}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{goal.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressColor(goal.progress || 0)}`}
                style={{ width: `${goal.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Key Results */}
          {goal.keyResults && goal.keyResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Key Results</p>
              <div className="space-y-2">
                {goal.keyResults.map((kr, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{kr.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PerformanceList;