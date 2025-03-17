import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export function Button({ 
  children, 
  variant = 'primary', 
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props 
}: ButtonProps) {
  const baseClass = variant === 'primary' ? 'btn-primary' :
                   variant === 'secondary' ? 'btn-secondary' :
                   variant === 'success' ? 'btn-success' :
                   'btn-danger';

  return (
    <button 
      className={`${baseClass} inline-flex items-center gap-2 ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
}