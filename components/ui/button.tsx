import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48C9A4]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-2.5 gap-2.5 h-12',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#48C9A4] text-[#0B111B] font-semibold hover:bg-[#35B58D] active:bg-[#2fa07b]',
    secondary:
      'bg-[#172233] text-[#E6EDF5] border border-[#273548] hover:bg-[#1e2b3e] hover:border-[#38495f]',
    outline:
      'bg-transparent text-[#E6EDF5] border border-[#273548] hover:bg-[#172233]',
    ghost:
      'bg-transparent text-[#9BAABD] hover:text-[#E6EDF5] hover:bg-[#172233]',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
