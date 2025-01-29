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
        min-h-screen w-full bg-gradient-to-b from-gray-900 to-black
        px-4 py-8 md:py-12 relative
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

      {/* Navigation */}
      <PageNavigation />

      {/* Tehnopol Logo */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
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