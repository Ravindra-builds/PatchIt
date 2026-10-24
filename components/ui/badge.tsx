import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'amber' | 'slate' | 'rose' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'slate', className = '' }: BadgeProps) {
  const variantStyles = {
    teal: 'bg-[#48C9A4]/10 text-[#48C9A4] border-[#48C9A4]/30',
    amber: 'bg-[#E8B66A]/10 text-[#E8B66A] border-[#E8B66A]/30',
    slate: 'bg-[#172233] text-[#9BAABD] border-[#273548]',
    rose: 'bg-[#F08080]/10 text-[#F08080] border-[#F08080]/30',
    blue: 'bg-[#8AB8F9]/10 text-[#8AB8F9] border-[#8AB8F9]/30',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-wide uppercase border font-medium ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
