'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface MenuToggleIconProps extends React.SVGAttributes<SVGSVGElement> {
  open?: boolean;
  duration?: number;
  className?: string;
}

export function MenuToggleIcon({
  open = false,
  duration = 300,
  className,
  ...props
}: MenuToggleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('transition-all', className)}
      {...props}
    >
      <line
        x1="4"
        y1={open ? '12' : '6'}
        x2="20"
        y2={open ? '12' : '6'}
        style={{
          transitionDuration: `${duration}ms`,
          transformOrigin: '12px 12px',
          transform: open ? 'rotate(45deg)' : 'none',
          transitionProperty: 'transform, y1, y2',
        }}
      />
      <line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        style={{
          transitionDuration: `${duration}ms`,
          opacity: open ? 0 : 1,
          transitionProperty: 'opacity',
        }}
      />
      <line
        x1="4"
        y1={open ? '12' : '18'}
        x2="20"
        y2={open ? '12' : '18'}
        style={{
          transitionDuration: `${duration}ms`,
          transformOrigin: '12px 12px',
          transform: open ? 'rotate(-45deg)' : 'none',
          transitionProperty: 'transform, y1, y2',
        }}
      />
    </svg>
  );
}
