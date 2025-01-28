'use client';

import {ReactNode} from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  animate?: boolean;
};

export function Card({children, className = '', animate = false}: CardProps) {
  return (
    <div 
      className={`
        bg-gray-900/50 backdrop-blur-sm border border-gray-800 
        p-6 transition-all duration-300
        ${animate ? 'hover:border-orange-500/50 hover:shadow-orange-500/10 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function CardHeader({children, className = ''}: CardHeaderProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({children, className = ''}: CardHeaderProps) {
  return (
    <h3 className={`text-2xl font-bold ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({children, className = ''}: CardHeaderProps) {
  return (
    <p className={`text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({children, className = ''}: CardHeaderProps) {
  return (
    <div className={`pt-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({children, className = ''}: CardHeaderProps) {
  return (
    <div className={`flex items-center pt-6 ${className}`}>
      {children}
    </div>
  );
} 