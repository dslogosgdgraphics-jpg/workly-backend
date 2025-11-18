import { cn } from '../../utils/helpers';

export default function Input({ 
  label, 
  error, 
  icon: Icon,
  className,
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-2 border border-gray-300 rounded-lg',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors',
            error && 'border-red-500 focus:ring-red-500',
            Icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}