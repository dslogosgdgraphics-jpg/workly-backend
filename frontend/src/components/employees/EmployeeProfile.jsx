import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Award,
  FileText,
  Activity,
  TrendingUp,
  Edit,
  X,
  CheckCircle,
  UserCheck,
  UserX,
  Crown,
  Building
} from 'lucide-react';

/**
 * EmployeeProfile Component
 * Detailed employee profile view
 * 
 * @param {Object} props
 * @param {Object} props.employee - Employee data
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.isAdmin - Admin flag
 * @param {Object} props.stats - Employee statistics (attendance, leaves, etc.)
 */
const EmployeeProfile = ({
  employee,
  onEdit,
  onClose,
  isAdmin = false,
  stats = null
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!employee) return null;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(salary);
  };

  const calculateTenure = (joinDate) => {
    const start = new Date(joinDate);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <UserCheck className="w-4 h-4" />
      },
      inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <UserX className="w-4 h-4" />
      },
      suspended: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <UserX className="w-4 h-4" />
      }
    };

    const badge = badges[status] || badges.active;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt={employee.name}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-xl">
                {getInitials(employee.name)}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="absolute -bottom-12 right-8">
              <button
                onClick={() => onEdit(employee)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pt-20 px-8 pb-8">
          {/* Name and Title */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{employee.name}</h1>
                <p className="text-lg text-gray-600 font-medium">{employee.designation}</p>
              </div>
              {employee.role === 'admin' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                  <Crown className="w-4 h-4" />
                  Admin
                </span>
              )}
            </div>
            {getStatusBadge(employee.status)}
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate || '0'}%</p>
                    <p className="text-xs text-gray-600">Attendance</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.leavesUsed || '0'}</p>
                    <p className="text-xs text-gray-600">Leaves Used</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.performance || 'N/A'}</p>
                    <p className="text-xs text-gray-600">Performance</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.hoursWorked || '0'}</p>
                    <p className="text-xs text-gray-600">Hours This Month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-3 font-semibold transition-all rounded-t-lg border-b-2
                    ${activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{employee.email}</p>
                      </div>
                    </div>

                    {employee.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Phone</p>
                          <p className="text-sm font-semibold text-gray-900">{employee.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Designation</p>
                        <p className="text-sm font-semibold text-gray-900">{employee.designation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Join Date</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(employee.joinDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Salary</p>
                        <p className="text-sm font-semibold text-gray-900">{formatSalary(employee.salary)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Tenure</p>
                        <p className="text-sm font-semibold text-gray-900">{calculateTenure(employee.joinDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-600 text-center py-8">
                  Activity timeline coming soon...
                </p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-600 text-center py-8">
                  Document management coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;