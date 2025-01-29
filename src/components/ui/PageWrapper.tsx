'use client';

import {ReactNode} from 'react';
import {usePathname} from '@/navigation';
import Image from 'next/image';
import {PageNavigation} from './PageNavigation';

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function PageWrapper({children, className = ''}: PageWrapperProps) {
  return (
    <div 
      className={`
        h-[calc(100vh-64px)] w-full bg-gradient-to-b from-gray-900 to-black
        px-4 flex flex-col
        ${className}
      `}
    >
      <div className="container mx-auto max-w-6xl flex-1 relative">
        <div className="relative h-full">
          {/* Background Gradient */}
          <div 
            className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] 
              bg-orange-500/20 rounded-full blur-3xl opacity-20 pointer-events-none"
          />
          
          {/* Content */}
          <div className="relative h-full">
            {children}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <PageNavigation />

      {/* Tehnopol Logo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <Image
          src="/Tehnopol_logo_RGB.png"
          alt="Tehnopol"
          width={120}
          height={40}
          style={{ objectFit: 'contain' }}
          className="opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
} 