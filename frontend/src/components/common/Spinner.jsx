import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Spinner Component
 * Loading spinner with multiple sizes and variants
 * 
 * @param {Object} props
 * @param {string} props.size - Size variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.variant - Style variant: 'primary' | 'white' | 'gray' | 'success' | 'danger'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullScreen - Display as full screen overlay
 * @param {string} props.text - Loading text to display
 */
const Spinner = ({ 
  size = 'md', 
  variant = 'primary', 
  className = '', 
  fullScreen = false,
  text = '' 
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variants = {
    primary: 'text-indigo-600',
    white: 'text-white',
    gray: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const spinnerClass = `${sizes[size]} ${variants[variant]} ${className}`;

  const SpinnerIcon = () => (
    <Loader2 className={`${spinnerClass} animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
          <SpinnerIcon />
          {text && (
            <p className="text-gray-700 font-medium text-lg">{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center gap-3">
        <SpinnerIcon />
        <span className="text-gray-700 font-medium">{text}</span>
      </div>
    );
  }

  return <SpinnerIcon />;
};

/**
 * ButtonSpinner Component
 * Small spinner for button loading states
 */
export const ButtonSpinner = ({ className = '' }) => (
  <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
);

/**
 * PageSpinner Component
 * Centered spinner for page loading
 */
export const PageSpinner = ({ text = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
    <p className="text-gray-600 font-medium">{text}</p>
  </div>
);

/**
 * InlineSpinner Component
 * Small inline spinner for inline loading states
 */
export const InlineSpinner = ({ text = '', className = '' }) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
);

/**
 * CardSpinner Component
 * Spinner for card/container loading states
 */
export const CardSpinner = ({ text = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full p-6 mb-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
    <p className="text-gray-600 font-medium">{text}</p>
  </div>
);

/**
 * DotSpinner Component
 * Animated dots spinner
 */
export const DotSpinner = ({ className = '' }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

/**
 * PulseSpinner Component
 * Pulsing circle spinner
 */
export const PulseSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping opacity-75"></div>
      <div className="relative bg-indigo-600 rounded-full w-full h-full"></div>
    </div>
  );
};

export default Spinner;