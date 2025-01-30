import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '' 
}) => {
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
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 