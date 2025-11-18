import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Briefcase,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Crown,
  Award
} from 'lucide-react';

/**
 * EmployeeCard Component
 * Display employee information in a card format
 * 
 * @param {Object} props
 * @param {Object} props.employee - Employee data object
 * @param {Function} props.onView - View employee handler
 * @param {Function} props.onEdit - Edit employee handler
 * @param {Function} props.onDelete - Delete employee handler
 * @param {Function} props.onStatusChange - Status change handler
 * @param {boolean} props.isAdmin - Admin permissions flag
 * @param {string} props.variant - Card variant: 'default' | 'compact' | 'detailed'
 */
const EmployeeCard = ({
  employee,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isAdmin = false,
  variant = 'default'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(employee._id);
      } catch (error) {
        console.error('Error deleting employee:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    if (onStatusChange) {
      await onStatusChange(employee._id, newStatus);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <UserCheck className="w-3 h-3" />
      },
      inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <UserX className="w-3 h-3" />
      },
      suspended: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <UserX className="w-3 h-3" />
      }
    };

    const badge = badges[status] || badges.active;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3" />
          <span>Admin</span>
        </span>
      );
    }
    return null;
  };

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
      month: 'short',
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

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt={employee.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(employee.name)}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
            <p className="text-sm text-gray-600 truncate">{employee.designation}</p>
          </div>

          {/* Action */}
          <button
            onClick={() => onView(employee)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 overflow-hidden
      hover:shadow-lg transition-all duration-300
      ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
    `}>
      {/* Card Header with Menu */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {isAdmin && (
          <div className="absolute top-3 right-3">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        onView(employee);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        onEdit(employee);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleStatusToggle();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      {employee.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6">
          {employee.profilePhoto ? (
            <img
              src={employee.profilePhoto}
              alt={employee.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
              {getInitials(employee.name)}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="pt-16 px-6 pb-6">
        {/* Name and Badges */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{employee.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(employee.status)}
            {getRoleBadge(employee.role)}
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-xs">Designation</p>
              <p className="text-gray-900 font-semibold truncate">{employee.designation}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-xs">Email</p>
              <p className="text-gray-900 font-medium truncate">{employee.email}</p>
            </div>
          </div>

          {employee.phone && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs">Phone</p>
                <p className="text-gray-900 font-medium truncate">{employee.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-xs">Join Date</p>
              <p className="text-gray-900 font-semibold">{formatDate(employee.joinDate)}</p>
            </div>
          </div>

          {variant === 'detailed' && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs">Salary</p>
                <p className="text-gray-900 font-bold">{formatSalary(employee.salary)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => onView(employee)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View Profile
          </button>
          {isAdmin && (
            <button
              onClick={() => onEdit(employee)}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * EmployeeCardSkeleton Component
 * Loading skeleton for employee card
 */
export const EmployeeCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-24 bg-gray-200" />
    <div className="pt-16 px-6 pb-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

export default EmployeeCard;