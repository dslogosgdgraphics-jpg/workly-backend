import React, { useState, useEffect } from 'react';
import {
  Award,
  Save,
  X,
  ArrowLeft,
  Loader2,
  Star,
  Plus,
  Trash2,
  AlertCircle,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { createPerformanceReview, updatePerformanceReview, getPerformanceReview } from '../../api/performance';
import { getEmployees } from '../../api/employees';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * ReviewForm Page
 * Create or edit performance review
 */
const ReviewForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employees, setEmployees] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    employee: '',
    reviewPeriod: {
      startDate: '',
      endDate: ''
    },
    reviewType: 'annual',
    ratings: {
      workQuality: 0,
      productivity: 0,
      communication: 0,
      teamwork: 0,
      leadership: 0
    },
    strengths: '',
    areasForImprovement: '',
    goals: [],
    overallRating: 0,
    reviewerComments: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchEmployees();
    if (isEdit) {
      fetchReview();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchReview = async () => {
    setLoading(true);
    try {
      const response = await getPerformanceReview(id);
      const review = response.data;
      setFormData({
        employee: review.employee?._id || '',
        reviewPeriod: review.reviewPeriod || { startDate: '', endDate: '' },
        reviewType: review.reviewType || 'annual',
        ratings: review.ratings || {
          workQuality: 0,
          productivity: 0,
          communication: 0,
          teamwork: 0,
          leadership: 0
        },
        strengths: review.strengths || '',
        areasForImprovement: review.areasForImprovement || '',
        goals: review.goals || [],
        overallRating: review.overallRating || 0,
        reviewerComments: review.reviewerComments || '',
        status: review.status || 'draft'
      });
    } catch (err) {
      setError('Failed to fetch review details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePeriodChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      reviewPeriod: {
        ...prev.reviewPeriod,
        [name]: value
      }
    }));
  };

  const handleRatingChange = (category, rating) => {
    setFormData(prev => {
      const newRatings = {
        ...prev.ratings,
        [category]: rating
      };
      
      // Calculate overall rating
      const ratings = Object.values(newRatings);
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      
      return {
        ...prev,
        ratings: newRatings,
        overallRating: Math.round(avgRating * 10) / 10
      };
    });
  };

  const handleAddGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, { description: '', targetDate: '', status: 'not-started' }]
    }));
  };

  const handleGoalChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => 
        i === index ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const handleRemoveGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee) {
      setError('Please select an employee');
      return;
    }

    if (!formData.reviewPeriod.startDate || !formData.reviewPeriod.endDate) {
      setError('Please select review period dates');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (isEdit) {
        await updatePerformanceReview(id, formData);
        setSuccess('Review updated successfully!');
      } else {
        await createPerformanceReview(formData);
        setSuccess('Review created successfully!');
      }

      setTimeout(() => {
        navigate('/performance');
      }, 2000);
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} review`);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingCategories = [
    { key: 'workQuality', label: 'Work Quality', description: 'Quality and accuracy of work delivered' },
    { key: 'productivity', label: 'Productivity', description: 'Efficiency and output of work' },
    { key: 'communication', label: 'Communication', description: 'Clarity and effectiveness in communication' },
    { key: 'teamwork', label: 'Teamwork', description: 'Collaboration and cooperation with team' },
    { key: 'leadership', label: 'Leadership', description: 'Leadership and initiative shown' }
  ];

  const reviewTypes = [
    { value: 'annual', label: 'Annual Review' },
    { value: 'quarterly', label: 'Quarterly Review' },
    { value: 'probation', label: 'Probation Review' },
    { value: 'project', label: 'Project Review' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" text="Loading review..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/performance')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Performance
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            {isEdit ? 'Edit Performance Review' : 'Create Performance Review'}
          </h1>
          <p className="text-gray-600 mt-2">Evaluate employee performance and set goals</p>
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

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isEdit}
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="reviewType"
                  value={formData.reviewType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {reviewTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.reviewPeriod.startDate}
                    onChange={handlePeriodChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.reviewPeriod.endDate}
                    onChange={handlePeriodChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Ratings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-600" />
              Performance Ratings
            </h2>

            <div className="space-y-6">
              {ratingCategories.map(category => (
                <div key={category.key}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{category.label}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingChange(category.key, rating)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= formData.ratings[category.key]
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-lg font-bold text-gray-900 min-w-[30px]">
                        {formData.ratings[category.key]}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Overall Rating */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">Overall Rating</p>
                    <p className="text-sm text-gray-600">Average of all categories</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-orange-600">{formData.overallRating}</p>
                    <p className="text-sm text-gray-600">out of 5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Feedback & Comments
            </h2>

            <div className="space-y-6">
              {/* Strengths */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Strengths
                </label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="What are the employee's key strengths?"
                />
              </div>

              {/* Areas for Improvement */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  name="areasForImprovement"
                  value={formData.areasForImprovement}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="What areas need improvement?"
                />
              </div>

              {/* Reviewer Comments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Overall Comments
                </label>
                <textarea
                  name="reviewerComments"
                  value={formData.reviewerComments}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Additional comments and observations..."
                />
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Goals for Next Period
              </h2>
              <button
                type="button"
                onClick={handleAddGoal}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            </div>

            {formData.goals.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">No goals added yet. Click "Add Goal" to create one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={goal.description}
                          onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                          placeholder="Goal description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={goal.targetDate}
                            onChange={(e) => handleGoalChange(index, 'targetDate', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <select
                            value={goal.status}
                            onChange={(e) => handleGoalChange(index, 'status', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Status */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review Status</h2>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending (Awaiting employee feedback)</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/performance')}
              disabled={submitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Update Review' : 'Create Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;