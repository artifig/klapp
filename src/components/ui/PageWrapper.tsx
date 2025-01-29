'use client';

import {ReactNode} from 'react';
import {usePathname} from '@/navigation';

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function PageWrapper({children, className = ''}: PageWrapperProps) {
  return (
    <div 
      className={`
        min-h-screen w-full bg-gradient-to-b from-gray-900 to-black
        px-4 py-8 md:py-12
        ${className}
      `}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="relative">
          {/* Background Gradient */}
          <div 
            className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] 
              bg-orange-500/20 rounded-full blur-3xl opacity-20 pointer-events-none"
          />
          
          {/* Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 