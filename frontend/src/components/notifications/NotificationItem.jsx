import React, { useState } from 'react';
import { 
  Check,
  X,
  Circle,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  User,
  FileText,
  Calendar,
  DollarSign,
  Briefcase,
  MessageSquare,
  Gift,
  TrendingUp,
  Clock,
  Trash2,
  ExternalLink
} from 'lucide-react';

/**
 * NotificationItem Component
 * Individual notification item with different types and actions
 * 
 * @param {Object} props
 * @param {Object} props.notification - Notification object
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onMarkAsRead - Mark as read handler
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.showActions - Show action buttons
 * @param {boolean} props.compact - Compact view
 */
const NotificationItem = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get icon based on notification type
  const getIcon = (type, category) => {
    const iconMap = {
      // By category
      employee: <User className="w-5 h-5" />,
      attendance: <Clock className="w-5 h-5" />,
      leave: <Calendar className="w-5 h-5" />,
      payroll: <DollarSign className="w-5 h-5" />,
      document: <FileText className="w-5 h-5" />,
      performance: <TrendingUp className="w-5 h-5" />,
      announcement: <Bell className="w-5 h-5" />,
      message: <MessageSquare className="w-5 h-5" />,
      task: <Briefcase className="w-5 h-5" />,
      reward: <Gift className="w-5 h-5" />,
      
      // By type
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
    };

    return iconMap[category] || iconMap[type] || <Bell className="w-5 h-5" />;
  };

  // Get color scheme based on type
  const getColorScheme = (type) => {
    const schemes = {
      success: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-50'
      },
      error: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
        hover: 'hover:bg-red-50'
      },
      warning: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-50'
      },
      info: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-50'
      },
      default: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        hover: 'hover:bg-indigo-50'
      }
    };

    return schemes[type] || schemes.default;
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor((now - notificationDate) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return notificationDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const colorScheme = getColorScheme(notification.type);
  const icon = getIcon(notification.type, notification.category);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative p-4 cursor-pointer transition-all duration-200
        ${!notification.read ? 'bg-indigo-50/50' : 'bg-white hover:bg-gray-50'}
        ${compact ? 'py-3' : ''}
      `}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-600 to-purple-600" />
      )}

      <div className="flex items-start gap-3 pl-2">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
          ${colorScheme.bg} ${colorScheme.text}
        `}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <Circle className="w-2 h-2 text-indigo-600 fill-current flex-shrink-0 mt-1.5" />
            )}
          </div>

          {/* Message */}
          <p className={`text-sm text-gray-600 mb-2 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(notification.createdAt)}
              </span>
              {notification.category && (
                <>
                  <span>•</span>
                  <span className="capitalize">{notification.category}</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {showActions && isHovered && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {/* Mark as Read/Unread */}
                {onMarkAsRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title={notification.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {notification.read ? (
                      <Circle className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Delete */}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(e);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          {notification.actionLabel && notification.actionUrl && (
            <a
              href={notification.actionUrl}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {notification.actionLabel}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * NotificationGroup Component
 * Group of notifications with a header
 */
export const NotificationGroup = ({ title, notifications, ...props }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            {...props}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * CompactNotificationItem Component
 * Minimal notification item for sidebars
 */
export const CompactNotificationItem = ({ notification, onClick }) => {
  const colorScheme = {
    success: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
    default: 'bg-indigo-100 text-indigo-600'
  };

  const colors = colorScheme[notification.type] || colorScheme.default;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 cursor-pointer transition-colors
        ${!notification.read ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}
      `}
    >
      <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-indigo-600' : 'bg-gray-300'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {notification.message}
        </p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {new Date(notification.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}
      </span>
    </div>
  );
};

export default NotificationItem;