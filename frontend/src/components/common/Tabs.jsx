import React, { useState } from 'react';

/**
 * Tabs Component
 * Customizable tabbed navigation
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tabs { id, label, icon?, count?, disabled? }
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onChange - Tab change handler
 * @param {string} props.variant - Style variant: 'default' | 'pills' | 'underline' | 'boxed'
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullWidth - Make tabs full width
 */
const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = '',
  fullWidth = false
}) => {
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-6 py-3'
  };

  const getVariantClasses = (isActive, tab) => {
    const baseClasses = `
      inline-flex items-center gap-2 font-semibold transition-all duration-200
      ${sizes[size]}
      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${fullWidth ? 'flex-1 justify-center' : ''}
    `;

    switch (variant) {
      case 'pills':
        return `
          ${baseClasses}
          rounded-lg
          ${isActive 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `;
      
      case 'underline':
        return `
          ${baseClasses}
          border-b-2 rounded-none
          ${isActive 
            ? 'border-indigo-600 text-indigo-600' 
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }
        `;
      
      case 'boxed':
        return `
          ${baseClasses}
          border-2 rounded-lg
          ${isActive 
            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }
        `;
      
      default: // default variant
        return `
          ${baseClasses}
          rounded-t-lg border-b-2
          ${isActive 
            ? 'bg-white border-indigo-600 text-indigo-600' 
            : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `;
    }
  };

  const containerClasses = {
    default: 'border-b border-gray-200 bg-gray-50',
    pills: 'bg-gray-100 p-1 rounded-lg',
    underline: 'border-b border-gray-200',
    boxed: 'gap-2'
  };

  return (
    <div className={`${className}`}>
      <div className={`
        flex ${fullWidth ? '' : 'gap-1'}
        overflow-x-auto scrollbar-hide
        ${containerClasses[variant]}
      `}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={getVariantClasses(isActive, tab)}
              aria-selected={isActive}
              role="tab"
            >
              {tab.icon && (
                <span className="flex-shrink-0">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`
                  inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                  text-xs font-bold rounded-full
                  ${isActive 
                    ? variant === 'pills' 
                      ? 'bg-white text-indigo-600' 
                      : 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * TabPanel Component
 * Container for tab content with fade animation
 */
export const TabPanel = ({ children, value, activeValue, className = '' }) => {
  if (value !== activeValue) return null;

  return (
    <div 
      className={`animate-fadeIn ${className}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
};

/**
 * TabsWithContent Component
 * Complete tabs system with content panels
 */
export const TabsWithContent = ({ 
  tabs, 
  variant = 'default', 
  size = 'md',
  className = '',
  defaultTab = null
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={className}>
      <Tabs
        tabs={tabs.map(({ id, label, icon, count, disabled }) => ({ 
          id, label, icon, count, disabled 
        }))}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant={variant}
        size={size}
      />
      
      <div className="mt-6">
        {tabs.map((tab) => (
          <TabPanel key={tab.id} value={tab.id} activeValue={activeTab}>
            {tab.content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
};

/**
 * VerticalTabs Component
 * Vertical orientation tabs
 */
export const VerticalTabs = ({ 
  tabs, 
  activeTab, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-sm font-semibold transition-all duration-200
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' 
                : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }
            `}
          >
            {tab.icon && (
              <span className="flex-shrink-0">
                {tab.icon}
              </span>
            )}
            <span className="flex-1 text-left">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`
                inline-flex items-center justify-center min-w-[24px] h-6 px-2
                text-xs font-bold rounded-full
                ${isActive 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;