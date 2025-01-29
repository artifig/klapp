'use client';

import {ReactNode} from 'react';
import Image from 'next/image';

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function PageWrapper({children, className = ''}: PageWrapperProps) {
  return (
    <div 
      className={`
        flex-1 flex flex-col px-4 py-6
        ${className}
      `}
    >
      {/* Main Content Area with Bottom Padding for Logo */}
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col pb-20">
        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

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