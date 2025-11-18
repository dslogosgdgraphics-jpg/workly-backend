import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dropdown Component
 * Customizable dropdown menu with search and multi-select support
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of options { value, label, icon?, disabled? }
 * @param {string|Array} props.value - Selected value(s)
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.multiple - Enable multi-select
 * @param {boolean} props.searchable - Enable search
 * @param {boolean} props.disabled - Disable dropdown
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} props.position - Dropdown position: 'bottom' | 'top'
 */
const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  multiple = false,
  searchable = false,
  disabled = false,
  label = '',
  error = '',
  className = '',
  size = 'md',
  position = 'bottom',
  icon = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = searchable && searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option(s) label
  const getSelectedLabel = () => {
    if (multiple) {
      if (!value || value.length === 0) return placeholder;
      return `${value.length} selected`;
    }
    
    const selected = options.find((opt) => opt.value === value);
    return selected ? selected.label : placeholder;
  };

  // Handle option selection
  const handleSelect = (optionValue) => {
    if (multiple) {
      const newValue = value?.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...(value || []), optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Check if option is selected
  const isSelected = (optionValue) => {
    if (multiple) {
      return value?.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2
          bg-white border rounded-lg
          transition-all duration-200
          ${sizes[size]}
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-gray-400 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
        `}
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className={value ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            {getSelectedLabel()}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 w-full mt-2 
            bg-white border border-gray-200 rounded-lg shadow-xl
            max-h-64 overflow-hidden
            ${position === 'top' ? 'bottom-full mb-2' : 'top-full'}
          `}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-56 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm
                    flex items-center justify-between gap-2
                    transition-colors duration-150
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected(option.value) 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {option.icon && (
                      <span className="text-gray-500">{option.icon}</span>
                    )}
                    <span>{option.label}</span>
                  </div>
                  {isSelected(option.value) && (
                    <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Multi-select footer */}
          {multiple && value && value.length > 0 && (
            <div className="border-t border-gray-200 p-2 bg-gray-50">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Clear All ({value.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * SimpleDropdown Component
 * Simplified dropdown without advanced features
 */
export const SimpleDropdown = ({ options, value, onChange, placeholder, className = '' }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full px-4 py-2 border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        bg-white text-gray-900 font-medium
        ${className}
      `}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;