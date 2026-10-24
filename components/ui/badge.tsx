import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'warning' | 'neutral' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantStyles = {
    accent: 'bg-accent-soft text-accent-strong border-accent-border',
    warning: 'bg-warning-soft text-warning border-warning-border',
    neutral: 'bg-subtle text-muted border-border',
    danger: 'bg-danger-soft text-danger border-danger-border',
    info: 'bg-info-soft text-info border-info-border',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
