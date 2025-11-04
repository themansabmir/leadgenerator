/**
 * Loading Spinner Component
 * Reusable loading indicator following functional component principles
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Loading spinner props
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}

/**
 * Size variants for the spinner
 */
const sizeVariants = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
} as const;

/**
 * Color variants for the spinner
 */
const colorVariants = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white'
} as const;

/**
 * Loading Spinner Component
 * Pure functional component for loading states
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary'
}) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeVariants[size],
        colorVariants[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Loading Spinner with text
 */
interface LoadingSpinnerWithTextProps extends LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinnerWithText: React.FC<LoadingSpinnerWithTextProps> = ({
  text = 'Loading...',
  size = 'md',
  className,
  color = 'primary'
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size={size} color={color} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};

/**
 * Full page loading spinner
 */
export const FullPageLoader: React.FC<{ text?: string }> = ({ 
  text = 'Loading...' 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};
