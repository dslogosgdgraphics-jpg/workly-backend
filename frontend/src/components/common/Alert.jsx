import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

/**
 * Alert Component
 * Customizable alert/notification component
 * 
 * @param {Object} props
 * @param {string} props.type - Alert type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} props.title - Alert title
 * @param {string} props.message - Alert message
 * @param {boolean} props.dismissible - Show close button
 * @param {Function} props.onClose - Close handler
 * @param {string} props.variant - Style variant: 'solid' | 'outlined' | 'soft'
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.autoClose - Auto close after milliseconds (0 = no auto close)
 * @param {React.ReactNode} props.action - Custom action button/element
 */
const Alert = ({
  type = 'info',
  title = '',
  message = '',
  dismissible = true,
  onClose = null,
  variant = 'soft',
  className = '',
  autoClose = 0,
  action = null,
  icon = null
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto close functionality
  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for fade out animation
    }
  };

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      colors: {
        solid: 'bg-green-600 text-white border-green-600',
        outlined: 'bg-white text-green-800 border-green-300',
        soft: 'bg-green-50 text-green-800 border-green-200'
      },
      iconColor: 'text-green-600'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      colors: {
        solid: 'bg-red-600 text-white border-red-600',
        outlined: 'bg-white text-red-800 border-red-300',
        soft: 'bg-red-50 text-red-800 border-red-200'
      },
      iconColor: 'text-red-600'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      colors: {
        solid: 'bg-yellow-600 text-white border-yellow-600',
        outlined: 'bg-white text-yellow-800 border-yellow-300',
        soft: 'bg-yellow-50 text-yellow-800 border-yellow-200'
      },
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      colors: {
        solid: 'bg-blue-600 text-white border-blue-600',
        outlined: 'bg-white text-blue-800 border-blue-300',
        soft: 'bg-blue-50 text-blue-800 border-blue-200'
      },
      iconColor: 'text-blue-600'
    }
  };

  const currentConfig = config[type];
  const colorClass = currentConfig.colors[variant];

  if (!isVisible) return null;

  return (
    <div
      className={`
        rounded-lg border p-4 flex items-start gap-3
        transition-all duration-300 animate-fadeIn
        ${colorClass}
        ${className}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${variant === 'solid' ? 'text-white' : currentConfig.iconColor}`}>
        {icon || currentConfig.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-sm font-bold mb-1">
            {title}
          </h3>
        )}
        {message && (
          <p className="text-sm opacity-90">
            {message}
          </p>
        )}
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>

      {/* Close Button */}
      {dismissible && (
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 p-1 rounded-lg transition-colors
            ${variant === 'solid' 
              ? 'hover:bg-white/20 text-white' 
              : 'hover:bg-gray-200 opacity-60 hover:opacity-100'
            }
          `}
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * Toast Component
 * Floating toast notification
 */
export const Toast = ({ 
  type = 'info', 
  message = '', 
  position = 'top-right',
  duration = 5000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${positions[position]} z-50 animate-slideIn`}>
      <Alert
        type={type}
        message={message}
        variant="soft"
        dismissible={true}
        onClose={() => {
          setIsVisible(false);
          if (onClose) setTimeout(onClose, 300);
        }}
        className="shadow-lg min-w-[300px]"
      />
    </div>
  );
};

/**
 * Banner Component
 * Full-width banner alert
 */
export const Banner = ({ 
  type = 'info', 
  message = '', 
  dismissible = true,
  onClose,
  className = ''
}) => {
  return (
    <Alert
      type={type}
      message={message}
      variant="soft"
      dismissible={dismissible}
      onClose={onClose}
      className={`rounded-none border-x-0 ${className}`}
    />
  );
};

/**
 * InlineAlert Component
 * Compact inline alert
 */
export const InlineAlert = ({ 
  type = 'info', 
  message = '',
  className = ''
}) => {
  const config = {
    success: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' },
    error: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600' },
    warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-600' },
    info: { icon: <Info className="w-4 h-4" />, color: 'text-blue-600' }
  };

  const { icon, color } = config[type];

  return (
    <div className={`inline-flex items-center gap-2 text-sm ${color} ${className}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

/**
 * AlertList Component
 * Stack multiple alerts
 */
export const AlertList = ({ alerts = [], onDismiss }) => {
  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Alert
          key={alert.id || index}
          {...alert}
          onClose={() => onDismiss && onDismiss(alert.id || index)}
        />
      ))}
    </div>
  );
};

export default Alert;