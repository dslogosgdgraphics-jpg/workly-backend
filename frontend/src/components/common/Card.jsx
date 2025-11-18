import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export default function Card({ 
  children, 
  title, 
  subtitle,
  action,
  className,
  hover = false,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200',
        hover && 'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}