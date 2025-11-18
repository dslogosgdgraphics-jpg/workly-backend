import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Settings,
  Trash2,
  Filter,
  Loader2
} from 'lucide-react';
import NotificationItem from './NotificationItem';

/**
 * NotificationBell Component
 * Bell icon with dropdown showing notifications
 * 
 * @param {Object} props
 * @param {Array} props.notifications - Array of notification objects
 * @param {number} props.unreadCount - Number of unread notifications
 * @param {Function} props.onNotificationClick - Click handler for individual notification
 * @param {Function} props.onMarkAsRead - Mark notification as read handler
 * @param {Function} props.onMarkAllAsRead - Mark all as read handler
 * @param {Function} props.onDelete - Delete notification handler
 * @param {Function} props.onViewAll - View all notifications handler
 * @param {Function} props.onSettingsClick - Notification settings handler
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.position - Dropdown position: 'left' | 'right'
 */
const NotificationBell = ({
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewAll,
  onSettingsClick,
  isLoading = false,
  position = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  // Get display notifications (limit to recent 10)
  const displayNotifications = filteredNotifications.slice(0, 10);

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleDelete = (notificationId, e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notificationId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Ping Animation for new notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50
          ${position === 'left' ? 'right-0' : 'left-0'}
        `}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">
                    You have <span className="font-semibold text-indigo-600">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="capitalize">{filter}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {filteredNotifications.length}
                  </span>
                </button>

                {/* Filter Dropdown */}
                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setFilter('all');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        filter === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      All Notifications ({notifications.length})
                    </button>
                    <button
                      onClick={() => {
                        setFilter('unread');
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        filter === 'unread' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      Unread Only ({unreadCount})
                    </button>
                  </div>
                )}
              </div>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-5 h-5" />
                </button>
              )}

              {/* Settings */}
              {onSettingsClick && (
                <button
                  onClick={() => {
                    onSettingsClick();
                    setIsOpen(false);
                  }}
                  className="p-1.5 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  title="Notification settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">No notifications</p>
                <p className="text-sm text-gray-500 text-center">
                  {filter === 'unread' 
                    ? "You're all caught up!" 
                    : "You'll see notifications here when you get them"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={(e) => handleDelete(notification.id, e)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  if (onViewAll) onViewAll();
                  setIsOpen(false);
                }}
                className="w-full py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * NotificationBadge Component
 * Simple badge counter for notifications
 */
export const NotificationBadge = ({ count = 0, max = 99, className = '' }) => {
  if (count === 0) return null;

  return (
    <span className={`
      inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
      bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full
      ${className}
    `}>
      {count > max ? `${max}+` : count}
    </span>
  );
};

/**
 * NotificationDot Component
 * Simple dot indicator for unread notifications
 */
export const NotificationDot = ({ show = false, pulse = true, className = '' }) => {
  if (!show) return null;

  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      {pulse && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      )}
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  );
};

export default NotificationBell;