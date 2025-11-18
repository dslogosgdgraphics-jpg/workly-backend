import { User } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={cn(
        'rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold overflow-hidden',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : name ? (
        <span className="text-sm">{getInitials(name)}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  );
}