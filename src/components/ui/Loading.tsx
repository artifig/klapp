'use client';

import React from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton';
  type?: 'card' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div 
      role="status"
      aria-label="Loading"
      className={`inline-block ${className}`}
    >
      <div 
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-[3px]
          border-[#FF6600]/20
          border-t-[#FF6600]
          animate-spinner
          transition-standard
        `}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
};

const Skeleton = ({ type = 'card' }: { type?: 'card' | 'full' }) => {
  if (type === 'full') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};

export const Loading = ({ variant = 'skeleton', type = 'card', size = 'md', className = '' }: LoadingProps) => {
  if (variant === 'spinner') {
    return <Spinner size={size} className={className} />;
  }

  return <Skeleton type={type} />;
}; 